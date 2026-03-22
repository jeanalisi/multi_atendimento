import { and, asc, eq, ilike, like, or } from "drizzle-orm";
import { getDb } from "./db";
import {
  serviceTypeDocuments,
  serviceTypeFields,
  serviceTypes,
  InsertServiceTypeField,
  InsertServiceTypeDocument,
} from "../drizzle/schema";

// ─── Service Type Fields ───────────────────────────────────────────────────────

export async function getServiceTypeFields(serviceTypeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(serviceTypeFields)
    .where(and(eq(serviceTypeFields.serviceTypeId, serviceTypeId), eq(serviceTypeFields.isActive, true)))
    .orderBy(asc(serviceTypeFields.sortOrder));
}

export async function createServiceTypeField(data: Omit<InsertServiceTypeField, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(serviceTypeFields).values(data);
  const rows = await db
    .select()
    .from(serviceTypeFields)
    .where(and(eq(serviceTypeFields.serviceTypeId, data.serviceTypeId), eq(serviceTypeFields.name, data.name)))
    .limit(1);
  return rows[0];
}

export async function updateServiceTypeField(id: number, data: Partial<InsertServiceTypeField>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(serviceTypeFields).set(data).where(eq(serviceTypeFields.id, id));
  const rows = await db.select().from(serviceTypeFields).where(eq(serviceTypeFields.id, id)).limit(1);
  return rows[0];
}

export async function deleteServiceTypeField(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(serviceTypeFields).set({ isActive: false }).where(eq(serviceTypeFields.id, id));
  return { success: true };
}

export async function reorderServiceTypeFields(items: { id: number; sortOrder: number }[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  for (const item of items) {
    await db.update(serviceTypeFields).set({ sortOrder: item.sortOrder }).where(eq(serviceTypeFields.id, item.id));
  }
  return { success: true };
}

// ─── Service Type Documents ────────────────────────────────────────────────────

export async function getServiceTypeDocuments(serviceTypeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(serviceTypeDocuments)
    .where(and(eq(serviceTypeDocuments.serviceTypeId, serviceTypeId), eq(serviceTypeDocuments.isActive, true)))
    .orderBy(asc(serviceTypeDocuments.sortOrder));
}

export async function createServiceTypeDocument(data: Omit<InsertServiceTypeDocument, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(serviceTypeDocuments).values(data);
  const rows = await db
    .select()
    .from(serviceTypeDocuments)
    .where(and(eq(serviceTypeDocuments.serviceTypeId, data.serviceTypeId), eq(serviceTypeDocuments.name, data.name)))
    .limit(1);
  return rows[0];
}

export async function updateServiceTypeDocument(id: number, data: Partial<InsertServiceTypeDocument>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(serviceTypeDocuments).set(data).where(eq(serviceTypeDocuments.id, id));
  const rows = await db.select().from(serviceTypeDocuments).where(eq(serviceTypeDocuments.id, id)).limit(1);
  return rows[0];
}

export async function deleteServiceTypeDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(serviceTypeDocuments).set({ isActive: false }).where(eq(serviceTypeDocuments.id, id));
  return { success: true };
}

// ─── Cidadão Portal ────────────────────────────────────────────────────────────

export async function getCidadaoServices(input?: { search?: string; category?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(serviceTypes.isActive, true),
    eq(serviceTypes.allowPublicConsult, true),
  ];

  if (input?.category) {
    conditions.push(eq(serviceTypes.category, input.category));
  }

  let rows = await db
    .select({
      id: serviceTypes.id,
      name: serviceTypes.name,
      description: serviceTypes.description,
      category: serviceTypes.category,
      code: serviceTypes.code,
      slaResponseHours: serviceTypes.slaResponseHours,
      slaConclusionHours: serviceTypes.slaConclusionHours,
      secrecyLevel: serviceTypes.secrecyLevel,
      requiresApproval: serviceTypes.requiresApproval,
      requiresSelfie: serviceTypes.requiresSelfie,
      requiresGeolocation: serviceTypes.requiresGeolocation,
    })
    .from(serviceTypes)
    .where(and(...conditions))
    .orderBy(asc(serviceTypes.name));

  if (input?.search) {
    const q = input.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        (r.category ?? "").toLowerCase().includes(q) ||
        (r.code ?? "").toLowerCase().includes(q)
    );
  }

  return rows;
}

export async function getCidadaoServiceDetail(id: number) {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(serviceTypes)
    .where(and(eq(serviceTypes.id, id), eq(serviceTypes.isActive, true), eq(serviceTypes.allowPublicConsult, true)))
    .limit(1);

  if (!rows[0]) return null;

  const fields = await getServiceTypeFields(id);
  const documents = await getServiceTypeDocuments(id);

  return {
    ...rows[0],
    fields,
    documents,
  };
}
