import {
  bigint,
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isAgent: boolean("isAgent").default(false).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Connected Accounts (WhatsApp / Instagram / Email) ───────────────────────
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  channel: mysqlEnum("channel", ["whatsapp", "instagram", "email"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  identifier: varchar("identifier", { length: 320 }).notNull(), // phone / @handle / email address
  status: mysqlEnum("status", ["connecting", "connected", "disconnected", "error"]).default("disconnected").notNull(),
  // WhatsApp specific
  waSessionData: text("waSessionData"), // serialized session (JSON string)
  waQrCode: text("waQrCode"),           // current QR code (base64)
  // Instagram specific
  igAccessToken: text("igAccessToken"),
  igUserId: varchar("igUserId", { length: 64 }),
  // Email specific
  imapHost: varchar("imapHost", { length: 255 }),
  imapPort: int("imapPort"),
  imapUser: varchar("imapUser", { length: 320 }),
  imapPassword: text("imapPassword"),
  smtpHost: varchar("smtpHost", { length: 255 }),
  smtpPort: int("smtpPort"),
  smtpUser: varchar("smtpUser", { length: 320 }),
  smtpPassword: text("smtpPassword"),
  smtpSecure: boolean("smtpSecure").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 64 }),
  igHandle: varchar("igHandle", { length: 128 }),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// ─── Conversations ─────────────────────────────────────────────────────────────
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  contactId: int("contactId"),
  channel: mysqlEnum("channel", ["whatsapp", "instagram", "email"]).notNull(),
  externalId: varchar("externalId", { length: 512 }), // chat JID / thread ID / email thread
  subject: varchar("subject", { length: 512 }),       // email subject
  status: mysqlEnum("status", ["open", "pending", "resolved", "snoozed"]).default("open").notNull(),
  assignedAgentId: int("assignedAgentId"),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  unreadCount: int("unreadCount").default(0).notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  externalId: varchar("externalId", { length: 512 }),
  direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
  type: mysqlEnum("type", ["text", "image", "audio", "video", "document", "sticker", "location", "template"]).default("text").notNull(),
  content: text("content"),
  mediaUrl: text("mediaUrl"),
  metadata: json("metadata"),
  senderName: varchar("senderName", { length: 255 }),
  senderAgentId: int("senderAgentId"),
  isRead: boolean("isRead").default(false).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Tickets ──────────────────────────────────────────────────────────────────
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  assignedAgentId: int("assignedAgentId"),
  createdById: int("createdById").notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

// ─── Queue (Fila de Atendimento) ──────────────────────────────────────────────
export const queue = mysqlTable("queue", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  position: int("position").notNull(),
  assignedAgentId: int("assignedAgentId"),
  status: mysqlEnum("status", ["waiting", "assigned", "completed"]).default("waiting").notNull(),
  waitingSince: timestamp("waitingSince").defaultNow().notNull(),
  assignedAt: timestamp("assignedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Queue = typeof queue.$inferSelect;
export type InsertQueue = typeof queue.$inferInsert;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["new_message", "ticket_assigned", "ticket_resolved", "queue_assigned", "mention"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  isRead: boolean("isRead").default(false).notNull(),
  relatedConversationId: int("relatedConversationId"),
  relatedTicketId: int("relatedTicketId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─── Tags ─────────────────────────────────────────────────────────────────────
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  color: varchar("color", { length: 16 }).default("#6366f1").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const conversationTags = mysqlTable("conversationTags", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  tagId: int("tagId").notNull(),
});
