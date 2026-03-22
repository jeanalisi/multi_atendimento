import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import {
  verifiableDocuments, documentSignatures, documentVerificationLogs,
  VerifiableDocument, DocumentSignature,
} from "../drizzle/schema";
import { eq, and, or, desc } from "drizzle-orm";
import crypto from "crypto";
import QRCode from "qrcode";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateVerificationKey(nup: string | null | undefined): string {
  const base = nup ? nup.replace(/-/g, "") : crypto.randomBytes(6).toString("hex").toUpperCase();
  const token = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `${base}-${token}`;
}

function generateAccessCode(): string {
  // Formato: XXXX-XXXX-XXXX (alfanumérico legível)
  const part = () => crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${part()}-${part()}-${part()}`;
}

function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

async function generateQRCodeSVG(url: string): Promise<string> {
  try {
    return await QRCode.toString(url, { type: "svg", width: 120, margin: 1 });
  } catch {
    return "";
  }
}

function getVerificationUrl(key: string, origin = ""): string {
  const base = origin || "https://multichat-ve5tpunf.manus.space";
  return `${base}/verificar/${key}`;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const verificationRouter = router({
  // ── Emitir documento verificável ──────────────────────────────────────────
  issue: protectedProcedure
    .input(z.object({
      entityType: z.enum(["protocol", "process", "document", "ombudsman", "template", "receipt", "report", "custom"]),
      entityId: z.number(),
      nup: z.string().optional(),
      title: z.string(),
      documentType: z.string(),
      documentNumber: z.string().optional(),
      content: z.string().optional(),  // Conteúdo para gerar hash
      issuingUnit: z.string().optional(),
      isPublic: z.boolean().default(true),
      origin: z.string().optional(),   // window.location.origin do frontend
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      // Verificar se já existe documento verificável para esta entidade
      const existing = await db.select().from(verifiableDocuments)
        .where(and(
          eq(verifiableDocuments.entityType, input.entityType),
          eq(verifiableDocuments.entityId, input.entityId),
        ))
        .limit(1);

      if (existing.length > 0) {
        // Retornar o existente
        const doc = existing[0];
        return { success: true, verifiableDocument: doc, isNew: false };
      }

      const verificationKey = generateVerificationKey(input.nup);
      const verificationUrl = getVerificationUrl(verificationKey, input.origin);
      const documentHash = input.content ? hashContent(input.content) : undefined;
      const qrCodeData = await generateQRCodeSVG(verificationUrl);

      const [result] = await db.insert(verifiableDocuments).values({
        entityType: input.entityType,
        entityId: input.entityId,
        nup: input.nup,
        verificationKey,
        documentHash,
        title: input.title,
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        issuingUnit: input.issuingUnit,
        issuingUserId: ctx.user.id,
        issuingUserName: ctx.user.name,
        verificationUrl,
        qrCodeData,
        isPublic: input.isPublic,
        status: "authentic",
        version: 1,
      });

      const newDoc = await db.select().from(verifiableDocuments)
        .where(eq(verifiableDocuments.verificationKey, verificationKey))
        .limit(1);

      return { success: true, verifiableDocument: newDoc[0], isNew: true };
    }),

  // ── Buscar documento verificável por entidade ─────────────────────────────
  getByEntity: protectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const docs = await db.select().from(verifiableDocuments)
        .where(and(
          eq(verifiableDocuments.entityType, input.entityType as any),
          eq(verifiableDocuments.entityId, input.entityId),
        ))
        .orderBy(desc(verifiableDocuments.version))
        .limit(1);

      if (docs.length === 0) return null;
      const doc = docs[0];

      // Buscar assinaturas
      const sigs = await db.select().from(documentSignatures)
        .where(eq(documentSignatures.verifiableDocumentId, doc.id))
        .orderBy(documentSignatures.signatureOrder);

      return { ...doc, signatures: sigs };
    }),

  // ── Verificação pública por chave ou NUP (sem autenticação) ───────────────
  verify: publicProcedure
    .input(z.object({
      key: z.string().optional(),
      nup: z.string().optional(),
      accessCode: z.string().optional(),
      queryType: z.enum(["nup", "key", "qrcode", "link"]).default("key"),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      let doc: VerifiableDocument | undefined;

      if (input.key) {
        const rows = await db.select().from(verifiableDocuments)
          .where(eq(verifiableDocuments.verificationKey, input.key))
          .limit(1);
        doc = rows[0];
      } else if (input.nup) {
        const rows = await db.select().from(verifiableDocuments)
          .where(eq(verifiableDocuments.nup, input.nup))
          .orderBy(desc(verifiableDocuments.version))
          .limit(1);
        doc = rows[0];
      } else if (input.accessCode) {
        // Buscar pela assinatura
        const sigRows = await db.select().from(documentSignatures)
          .where(eq(documentSignatures.accessCode, input.accessCode))
          .limit(1);
        if (sigRows.length > 0) {
          const docRows = await db.select().from(verifiableDocuments)
            .where(eq(verifiableDocuments.id, sigRows[0].verifiableDocumentId))
            .limit(1);
          doc = docRows[0];
        }
      }

      // Registrar log de acesso
      await db.insert(documentVerificationLogs).values({
        verifiableDocumentId: doc?.id,
        verificationKey: input.key,
        accessCode: input.accessCode,
        queryType: input.queryType,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        result: doc ? "found" : "not_found",
      });

      if (!doc) {
        return { found: false, message: "Documento não encontrado." };
      }

      // Buscar assinaturas
      const sigs = await db.select().from(documentSignatures)
        .where(eq(documentSignatures.verifiableDocumentId, doc.id))
        .orderBy(documentSignatures.signatureOrder);

      return {
        found: true,
        document: {
          id: doc.id,
          nup: doc.nup,
          title: doc.title,
          documentType: doc.documentType,
          documentNumber: doc.documentNumber,
          issuingUnit: doc.issuingUnit,
          issuingUserName: doc.issuingUserName,
          status: doc.status,
          version: doc.version,
          verificationKey: doc.verificationKey,
          verificationUrl: doc.verificationUrl,
          qrCodeData: doc.qrCodeData,
          issuedAt: doc.issuedAt,
          invalidatedAt: doc.invalidatedAt,
          invalidationReason: doc.invalidationReason,
        },
        signatures: sigs.map((s: DocumentSignature) => ({
          id: s.id,
          signerName: s.signerName,
          signerCpfMasked: s.signerCpfMasked,
          signerRole: s.signerRole,
          signerUnit: s.signerUnit,
          signatureType: s.signatureType,
          signatureMethod: s.signatureMethod,
          status: s.status,
          signedAt: s.signedAt,
          accessCode: s.accessCode,
          signatureOrder: s.signatureOrder,
        })),
        isAuthentic: doc.status === "authentic",
      };
    }),

  // ── Invalidar documento ───────────────────────────────────────────────────
  invalidate: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["invalid", "cancelled", "replaced", "revoked", "unavailable"]),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(verifiableDocuments)
        .set({
          status: input.status,
          invalidatedAt: new Date(),
          invalidationReason: input.reason,
        })
        .where(eq(verifiableDocuments.id, input.id));
      return { success: true };
    }),

  // ── Assinar documento ─────────────────────────────────────────────────────
  sign: protectedProcedure
    .input(z.object({
      verifiableDocumentId: z.number(),
      nup: z.string().optional(),
      signatureType: z.enum(["institutional", "advanced", "qualified"]).default("institutional"),
      content: z.string().optional(),  // Conteúdo do documento para gerar hash
      cpfMasked: z.string().optional(),
      role: z.string().optional(),
      unit: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      origin: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verificar se já assinou
      const existing = await db.select().from(documentSignatures)
        .where(and(
          eq(documentSignatures.verifiableDocumentId, input.verifiableDocumentId),
          eq(documentSignatures.signerId, ctx.user.id),
        ))
        .limit(1);

      if (existing.length > 0) {
        return { success: false, message: "Você já assinou este documento." };
      }

      // Contar assinaturas existentes para definir a ordem
      const existingSigs = await db.select().from(documentSignatures)
        .where(eq(documentSignatures.verifiableDocumentId, input.verifiableDocumentId));
      const signatureOrder = existingSigs.length + 1;

      const accessCode = generateAccessCode();
      const verificationUrl = getVerificationUrl(accessCode, input.origin);
      const documentHash = input.content ? hashContent(input.content) : undefined;

      // Hash da assinatura: hash(documentHash + userId + timestamp)
      const sigData = `${documentHash || ""}:${ctx.user.id}:${Date.now()}`;
      const signatureHash = hashContent(sigData);

      await db.insert(documentSignatures).values({
        verifiableDocumentId: input.verifiableDocumentId,
        nup: input.nup ?? undefined,
        signerId: ctx.user.id,
        signerName: ctx.user.name ?? "Usuário",
        signerCpfMasked: input.cpfMasked ?? undefined,
        signerRole: (input.role || ctx.user.role) ?? undefined,
        signerUnit: input.unit ?? undefined,
        signatureType: input.signatureType,
        signatureMethod: input.signatureType === "institutional"
          ? "CAIUS-INSTITUTIONAL"
          : input.signatureType === "advanced"
          ? "CAIUS-ADVANCED"
          : "ICP-BRASIL",
        documentHash: documentHash ?? undefined,
        signatureHash,
        algorithm: "SHA-256",
        ipAddress: input.ipAddress ?? undefined,
        userAgent: input.userAgent ?? undefined,
        accessCode,
        verificationUrl: verificationUrl ?? undefined,
        status: "valid",
        signatureOrder,
      });

      return { success: true, accessCode, verificationUrl };
    }),

  // ── Revogar assinatura ────────────────────────────────────────────────────
  revokeSignature: protectedProcedure
    .input(z.object({
      signatureId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const sigs = await db.select().from(documentSignatures)
        .where(eq(documentSignatures.id, input.signatureId))
        .limit(1);

      if (!sigs.length) return { success: false, message: "Assinatura não encontrada." };
      if (sigs[0].signerId !== ctx.user.id && ctx.user.role !== "admin") {
        return { success: false, message: "Sem permissão para revogar esta assinatura." };
      }

      await db.update(documentSignatures)
        .set({ status: "revoked", revokedAt: new Date(), revocationReason: input.reason })
        .where(eq(documentSignatures.id, input.signatureId));

      return { success: true };
    }),

  // ── Listar assinaturas de um documento ────────────────────────────────────
  getSignatures: protectedProcedure
    .input(z.object({ verifiableDocumentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      return db.select().from(documentSignatures)
        .where(eq(documentSignatures.verifiableDocumentId, input.verifiableDocumentId))
        .orderBy(documentSignatures.signatureOrder);
    }),

  // ── Listar documentos verificáveis do usuário/admin ───────────────────────
  list: protectedProcedure
    .input(z.object({
      entityType: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const query = db.select().from(verifiableDocuments)
        .orderBy(desc(verifiableDocuments.issuedAt))
        .limit(input.limit);

      return query;
    }),
});
