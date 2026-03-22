import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { createConversation, createMessage, updateAccount, upsertContact } from "./db";
import type { Account } from "../drizzle/schema";

// Build TLS options that are permissive enough for self-signed certs and
// corporate mail servers that use non-standard certificates.
function tlsOptions() {
  return {
    rejectUnauthorized: false,
    minVersion: "TLSv1" as const,
  };
}

// Determine whether SMTP connection should use implicit TLS (port 465) or
// STARTTLS (port 587/25).  When smtpSecure is explicitly set we honour it;
// otherwise we infer from the port.
function smtpSecure(account: Account): boolean {
  if (account.smtpSecure !== null && account.smtpSecure !== undefined) {
    return account.smtpSecure;
  }
  return (account.smtpPort ?? 587) === 465;
}

function imapSecure(account: Account): boolean {
  const port = account.imapPort ?? 993;
  return port === 993;
}

export async function testImapConnection(account: Account): Promise<{ ok: boolean; error?: string }> {
  if (!account.imapHost || !account.imapUser || !account.imapPassword) {
    return { ok: false, error: "Credenciais IMAP incompletas (host, usuário ou senha ausentes)" };
  }
  const secure = imapSecure(account);
  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort ?? 993,
    secure,
    auth: { user: account.imapUser, pass: account.imapPassword },
    tls: tlsOptions(),
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
    else if (msg.includes("ETIMEDOUT") || msg.includes("ESOCKETTIMEDOUT")) hint = `Timeout ao conectar em ${account.imapHost}. Verifique firewall ou porta.`;
    else if (msg.includes("Invalid credentials") || msg.includes("AUTHENTICATIONFAILED") || msg.includes("535")) hint = "Credenciais IMAP inválidas. Para Gmail, use uma Senha de App (não a senha normal). Para Outlook, habilite IMAP nas configurações da conta.";
    else if (msg.includes("self signed") || msg.includes("certificate") || msg.includes("CERT")) hint = "Erro de certificado SSL. A conexão foi forçada com TLS permissivo — tente novamente.";
    else if (msg.includes("STARTTLS") || msg.includes("starttls")) hint = "Servidor requer STARTTLS. Tente a porta 143 com SSL desativado.";
    return { ok: false, error: hint };
  }
}

export async function testSmtpConnection(account: Account): Promise<{ ok: boolean; error?: string }> {
  if (!account.smtpHost || !account.smtpUser || !account.smtpPassword) {
    return { ok: false, error: "Credenciais SMTP incompletas (host, usuário ou senha ausentes)" };
  }
  const secure = smtpSecure(account);
  const transporter = nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort ?? 587,
    secure,
    auth: { user: account.smtpUser, pass: account.smtpPassword },
    tls: tlsOptions(),
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });
  try {
    await transporter.verify();
    return { ok: true };
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    let hint = msg;
    if (msg.includes("ECONNREFUSED")) hint = `Conexão recusada em ${account.smtpHost}:${account.smtpPort ?? 587}. Verifique o host e a porta.`;
    else if (msg.includes("ENOTFOUND")) hint = `Host SMTP não encontrado: "${account.smtpHost}". Verifique o endereço.`;
    else if (msg.includes("ETIMEDOUT") || msg.includes("ESOCKETTIMEDOUT")) hint = `Timeout ao conectar em ${account.smtpHost}. Verifique firewall ou porta.`;
    else if (msg.includes("Invalid login") || msg.includes("535") || msg.includes("Authentication") || msg.includes("Username and Password")) hint = "Credenciais SMTP inválidas. Para Gmail, use uma Senha de App. Para Outlook/Office 365, habilite SMTP AUTH nas configurações da conta.";
    else if (msg.includes("self signed") || msg.includes("certificate") || msg.includes("CERT")) hint = "Erro de certificado SSL/TLS. A conexão foi forçada com TLS permissivo — tente novamente.";
    else if (msg.includes("STARTTLS") || msg.includes("starttls")) hint = "Servidor requer STARTTLS. Use a porta 587 com SSL desativado.";
    else if (msg.includes("5.7.57") || msg.includes("Client not authenticated")) hint = "Autenticação SMTP bloqueada. Para Office 365, habilite 'Authenticated SMTP' no Admin Center.";
    return { ok: false, error: hint };
  }
}

export async function fetchEmails(account: Account): Promise<void> {
  if (!account.imapHost || !account.imapUser || !account.imapPassword) return;

  const secure = imapSecure(account);
  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort ?? 993,
    secure,
    auth: { user: account.imapUser, pass: account.imapPassword },
    tls: tlsOptions(),
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
        const msgSubject = msg.envelope?.subject ?? "(sem assunto)";
        const msgId = msg.envelope?.messageId ?? String(msg.uid);

        const contactId = await upsertContact({ name: fromName, email: fromEmail });
        const convId = await createConversation({
          accountId: account.id,
          contactId,
          channel: "email",
          externalId: msgId,
          subject: msgSubject,
          status: "open",
          lastMessageAt: msg.envelope?.date ?? new Date(),
        });

        await createMessage({
          conversationId: convId,
          externalId: msgId,
          direction: "inbound",
          type: "text",
          content: `[E-mail] ${msgSubject}`,
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
  const secure = smtpSecure(account);
  const transporter = nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort ?? 587,
    secure,
    auth: { user: account.smtpUser, pass: account.smtpPassword },
    tls: tlsOptions(),
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });
  await transporter.sendMail({
    from: `"${account.name}" <${account.smtpUser}>`,
    to,
    subject,
    text,
    html,
  });
}
