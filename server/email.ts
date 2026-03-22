import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { createConversation, createMessage, updateAccount, upsertContact } from "./db";
import type { Account } from "../drizzle/schema";

export async function testImapConnection(account: Account): Promise<boolean> {
  if (!account.imapHost || !account.imapUser || !account.imapPassword) return false;
  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort ?? 993,
    secure: true,
    auth: { user: account.imapUser, pass: account.imapPassword },
    logger: false,
  });
  try {
    await client.connect();
    await client.logout();
    return true;
  } catch {
    return false;
  }
}

export async function testSmtpConnection(account: Account): Promise<boolean> {
  if (!account.smtpHost || !account.smtpUser || !account.smtpPassword) return false;
  const transporter = nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort ?? 587,
    secure: account.smtpSecure ?? false,
    auth: { user: account.smtpUser, pass: account.smtpPassword },
  });
  try {
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}

export async function fetchEmails(account: Account): Promise<void> {
  if (!account.imapHost || !account.imapUser || !account.imapPassword) return;

  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort ?? 993,
    secure: true,
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
    throw new Error("SMTP not configured for this account");
  }
  const transporter = nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort ?? 587,
    secure: account.smtpSecure ?? false,
    auth: { user: account.smtpUser, pass: account.smtpPassword },
  });
  await transporter.sendMail({
    from: `"${account.name}" <${account.smtpUser}>`,
    to,
    subject,
    text,
    html,
  });
}
