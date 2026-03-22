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
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // CAIUS extended roles
  profile: mysqlEnum("profile", ["citizen", "attendant", "sector_server", "manager", "admin"]).default("attendant").notNull(),
  isAgent: boolean("isAgent").default(false).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  avatarUrl: text("avatarUrl"),
  sectorId: int("sectorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Sectors (Setores / Unidades Administrativas) ─────────────────────────────
export const sectors = mysqlTable("sectors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  description: text("description"),
  parentId: int("parentId"),
  managerId: int("managerId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sector = typeof sectors.$inferSelect;
export type InsertSector = typeof sectors.$inferInsert;

// ─── Connected Accounts (WhatsApp / Instagram / Email) ───────────────────────
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  channel: mysqlEnum("channel", ["whatsapp", "instagram", "email"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  identifier: varchar("identifier", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["connecting", "connected", "disconnected", "error"]).default("disconnected").notNull(),
  waSessionData: text("waSessionData"),
  waQrCode: text("waQrCode"),
  igAccessToken: text("igAccessToken"),
  igUserId: varchar("igUserId", { length: 64 }),
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
  cpfCnpj: varchar("cpfCnpj", { length: 18 }),
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
  nup: varchar("nup", { length: 32 }).unique(),
  accountId: int("accountId").notNull(),
  contactId: int("contactId"),
  channel: mysqlEnum("channel", ["whatsapp", "instagram", "email"]).notNull(),
  externalId: varchar("externalId", { length: 512 }),
  subject: varchar("subject", { length: 512 }),
  status: mysqlEnum("status", ["open", "pending", "resolved", "snoozed"]).default("open").notNull(),
  assignedAgentId: int("assignedAgentId"),
  assignedSectorId: int("assignedSectorId"),
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
  aiGenerated: boolean("aiGenerated").default(false).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Protocols (Protocolo Digital com NUP) ────────────────────────────────────
export const protocols = mysqlTable("protocols", {
  id: int("id").autoincrement().primaryKey(),
  nup: varchar("nup", { length: 32 }).notNull().unique(),
  conversationId: int("conversationId"),
  contactId: int("contactId"),
  // Requester info (for citizens without account)
  requesterName: varchar("requesterName", { length: 255 }),
  requesterEmail: varchar("requesterEmail", { length: 320 }),
  requesterPhone: varchar("requesterPhone", { length: 64 }),
  requesterCpfCnpj: varchar("requesterCpfCnpj", { length: 18 }),
  // Protocol details
  subject: varchar("subject", { length: 512 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["request", "complaint", "information", "suggestion", "praise", "ombudsman", "esic", "administrative"]).default("request").notNull(),
  channel: mysqlEnum("channel", ["whatsapp", "instagram", "email", "web", "phone", "in_person"]).default("web").notNull(),
  status: mysqlEnum("status", ["open", "in_analysis", "pending_docs", "in_progress", "concluded", "archived"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  isConfidential: boolean("isConfidential").default(false).notNull(),
  responsibleSectorId: int("responsibleSectorId"),
  responsibleUserId: int("responsibleUserId"),
  createdById: int("createdById"),
  // Deadline
  deadline: timestamp("deadline"),
  concludedAt: timestamp("concludedAt"),
  // Parent NUP for linked records
  parentNup: varchar("parentNup", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Protocol = typeof protocols.$inferSelect;
export type InsertProtocol = typeof protocols.$inferInsert;

// ─── Tramitations (Tramitação entre Setores) ──────────────────────────────────
export const tramitations = mysqlTable("tramitations", {
  id: int("id").autoincrement().primaryKey(),
  protocolId: int("protocolId").notNull(),
  nup: varchar("nup", { length: 32 }).notNull(),
  fromSectorId: int("fromSectorId"),
  toSectorId: int("toSectorId"),
  fromUserId: int("fromUserId"),
  toUserId: int("toUserId"),
  action: mysqlEnum("action", ["forward", "return", "assign", "conclude", "archive", "reopen", "comment"]).notNull(),
  dispatch: text("dispatch"),
  attachments: json("attachments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tramitation = typeof tramitations.$inferSelect;
export type InsertTramitation = typeof tramitations.$inferInsert;

// ─── Official Documents (Documentos Oficiais) ─────────────────────────────────
export const officialDocuments = mysqlTable("officialDocuments", {
  id: int("id").autoincrement().primaryKey(),
  nup: varchar("nup", { length: 32 }).unique(),
  protocolId: int("protocolId"),
  processId: int("processId"),
  type: mysqlEnum("type", ["memo", "official_letter", "dispatch", "opinion", "notification", "certificate", "report", "other"]).notNull(),
  number: varchar("number", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content"),
  authorId: int("authorId").notNull(),
  sectorId: int("sectorId"),
  status: mysqlEnum("status", ["draft", "pending_signature", "signed", "published", "archived"]).default("draft").notNull(),
  isConfidential: boolean("isConfidential").default(false).notNull(),
  aiGenerated: boolean("aiGenerated").default(false).notNull(),
  fileUrl: text("fileUrl"),
  issuedAt: timestamp("issuedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OfficialDocument = typeof officialDocuments.$inferSelect;
export type InsertOfficialDocument = typeof officialDocuments.$inferInsert;

// ─── Administrative Processes (Processos Administrativos) ─────────────────────
export const adminProcesses = mysqlTable("adminProcesses", {
  id: int("id").autoincrement().primaryKey(),
  nup: varchar("nup", { length: 32 }).notNull().unique(),
  originProtocolNup: varchar("originProtocolNup", { length: 32 }),
  title: varchar("title", { length: 512 }).notNull(),
  type: varchar("type", { length: 128 }).notNull(),
  description: text("description"),
  legalBasis: text("legalBasis"),
  observations: text("observations"),
  decision: text("decision"),
  status: mysqlEnum("status", ["open", "in_analysis", "pending_docs", "in_progress", "concluded", "archived"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  isConfidential: boolean("isConfidential").default(false).notNull(),
  responsibleSectorId: int("responsibleSectorId"),
  responsibleUserId: int("responsibleUserId"),
  createdById: int("createdById").notNull(),
  deadline: timestamp("deadline"),
  concludedAt: timestamp("concludedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminProcess = typeof adminProcesses.$inferSelect;
export type InsertAdminProcess = typeof adminProcesses.$inferInsert;

// ─── Ombudsman Manifestations (Ouvidoria) ─────────────────────────────────────
export const ombudsmanManifestations = mysqlTable("ombudsmanManifestations", {
  id: int("id").autoincrement().primaryKey(),
  nup: varchar("nup", { length: 32 }).notNull().unique(),
  type: mysqlEnum("type", ["complaint", "denounce", "praise", "suggestion", "request", "esic"]).notNull(),
  subject: varchar("subject", { length: 512 }).notNull(),
  description: text("description").notNull(),
  // Requester (can be anonymous)
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  requesterName: varchar("requesterName", { length: 255 }),
  requesterEmail: varchar("requesterEmail", { length: 320 }),
  requesterPhone: varchar("requesterPhone", { length: 64 }),
  requesterCpfCnpj: varchar("requesterCpfCnpj", { length: 18 }),
  isConfidential: boolean("isConfidential").default(false).notNull(),
  status: mysqlEnum("status", ["received", "in_analysis", "in_progress", "answered", "archived"]).default("received").notNull(),
  responsibleSectorId: int("responsibleSectorId"),
  responsibleUserId: int("responsibleUserId"),
  response: text("response"),
  respondedAt: timestamp("respondedAt"),
  deadline: timestamp("deadline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OmbudsmanManifestation = typeof ombudsmanManifestations.$inferSelect;
export type InsertOmbudsmanManifestation = typeof ombudsmanManifestations.$inferInsert;

// ─── Document Templates (Modelos de Documentos) ───────────────────────────────
export const documentTemplates = mysqlTable("documentTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["memo", "official_letter", "dispatch", "opinion", "notification", "certificate", "report", "response", "other"]).notNull(),
  content: text("content").notNull(),
  variables: json("variables"),
  sectorId: int("sectorId"),
  createdById: int("createdById").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = typeof documentTemplates.$inferInsert;

// ─── Electronic Signatures (Assinaturas Eletrônicas) ──────────────────────────
export const electronicSignatures = mysqlTable("electronicSignatures", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  nup: varchar("nup", { length: 32 }),
  signerId: int("signerId").notNull(),
  signerName: varchar("signerName", { length: 255 }).notNull(),
  signerEmail: varchar("signerEmail", { length: 320 }),
  signerRole: varchar("signerRole", { length: 128 }),
  ipAddress: varchar("ipAddress", { length: 64 }),
  documentHash: varchar("documentHash", { length: 256 }),
  signedAt: timestamp("signedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ElectronicSignature = typeof electronicSignatures.$inferSelect;
export type InsertElectronicSignature = typeof electronicSignatures.$inferInsert;

// ─── Audit Logs (Trilha de Auditoria) ─────────────────────────────────────────
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  nup: varchar("nup", { length: 32 }),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  action: varchar("action", { length: 128 }).notNull(),
  entity: varchar("entity", { length: 64 }).notNull(),
  entityId: int("entityId"),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  aiAssisted: boolean("aiAssisted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ─── AI Providers (Provedores de IA) ──────────────────────────────────────────
export const aiProviders = mysqlTable("aiProviders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: mysqlEnum("provider", ["openai", "gemini", "anthropic", "other"]).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  encryptedApiKey: text("encryptedApiKey").notNull(),
  model: varchar("model", { length: 128 }),
  isActive: boolean("isActive").default(true).notNull(),
  allowedProfiles: json("allowedProfiles"),
  allowedSectors: json("allowedSectors"),
  allowedDocTypes: json("allowedDocTypes"),
  retainHistory: boolean("retainHistory").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiProvider = typeof aiProviders.$inferSelect;
export type InsertAiProvider = typeof aiProviders.$inferInsert;

// ─── AI Usage Logs (Logs de Uso de IA) ────────────────────────────────────────
export const aiUsageLogs = mysqlTable("aiUsageLogs", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull(),
  userId: int("userId").notNull(),
  nup: varchar("nup", { length: 32 }),
  entityType: varchar("entityType", { length: 64 }),
  entityId: int("entityId"),
  prompt: text("prompt"),
  response: text("response"),
  action: varchar("action", { length: 128 }),
  tokensUsed: int("tokensUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiUsageLog = typeof aiUsageLogs.$inferSelect;
export type InsertAiUsageLog = typeof aiUsageLogs.$inferInsert;

// ─── Tickets ──────────────────────────────────────────────────────────────────
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  nup: varchar("nup", { length: 32 }),
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

// ─── Queue ────────────────────────────────────────────────────────────────────
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
  type: mysqlEnum("type", ["new_message", "ticket_assigned", "ticket_resolved", "queue_assigned", "mention", "protocol_update", "tramitation", "signature_request"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  isRead: boolean("isRead").default(false).notNull(),
  relatedConversationId: int("relatedConversationId"),
  relatedTicketId: int("relatedTicketId"),
  relatedProtocolId: int("relatedProtocolId"),
  nup: varchar("nup", { length: 32 }),
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

// ─── NUP Counter (Contador para geração de NUP único) ─────────────────────────
export const nupCounter = mysqlTable("nupCounter", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  sequence: int("sequence").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Service Types (Tipos de Atendimento Configuráveis) ───────────────────────
export const serviceTypes = mysqlTable("serviceTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  code: varchar("code", { length: 64 }).unique(),
  initialSectorId: int("initialSectorId"),
  slaResponseHours: int("slaResponseHours"),
  slaConclusionHours: int("slaConclusionHours"),
  secrecyLevel: mysqlEnum("secrecyLevel", ["public", "restricted", "confidential", "secret"]).default("public").notNull(),
  requiresApproval: boolean("requiresApproval").default(false).notNull(),
  canConvertToProcess: boolean("canConvertToProcess").default(false).notNull(),
  allowPublicConsult: boolean("allowPublicConsult").default(true).notNull(),
  requiresSelfie: boolean("requiresSelfie").default(false).notNull(),
  requiresGeolocation: boolean("requiresGeolocation").default(false).notNull(),
  requiresStrongAuth: boolean("requiresStrongAuth").default(false).notNull(),
  defaultResponseTemplateId: int("defaultResponseTemplateId"),
  allowedProfiles: json("allowedProfiles"),
  flowConfig: json("flowConfig"),
   isActive: boolean("isActive").default(true).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  publicationStatus: mysqlEnum("publicationStatus", ["draft", "published", "inactive", "restricted"]).default("draft").notNull(),
  purpose: text("purpose"),
  whoCanRequest: text("whoCanRequest"),
  cost: varchar("cost", { length: 255 }),
  formOfService: varchar("formOfService", { length: 255 }),
  responseChannel: varchar("responseChannel", { length: 255 }),
  importantNotes: text("importantNotes"),
  faq: json("faq"),
  formTemplateId: int("formTemplateId"),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ServiceType = typeof serviceTypes.$inferSelect;
export type InsertServiceType = typeof serviceTypes.$inferInsert;

// ─── Form Templates (Modelos de Formulários Dinâmicos) ────────────────────────
export const formTemplates = mysqlTable("formTemplates", {
  id: int("id").autoincrement().primaryKey(),
  serviceTypeId: int("serviceTypeId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  version: int("version").default(1).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FormTemplate = typeof formTemplates.$inferSelect;
export type InsertFormTemplate = typeof formTemplates.$inferInsert;

// ─── Form Fields (Campos Configuráveis de Formulários) ────────────────────────
export const formFields = mysqlTable("formFields", {
  id: int("id").autoincrement().primaryKey(),
  formTemplateId: int("formTemplateId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  fieldType: mysqlEnum("fieldType", [
    "text", "textarea", "number", "currency", "cpf", "cnpj", "rg", "matricula",
    "email", "phone", "date", "time", "datetime", "address", "cep", "neighborhood",
    "city", "state", "select", "multiselect", "checkbox", "radio", "dependent_list",
    "file_upload", "image", "selfie", "geolocation", "map", "calculated", "hidden",
    "signature", "acknowledgment"
  ]).notNull(),
  placeholder: varchar("placeholder", { length: 255 }),
  helpText: text("helpText"),
  isRequired: boolean("isRequired").default(false).notNull(),
  defaultValue: text("defaultValue"),
  mask: varchar("mask", { length: 128 }),
  maxLength: int("maxLength"),
  validationRegex: varchar("validationRegex", { length: 512 }),
  options: json("options"),
  conditionalRule: json("conditionalRule"),
  visibleToProfiles: json("visibleToProfiles"),
  editableByProfiles: json("editableByProfiles"),
  isReadOnly: boolean("isReadOnly").default(false).notNull(),
  sectionName: varchar("sectionName", { length: 128 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  dependsOnFieldId: int("dependsOnFieldId"),
  autoFill: varchar("autoFill", { length: 128 }),
  isReusable: boolean("isReusable").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FormField = typeof formFields.$inferSelect;
export type InsertFormField = typeof formFields.$inferInsert;

// ─── Attachment Configs (Configuração de Anexos por Tipo) ─────────────────────
export const attachmentConfigs = mysqlTable("attachmentConfigs", {
  id: int("id").autoincrement().primaryKey(),
  serviceTypeId: int("serviceTypeId"),
  formTemplateId: int("formTemplateId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  acceptedTypes: json("acceptedTypes"),
  maxFileSizeMb: int("maxFileSizeMb").default(10).notNull(),
  maxTotalSizeMb: int("maxTotalSizeMb").default(50).notNull(),
  minCount: int("minCount").default(0).notNull(),
  maxCount: int("maxCount").default(10).notNull(),
  isRequired: boolean("isRequired").default(false).notNull(),
  allowedAtStages: json("allowedAtStages"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AttachmentConfig = typeof attachmentConfigs.$inferSelect;
export type InsertAttachmentConfig = typeof attachmentConfigs.$inferInsert;

// ─── Attachments (Anexos de Protocolos/Processos) ─────────────────────────────
export const attachments = mysqlTable("attachments", {
  id: int("id").autoincrement().primaryKey(),
  nup: varchar("nup", { length: 32 }),
  entityType: varchar("entityType", { length: 64 }).notNull(),
  entityId: int("entityId").notNull(),
  configId: int("configId"),
  uploadedById: int("uploadedById").notNull(),
  fileName: varchar("fileName", { length: 512 }).notNull(),
  originalName: varchar("originalName", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  fileSizeBytes: bigint("fileSizeBytes", { mode: "number" }).notNull(),
  s3Key: varchar("s3Key", { length: 1024 }).notNull(),
  s3Url: text("s3Url").notNull(),
  category: varchar("category", { length: 128 }),
  version: int("version").default(1).notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  deletedAt: timestamp("deletedAt"),
  deletedById: int("deletedById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;

// ─── Context Help (Ajuda Contextual por Funcionalidade) ───────────────────────
export const contextHelp = mysqlTable("contextHelp", {
  id: int("id").autoincrement().primaryKey(),
  featureKey: varchar("featureKey", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  detailedInstructions: text("detailedInstructions"),
  examples: text("examples"),
  requiredDocuments: text("requiredDocuments"),
  warnings: text("warnings"),
  usefulLinks: json("usefulLinks"),
  normativeBase: text("normativeBase"),
  targetProfiles: json("targetProfiles"),
  displayMode: mysqlEnum("displayMode", ["tooltip", "modal", "sidebar", "expandable"]).default("modal").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContextHelp = typeof contextHelp.$inferSelect;
export type InsertContextHelp = typeof contextHelp.$inferInsert;

// ─── Online Sessions (Sessões Ativas de Usuários) ─────────────────────────────
export const onlineSessions = mysqlTable("onlineSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionToken: varchar("sessionToken", { length: 256 }).notNull().unique(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  channel: varchar("channel", { length: 64 }).default("web").notNull(),
  currentPage: varchar("currentPage", { length: 512 }),
  lastActivity: timestamp("lastActivity").defaultNow().notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  terminatedById: int("terminatedById"),
  terminatedAt: timestamp("terminatedAt"),
  loginAt: timestamp("loginAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OnlineSession = typeof onlineSessions.$inferSelect;
export type InsertOnlineSession = typeof onlineSessions.$inferInsert;

// ─── Institutional Config (Identidade Visual Institucional) ───────────────────
export const institutionalConfig = mysqlTable("institutionalConfig", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  type: mysqlEnum("type", ["text", "color", "url", "boolean", "json"]).default("text").notNull(),
  label: varchar("label", { length: 255 }),
  description: text("description"),
  updatedById: int("updatedById"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstitutionalConfig = typeof institutionalConfig.$inferSelect;
export type InsertInstitutionalConfig = typeof institutionalConfig.$inferInsert;

// ─── User Registrations (Cadastro Próprio da Plataforma) ──────────────────────
export const userRegistrations = mysqlTable("userRegistrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  cpf: varchar("cpf", { length: 14 }),
  cnpj: varchar("cnpj", { length: 18 }),
  phone: varchar("phone", { length: 20 }),
  googleId: varchar("googleId", { length: 128 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  emailVerifyToken: varchar("emailVerifyToken", { length: 256 }),
  passwordResetToken: varchar("passwordResetToken", { length: 256 }),
  passwordResetExpiry: timestamp("passwordResetExpiry"),
  termsAcceptedAt: timestamp("termsAcceptedAt"),
  mfaEnabled: boolean("mfaEnabled").default(false).notNull(),
  mfaSecret: varchar("mfaSecret", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserRegistration = typeof userRegistrations.$inferSelect;
export type InsertUserRegistration = typeof userRegistrations.$inferInsert;

// ─── Search Index (Índice de Pesquisa Global) ─────────────────────────────────
export const searchIndex = mysqlTable("searchIndex", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 64 }).notNull(),
  entityId: int("entityId").notNull(),
  nup: varchar("nup", { length: 32 }),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content"),
  tags: json("tags"),
  visibleToProfiles: json("visibleToProfiles"),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  nupIdx: index("nup_idx").on(table.nup),
}));

export type SearchIndex = typeof searchIndex.$inferSelect;
export type InsertSearchIndex = typeof searchIndex.$inferInsert;

// ─── Organizational Units (Estrutura Organizacional — Lei 010/2025) ───────────
export const orgUnits = mysqlTable("orgUnits", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 512 }).notNull(),
  acronym: varchar("acronym", { length: 32 }),
  type: mysqlEnum("type", [
    "prefeitura", "gabinete", "procuradoria", "controladoria", "secretaria",
    "superintendencia", "secretaria_executiva", "diretoria", "departamento",
    "coordenacao", "gerencia", "supervisao", "secao", "setor", "nucleo",
    "assessoria", "unidade", "junta", "tesouraria", "ouvidoria"
  ]).notNull().default("setor"),
  level: int("level").notNull().default(1),
  parentId: int("parentId"),
  managerId: int("managerId"),
  description: text("description"),
  legalBasis: varchar("legalBasis", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  isSeeded: boolean("isSeeded").default(false).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  parentIdx: index("orgUnit_parent_idx").on(table.parentId),
  levelIdx: index("orgUnit_level_idx").on(table.level),
  typeIdx: index("orgUnit_type_idx").on(table.type),
}));

export type OrgUnit = typeof orgUnits.$inferSelect;
export type InsertOrgUnit = typeof orgUnits.$inferInsert;

// ─── Positions (Cargos) ───────────────────────────────────────────────────────
export const positions = mysqlTable("positions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 64 }),
  orgUnitId: int("orgUnitId"),
  level: mysqlEnum("level", [
    "secretario", "secretario_executivo", "diretor", "coordenador",
    "gerente", "supervisor", "chefe", "assessor_tecnico", "assessor_especial", "outro"
  ]).notNull().default("outro"),
  provisionType: mysqlEnum("provisionType", ["comissao", "efetivo", "designacao", "contrato"]).default("comissao"),
  canSign: boolean("canSign").default(false).notNull(),
  canApprove: boolean("canApprove").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isSeeded: boolean("isSeeded").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Position = typeof positions.$inferSelect;
export type InsertPosition = typeof positions.$inferInsert;

// ─── User Allocations (Lotações) ──────────────────────────────────────────────
export const userAllocations = mysqlTable("userAllocations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orgUnitId: int("orgUnitId").notNull(),
  positionId: int("positionId"),
  isPrimary: boolean("isPrimary").default(true).notNull(),
  systemProfile: mysqlEnum("systemProfile", [
    "citizen", "attendant", "sector_server", "analyst", "manager", "authority", "admin"
  ]).default("attendant").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  notes: text("notes"),
  allocatedBy: int("allocatedBy"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("alloc_user_idx").on(table.userId),
  unitIdx: index("alloc_unit_idx").on(table.orgUnitId),
}));

export type UserAllocation = typeof userAllocations.$inferSelect;
export type InsertUserAllocation = typeof userAllocations.$inferInsert;

// ─── Allocation History (Histórico de Movimentação) ───────────────────────────
export const allocationHistory = mysqlTable("allocationHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fromOrgUnitId: int("fromOrgUnitId"),
  toOrgUnitId: int("toOrgUnitId"),
  fromPositionId: int("fromPositionId"),
  toPositionId: int("toPositionId"),
  changeType: mysqlEnum("changeType", ["allocation", "transfer", "promotion", "removal", "invite_accepted"]).notNull(),
  changedBy: int("changedBy"),
  notes: text("notes"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("allocHist_user_idx").on(table.userId),
}));

export type AllocationHistory = typeof allocationHistory.$inferSelect;
export type InsertAllocationHistory = typeof allocationHistory.$inferInsert;

// ─── Org Invites (Convites por E-mail) ────────────────────────────────────────
export const orgInvites = mysqlTable("orgInvites", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  orgUnitId: int("orgUnitId").notNull(),
  positionId: int("positionId"),
  systemProfile: mysqlEnum("systemProfile", [
    "citizen", "attendant", "sector_server", "analyst", "manager", "authority", "admin"
  ]).default("attendant").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "expired", "cancelled"]).default("pending").notNull(),
  invitedBy: int("invitedBy").notNull(),
  acceptedBy: int("acceptedBy"),
  notes: text("notes"),
  expiresAt: timestamp("expiresAt"),
  acceptedAt: timestamp("acceptedAt"),
  acceptedIp: varchar("acceptedIp", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tokenIdx: uniqueIndex("invite_token_idx").on(table.token),
  emailIdx: index("invite_email_idx").on(table.email),
  unitIdx: index("invite_unit_idx").on(table.orgUnitId),
}));

export type OrgInvite = typeof orgInvites.$inferSelect;
export type InsertOrgInvite = typeof orgInvites.$inferInsert;

// ─── Service Type Fields (Campos por Tipo de Atendimento) ─────────────────────
export const serviceTypeFields = mysqlTable("serviceTypeFields", {
  id: int("id").autoincrement().primaryKey(),
  serviceTypeId: int("serviceTypeId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  fieldType: mysqlEnum("fieldType", [
    "text", "textarea", "number", "email", "phone", "cpf", "cnpj",
    "date", "datetime", "select", "multiselect", "checkbox", "radio",
    "file", "image", "signature", "geolocation"
  ]).default("text").notNull(),
  requirement: mysqlEnum("requirement", ["required", "complementary", "optional"]).default("optional").notNull(),
  placeholder: varchar("placeholder", { length: 255 }),
  helpText: text("helpText"),
  options: text("options"),           // JSON array for select/radio/checkbox options
  mask: varchar("mask", { length: 64 }),
  validation: text("validation"),     // JSON with min, max, pattern, etc.
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  serviceTypeIdx: index("stf_serviceType_idx").on(table.serviceTypeId),
}));
export type ServiceTypeField = typeof serviceTypeFields.$inferSelect;
export type InsertServiceTypeField = typeof serviceTypeFields.$inferInsert;

// ─── Service Type Documents (Documentos por Tipo de Atendimento) ──────────────
export const serviceTypeDocuments = mysqlTable("serviceTypeDocuments", {
  id: int("id").autoincrement().primaryKey(),
  serviceTypeId: int("serviceTypeId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  requirement: mysqlEnum("requirement", ["required", "complementary", "optional"]).default("required").notNull(),
  acceptedFormats: varchar("acceptedFormats", { length: 255 }).default("pdf,jpg,png"),
  maxSizeMb: int("maxSizeMb").default(10),
  example: text("example"),           // URL or description of example document
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  serviceTypeIdx: index("std_serviceType_idx").on(table.serviceTypeId),
}));
export type ServiceTypeDocument = typeof serviceTypeDocuments.$inferSelect;
export type InsertServiceTypeDocument = typeof serviceTypeDocuments.$inferInsert;

// ─── Service Subjects (Assuntos por Tipo de Atendimento) ──────────────────────
export const serviceSubjects = mysqlTable("serviceSubjects", {
  id: int("id").autoincrement().primaryKey(),
  serviceTypeId: int("serviceTypeId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  code: varchar("code", { length: 64 }),
  isPublic: boolean("isPublic").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  formTemplateId: int("formTemplateId"),
  slaResponseHours: int("slaResponseHours"),
  slaConclusionHours: int("slaConclusionHours"),
  responsibleSectorId: int("responsibleSectorId"),
  importantNotes: text("importantNotes"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  serviceTypeIdx: index("ss_serviceType_idx").on(table.serviceTypeId),
}));
export type ServiceSubject = typeof serviceSubjects.$inferSelect;
export type InsertServiceSubject = typeof serviceSubjects.$inferInsert;

// ─── NUP Notifications (Notificações automáticas ao gerar NUP) ────────────────
export const nupNotifications = mysqlTable("nupNotifications", {
  id: int("id").autoincrement().primaryKey(),
  nup: varchar("nup", { length: 32 }).notNull(),
  entityType: mysqlEnum("entityType", ["protocol", "conversation", "ombudsman", "process"]).notNull(),
  entityId: int("entityId").notNull(),
  contactId: int("contactId"),
  channel: mysqlEnum("channel", ["email", "whatsapp", "instagram", "sms", "system"]).notNull(),
  recipientAddress: varchar("recipientAddress", { length: 512 }),  // email, phone, igHandle
  status: mysqlEnum("status", ["pending", "sent", "failed", "skipped"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  content: text("content"),           // mensagem enviada
  trackingLink: text("trackingLink"), // link de acompanhamento gerado
  trackingToken: varchar("trackingToken", { length: 128 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  nupIdx: index("nn_nup_idx").on(table.nup),
  entityIdx: index("nn_entity_idx").on(table.entityType, table.entityId),
  contactIdx: index("nn_contact_idx").on(table.contactId),
}));
export type NupNotification = typeof nupNotifications.$inferSelect;
export type InsertNupNotification = typeof nupNotifications.$inferInsert;
