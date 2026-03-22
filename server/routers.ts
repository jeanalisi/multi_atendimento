import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addToQueue,
  createMessage,
  createNotification,
  createTicket,
  deleteAccount,
  getAccountById,
  getAccountsByUser,
  getAllAccounts,
  getAllUsers,
  getAgents,
  getAnalytics,
  getConversationById,
  getConversationStats,
  getConversations,
  getMessagesByConversation,
  getNextQueuePosition,
  getNotificationsByUser,
  getQueue,
  getTagsByConversation,
  getTags,
  createTag,
  deleteTag,
  getTickets,
  markMessagesAsRead,
  markNotificationsAsRead,
  createAccount,
  updateAccount,
  updateConversation,
  updateQueueItem,
  updateTicket,
  updateUser,
  createConversation,
  upsertContact,
} from "./db";
import {
  connectWhatsApp,
  disconnectWhatsApp,
  onQrCode,
  onStatusChange,
  sendWhatsAppMessage,
} from "./whatsapp";
import { testImapConnection, testSmtpConnection, sendEmail, fetchEmails } from "./email";
import { getIo } from "./_core/socketio";
import { caiusRouter } from "./routers-caius";
import { orgUnitsRouter, positionsRouter, userAllocationsRouter, orgInvitesRouter } from "./routers-org";
import {
  serviceTypesRouter,
  formTemplatesRouter,
  attachmentsRouter,
  contextHelpRouter,
  onlineSessionsRouter,
  institutionalConfigRouter,
  globalSearchRouter,
  userRegistrationRouter,
  serviceTypeFieldsRouter,
  serviceTypeDocumentsRouter,
  cidadaoRouter,
} from "./routers-advanced";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  return next({ ctx });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function notifyUser(userId: number, type: any, title: string, body?: string, relatedConversationId?: number) {
  await createNotification({ userId, type, title, body, relatedConversationId });
  const io = getIo();
  if (io) io.to(`user:${userId}`).emit("notification", { type, title, body });
}

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Users / Agents ────────────────────────────────────────────────────────
  users: router({
    list: adminProcedure.query(() => getAllUsers()),
    agents: protectedProcedure.query(() => getAgents()),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]).optional(),
        isAgent: z.boolean().optional(),
        isAvailable: z.boolean().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => updateUser(id, data)),
    setAvailability: protectedProcedure
      .input(z.object({ isAvailable: z.boolean() }))
      .mutation(({ ctx, input }) => updateUser(ctx.user.id, { isAvailable: input.isAvailable })),
  }),

  // ── Accounts (WhatsApp / Instagram / Email) ───────────────────────────────
  accounts: router({
    list: protectedProcedure.query(({ ctx }) =>
      ctx.user.role === "admin" ? getAllAccounts() : getAccountsByUser(ctx.user.id)
    ),
    create: protectedProcedure
      .input(z.object({
        channel: z.enum(["whatsapp", "instagram", "email"]),
        name: z.string().min(1),
        identifier: z.string().min(1),
        imapHost: z.string().optional(),
        imapPort: z.number().optional(),
        imapUser: z.string().optional(),
        imapPassword: z.string().optional(),
        smtpHost: z.string().optional(),
        smtpPort: z.number().optional(),
        smtpUser: z.string().optional(),
        smtpPassword: z.string().optional(),
        smtpSecure: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createAccount({ ...input, userId: ctx.user.id });
        return { id };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteAccount(input.id)),

    // WhatsApp QR Code flow
    connectWhatsApp: protectedProcedure
      .input(z.object({ accountId: z.number() }))
      .mutation(async ({ input }) => {
        await connectWhatsApp(input.accountId);
        return { started: true };
      }),
    disconnectWhatsApp: protectedProcedure
      .input(z.object({ accountId: z.number() }))
      .mutation(async ({ input }) => {
        await disconnectWhatsApp(input.accountId);
        return { disconnected: true };
      }),
    getQrCode: protectedProcedure
      .input(z.object({ accountId: z.number() }))
      .query(async ({ input }) => {
        const account = await getAccountById(input.accountId);
        return { qrCode: account?.waQrCode ?? null, status: account?.status ?? "disconnected" };
      }),

    // Email test
    testEmail: protectedProcedure
      .input(z.object({ accountId: z.number() }))
      .mutation(async ({ input }) => {
        const account = await getAccountById(input.accountId);
        if (!account) throw new TRPCError({ code: "NOT_FOUND" });
        const [imap, smtp] = await Promise.all([
          testImapConnection(account),
          testSmtpConnection(account),
        ]);
        if (imap && smtp) await updateAccount(input.accountId, { status: "connected" });
        return { imap, smtp };
      }),
    fetchEmails: protectedProcedure
      .input(z.object({ accountId: z.number() }))
      .mutation(async ({ input }) => {
        const account = await getAccountById(input.accountId);
        if (!account) throw new TRPCError({ code: "NOT_FOUND" });
        await fetchEmails(account);
        return { fetched: true };
      }),
  }),

  // ── Conversations ─────────────────────────────────────────────────────────
  conversations: router({
    list: protectedProcedure
      .input(z.object({
        channel: z.enum(["whatsapp", "instagram", "email"]).optional(),
        status: z.enum(["open", "pending", "resolved", "snoozed"]).optional(),
        assignedAgentId: z.number().optional(),
        search: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional())
      .query(({ input }) => getConversations(input)),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getConversationById(input.id)),
    stats: protectedProcedure.query(() => getConversationStats()),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "pending", "resolved", "snoozed"]).optional(),
        assignedAgentId: z.number().nullable().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
      }))
      .mutation(async ({ input: { id, ...data }, ctx }) => {
        await updateConversation(id, data as any);
        if (data.assignedAgentId) {
          await notifyUser(
            data.assignedAgentId,
            "ticket_assigned",
            "Nova conversa atribuída",
            `Conversa #${id} foi atribuída a você`,
            id
          );
        }
        return { updated: true };
      }),
    create: protectedProcedure
      .input(z.object({
        accountId: z.number(),
        channel: z.enum(["whatsapp", "instagram", "email"]),
        contactName: z.string().optional(),
        contactPhone: z.string().optional(),
        contactEmail: z.string().optional(),
        subject: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const contactId = await upsertContact({
          name: input.contactName,
          phone: input.contactPhone,
          email: input.contactEmail,
        });
        const id = await createConversation({
          accountId: input.accountId,
          contactId,
          channel: input.channel,
          subject: input.subject,
          status: "open",
        });
        return { id };
      }),
    tags: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(({ input }) => getTagsByConversation(input.conversationId)),
  }),

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: router({
    list: protectedProcedure
      .input(z.object({ conversationId: z.number(), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(({ input }) => getMessagesByConversation(input.conversationId, input.limit, input.offset)),
    send: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string().min(1),
        type: z.enum(["text", "image", "audio", "video", "document"]).default("text"),
      }))
      .mutation(async ({ input, ctx }) => {
        const conv = await getConversationById(input.conversationId);
        if (!conv) throw new TRPCError({ code: "NOT_FOUND" });

        const msgId = await createMessage({
          conversationId: input.conversationId,
          direction: "outbound",
          type: input.type,
          content: input.content,
          senderAgentId: ctx.user.id,
          senderName: ctx.user.name ?? "Agent",
        });

        // Send via channel
        if (conv.conversation.channel === "whatsapp" && conv.conversation.externalId) {
          try {
            await sendWhatsAppMessage(
              conv.conversation.accountId,
              conv.conversation.externalId,
              input.content
            );
          } catch (e) {
            console.error("[WhatsApp] Send error:", e);
          }
        } else if (conv.conversation.channel === "email" && conv.contact?.email) {
          const account = await import("./db").then(m => m.getAccountById(conv.conversation.accountId));
          if (account) {
            try {
              await sendEmail(account, conv.contact.email, conv.conversation.subject ?? "Re:", input.content);
            } catch (e) {
              console.error("[Email] Send error:", e);
            }
          }
        }

        await updateConversation(input.conversationId, { lastMessageAt: new Date() });

        const io = getIo();
        if (io) io.to(`conv:${input.conversationId}`).emit("new_message", { msgId });

        return { msgId };
      }),
    markRead: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(({ input }) => markMessagesAsRead(input.conversationId)),
  }),

  // ── Tickets ───────────────────────────────────────────────────────────────
  tickets: router({
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
        assignedAgentId: z.number().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
      }).optional())
      .query(({ input }) => getTickets(input)),
    create: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
        assignedAgentId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await createTicket({ ...input, createdById: ctx.user.id });
        if (input.assignedAgentId) {
          await notifyUser(
            input.assignedAgentId,
            "ticket_assigned",
            `Ticket atribuído: ${input.title}`,
            input.description,
            input.conversationId
          );
        }
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
        assignedAgentId: z.number().nullable().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
        resolvedAt: z.date().optional(),
      }))
      .mutation(async ({ input: { id, ...data } }) => {
        await updateTicket(id, data as any);
        return { updated: true };
      }),
  }),

  // ── Queue ─────────────────────────────────────────────────────────────────
  queue: router({
    list: protectedProcedure.query(() => getQueue()),
    add: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        const position = await getNextQueuePosition();
        const id = await addToQueue({ conversationId: input.conversationId, position });
        return { id, position };
      }),
    assign: protectedProcedure
      .input(z.object({ queueId: z.number(), agentId: z.number() }))
      .mutation(async ({ input }) => {
        await updateQueueItem(input.queueId, {
          assignedAgentId: input.agentId,
          status: "assigned",
          assignedAt: new Date(),
        });
        await notifyUser(input.agentId, "queue_assigned", "Atendimento atribuído da fila");
        return { assigned: true };
      }),
    autoAssign: protectedProcedure.mutation(async () => {
      const queueItems = await getQueue();
      const agents = await getAgents();
      const availableAgents = agents.filter((a) => a.isAvailable);
      let assigned = 0;
      for (const item of queueItems) {
        if (availableAgents.length === 0) break;
        const agent = availableAgents[assigned % availableAgents.length];
        await updateQueueItem(item.queue.id, {
          assignedAgentId: agent.id,
          status: "assigned",
          assignedAt: new Date(),
        });
        await updateConversation(item.queue.conversationId, { assignedAgentId: agent.id });
        await notifyUser(agent.id, "queue_assigned", "Atendimento atribuído automaticamente");
        assigned++;
      }
      return { assigned };
    }),
  }),

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(30) }).optional())
      .query(({ ctx, input }) => getNotificationsByUser(ctx.user.id, input?.limit)),
    markRead: protectedProcedure.mutation(({ ctx }) => markNotificationsAsRead(ctx.user.id)),
  }),

  // ── Tags ──────────────────────────────────────────────────────────────────
  tags: router({
    list: protectedProcedure.query(() => getTags()),
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), color: z.string().default('#6366f1') }))
      .mutation(({ input }) => createTag(input.name, input.color)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteTag(input.id)),
  }),

  // ── CAIUS Modules ──────────────────────────────────────────────────────────
  caius: caiusRouter,
  // ── Advanced Modules ──────────────────────────────────────────────────────
  serviceTypes: serviceTypesRouter,
  formTemplates: formTemplatesRouter,
  attachments: attachmentsRouter,
  contextHelp: contextHelpRouter,
  onlineSessions: onlineSessionsRouter,
  institutionalConfig: institutionalConfigRouter,
  globalSearch: globalSearchRouter,
   userRegistration: userRegistrationRouter,
  serviceTypeFields: serviceTypeFieldsRouter,
  serviceTypeDocuments: serviceTypeDocumentsRouter,
  cidadao: cidadaoRouter,
  // ── Org Structure ──────────────────────────────────────────────────────────
  orgUnits: orgUnitsRouter,
  positions: positionsRouter,
  userAllocations: userAllocationsRouter,
  orgInvites: orgInvitesRouter,
  // ── Analytics ─────────────────────────────────────────────────────────────
  analytics: router({
    overview: protectedProcedure
      .input(z.object({
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }).optional())
      .query(({ input }) => getAnalytics(input?.dateFrom, input?.dateTo)),
    stats: protectedProcedure.query(() => getConversationStats()),
  }),
});

export type AppRouter = typeof appRouter;
