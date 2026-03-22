import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import * as fs from "fs";
import * as path from "path";
import { updateAccount, createConversation, createMessage, upsertContact } from "./db";

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
      const content =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "[media]";
      const senderName = msg.pushName ?? jid.split("@")[0];

      // Upsert contact
      const contactId = await upsertContact({
        name: senderName,
        phone: jid.split("@")[0],
      });

      // Create conversation (simplified - in production, check for existing)
      const convId = await createConversation({
        accountId,
        contactId,
        channel: "whatsapp",
        externalId: jid,
        status: "open",
        lastMessageAt: new Date(),
      });

      await createMessage({
        conversationId: convId,
        externalId: msg.key.id ?? undefined,
        direction: "inbound",
        type: "text",
        content,
        senderName,
        sentAt: new Date((msg.messageTimestamp as number) * 1000),
      });
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
