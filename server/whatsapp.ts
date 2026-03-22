import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import * as fs from "fs";
import * as path from "path";
import { getDb } from "./db";
import {
  updateAccount,
  createMessage,
  upsertContact,
} from "./db";
import { conversations } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { generateNup, createProtocol } from "./db-caius";

const sessions = new Map<number, ReturnType<typeof makeWASocket>>();
const qrCallbacks = new Map<number, (qr: string) => void>();
const statusCallbacks = new Map<number, (status: string) => void>();

const SESSION_DIR = path.join(process.cwd(), ".wa-sessions");
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

export function onQrCode(accountId: number, cb: (qr: string) => void) {
  qrCallbacks.set(accountId, cb);
}

export function onStatusChange(accountId: number, cb: (status: string) => void) {
  statusCallbacks.set(accountId, cb);
}

/**
 * Busca ou cria uma conversa pelo externalId (JID).
 * Se for nova, gera NUP, cria protocolo vinculado e envia mensagem de boas-vindas.
 */
async function findOrCreateConversation(
  accountId: number,
  jid: string,
  contactId: number,
  senderName: string,
  sock: ReturnType<typeof makeWASocket>
): Promise<{ convId: number; isNew: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  // Verificar se já existe conversa aberta para este JID
  const existing = await db
    .select({ id: conversations.id, nup: conversations.nup })
    .from(conversations)
    .where(
      and(
        eq(conversations.accountId, accountId),
        eq(conversations.externalId, jid),
        eq(conversations.channel, "whatsapp")
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { convId: existing[0]!.id, isNew: false };
  }

  // Nova conversa — gerar NUP
  const nup = await generateNup();

  // Criar conversa com NUP
  const result = await db.insert(conversations).values({
    accountId,
    contactId,
    channel: "whatsapp",
    externalId: jid,
    nup,
    status: "open",
    subject: `Atendimento via WhatsApp — ${senderName}`,
    lastMessageAt: new Date(),
  });
  const convId = Number((result[0] as any).insertId);

  // Criar protocolo vinculado à conversa
  try {
    await createProtocol({
      conversationId: convId,
      contactId,
      subject: `Atendimento via WhatsApp — ${senderName}`,
      requesterName: senderName,
      requesterPhone: jid.split("@")[0],
      type: "request",
      channel: "whatsapp",
      status: "open",
      priority: "normal",
      isConfidential: false,
    });
  } catch (err) {
    console.error("[WhatsApp] Erro ao criar protocolo automático:", err);
  }

  // Enviar mensagem de boas-vindas com NUP
  const welcomeMsg =
    `Olá, ${senderName}! Recebemos sua mensagem.\n\n` +
    `Seu número de protocolo é: *${nup}*\n\n` +
    `Em breve um atendente irá lhe responder. Para acompanhar seu atendimento, acesse nossa Central do Cidadão e informe o número do protocolo.`;

  try {
    await sock.sendMessage(jid, { text: welcomeMsg });
    // Registrar mensagem de boas-vindas como outbound
    await createMessage({
      conversationId: convId,
      direction: "outbound",
      type: "text",
      content: welcomeMsg,
      senderName: "Sistema",
      deliveryStatus: "sent",
    });
  } catch (err) {
    console.error("[WhatsApp] Erro ao enviar mensagem de boas-vindas:", err);
  }

  return { convId, isNew: true };
}

export async function connectWhatsApp(accountId: number) {
  const sessionPath = path.join(SESSION_DIR, `account-${accountId}`);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ["OmniChannel", "Chrome", "1.0"],
  });

  sessions.set(accountId, sock);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      const QRCode = await import("qrcode");
      const qrDataUrl = await QRCode.toDataURL(qr);
      await updateAccount(accountId, { waQrCode: qrDataUrl, status: "connecting" });
      qrCallbacks.get(accountId)?.(qrDataUrl);
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      await updateAccount(accountId, { status: "disconnected", waQrCode: null });
      statusCallbacks.get(accountId)?.("disconnected");
      sessions.delete(accountId);
      if (shouldReconnect) {
        setTimeout(() => connectWhatsApp(accountId), 5000);
      }
    } else if (connection === "open") {
      await updateAccount(accountId, { status: "connected", waQrCode: null });
      statusCallbacks.get(accountId)?.("connected");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages: msgs, type }) => {
    if (type !== "notify") return;
    for (const msg of msgs) {
      if (msg.key.fromMe) continue;
      const jid = msg.key.remoteJid ?? "";
      // Ignorar mensagens de grupo
      if (jid.endsWith("@g.us")) continue;

      const content =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "[media]";
      const senderName = msg.pushName ?? jid.split("@")[0];
      const sentAt = new Date((msg.messageTimestamp as number) * 1000);

      try {
        // Upsert contact
        const contactId = await upsertContact({
          name: senderName,
          phone: jid.split("@")[0],
        });

        // Find or create conversation (com NUP automático para novas conversas)
        const { convId } = await findOrCreateConversation(
          accountId,
          jid,
          contactId,
          senderName,
          sock
        );

        // Registrar mensagem recebida
        await createMessage({
          conversationId: convId,
          externalId: msg.key.id ?? undefined,
          direction: "inbound",
          type: "text",
          content,
          senderName,
          sentAt,
          deliveryStatus: "delivered",
        });

        // Atualizar lastMessageAt da conversa
        const db = await getDb();
        if (db) {
          await db
            .update(conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(conversations.id, convId));
        }
      } catch (err) {
        console.error("[WhatsApp] Erro ao processar mensagem recebida:", err);
      }
    }
  });

  return sock;
}

export async function disconnectWhatsApp(accountId: number) {
  const sock = sessions.get(accountId);
  if (sock) {
    await sock.logout();
    sessions.delete(accountId);
  }
  await updateAccount(accountId, { status: "disconnected", waQrCode: null });
}

export async function sendWhatsAppMessage(accountId: number, jid: string, text: string) {
  const sock = sessions.get(accountId);
  if (!sock) throw new Error("WhatsApp session not active for this account");
  await sock.sendMessage(jid, { text });
}

export function getSessionStatus(accountId: number): "connected" | "disconnected" {
  const sock = sessions.get(accountId);
  return sock ? "connected" : "disconnected";
}
