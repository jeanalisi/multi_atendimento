import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { createConversation, createMessage, updateAccount, upsertContact } from "./db";
import type { Account } from "../drizzle/schema";

export async function testImapConnection(account: Account): Promise<{ ok: boolean; error?: string }> {
  if (!account.imapHost || !account.imapUser || !account.imapPassword) {
    return { ok: false, error: "Credenciais IMAP incompletas (host, usuário ou senha ausentes)" };
  }
  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort ?? 993,
    secure: (account.imapPort ?? 993) === 993,
    auth: { user: account.imapUser, pass: account.imapPassword },
    logger: false,
  });
  try {
    await client.connect();
    await client.logout();
    return { ok: true };
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    let hint = msg;
    if (msg.includes("ECONNREFUSED")) hint = `Conexão recusada em ${account.imapHost}:${account.imapPort ?? 993}. Verifique o host e a porta.`;
    else if (msg.includes("ENOTFOUND")) hint = `Host IMAP não encontrado: "${account.imapHost}". Verifique o endereço.`;
    else if (msg.includes("ETIMEDOUT")) hint = `Timeout ao conectar em ${account.imapHost}. Verifique firewall ou porta.`;
    else if (msg.includes("Invalid credentials") || msg.includes("AUTHENTICATIONFAILED")) hint = "Credenciais IMAP inválidas. Para Gmail, use uma Senha de App (não a senha normal).";
    else if (msg.includes("self signed") || msg.includes("certificate")) hint = "Erro de certificado SSL. Tente desativar SSL ou use a porta 143.";
    return { ok: false, error: hint };
  }
}

export async function testSmtpConnection(account: Account): Promise<{ ok: boolean; error?: string }> {
  if (!account.smtpHost || !account.smtpUser || !account.smtpPassword) {
    return { ok: false, error: "Credenciais SMTP incompletas (host, usuário ou senha ausentes)" };
  }
  const transporter = nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort ?? 587,
    secure: account.smtpSecure ?? false,
    auth: { user: account.smtpUser, pass: account.smtpPassword },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });
  try {
    await transporter.verify();
    return { ok: true };
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    let hint = msg;
    if (msg.includes("ECONNREFUSED")) hint = `Conexão recusada em ${account.smtpHost}:${account.smtpPort ?? 587}. Verifique o host e a porta.`;
    else if (msg.includes("ENOTFOUND")) hint = `Host SMTP não encontrado: "${account.smtpHost}". Verifique o endereço.`;
    else if (msg.includes("ETIMEDOUT")) hint = `Timeout ao conectar em ${account.smtpHost}. Verifique firewall ou porta.`;
    else if (msg.includes("Invalid login") || msg.includes("535") || msg.includes("Authentication")) hint = "Credenciais SMTP inválidas. Para Gmail, use uma Senha de App (não a senha normal).";
    else if (msg.includes("self signed") || msg.includes("certificate")) hint = "Erro de certificado SSL/TLS. Tente a porta 587 com STARTTLS.";
    return { ok: false, error: hint };
  }
}

export async function fetchEmails(account: Account): Promise<void> {
  if (!account.imapHost || !account.imapUser || !account.imapPassword) return;

  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort ?? 993,
    secure: (account.imapPort ?? 993) === 993,
    auth: { user: account.imapUser, pass: account.imapPassword },
    logger: false,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      for await (const msg of client.fetch("1:10", { envelope: true, bodyStructure: true, source: true })) {
        const from = msg.envelope?.from?.[0];
        const fromEmail = from?.address ?? "";
        const fromName = from?.name ?? fromEmail;
        const subject = msg.envelope?.subject ?? "(sem assunto)";
        const msgId = msg.envelope?.messageId ?? String(msg.uid);

        const contactId = await upsertContact({ name: fromName, email: fromEmail });
        const convId = await createConversation({
          accountId: account.id,
          contactId,
          channel: "email",
          externalId: msgId,
          subject,
          status: "open",
          lastMessageAt: msg.envelope?.date ?? new Date(),
        });

        await createMessage({
          conversationId: convId,
          externalId: msgId,
          direction: "inbound",
          type: "text",
          content: `[E-mail] ${subject}`,
          senderName: fromName,
          sentAt: msg.envelope?.date ?? new Date(),
        });
      }
    } finally {
      lock.release();
    }
    await client.logout();
    await updateAccount(account.id, { status: "connected" });
  } catch (err) {
    console.error("[Email] Fetch error:", err);
    await updateAccount(account.id, { status: "error" });
  }
}

export async function sendEmail(
  account: Account,
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> {
  if (!account.smtpHost || !account.smtpUser || !account.smtpPassword) {
    throw new Error("SMTP não configurado para esta conta. Configure host, usuário e senha SMTP.");
  }
  const transporter = nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort ?? 587,
    secure: account.smtpSecure ?? false,
    auth: { user: account.smtpUser, pass: account.smtpPassword },
    connectionTimeout: 15000,
  });
  await transporter.sendMail({
    from: `"${account.name}" <${account.smtpUser}>`,
    to,
    subject,
    text,
    html,
  });
}
