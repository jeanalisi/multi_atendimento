/**
 * DocumentSignatures.tsx
 * Módulo interno de assinatura eletrônica de documentos.
 * Permite assinar documentos com 3 níveis: institucional, avançada, qualificada.
 * Suporta múltiplos signatários em ordem configurável.
 */
import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  Shield, PenLine, CheckCircle2, XCircle, AlertTriangle, Plus,
  FileText, User, Building2, Clock, ChevronDown, ChevronUp, Trash2,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { DocumentChancela } from "@/components/DocumentChancela";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

const SIG_TYPES = [
  {
    value: "institutional",
    label: "Assinatura Institucional",
    description: "Assinatura vinculada ao perfil institucional do usuário no sistema. Nível básico.",
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  {
    value: "advanced",
    label: "Assinatura Eletrônica Avançada",
    description: "Assinatura com hash criptográfico SHA-256 do conteúdo do documento. Nível intermediário.",
    icon: Shield,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
  },
  {
    value: "qualified",
    label: "Assinatura Qualificada (ICP-Brasil)",
    description: "Assinatura com certificado digital ICP-Brasil. Nível máximo de validade jurídica.",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
] as const;

const SIG_STATUS_COLORS: Record<string, string> = {
  valid: "bg-green-100 text-green-800",
  invalid: "bg-red-100 text-red-800",
  altered: "bg-amber-100 text-amber-800",
  revoked: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
  replaced: "bg-amber-100 text-amber-800",
};

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Sign Dialog ──────────────────────────────────────────────────────────────

interface SignDialogProps {
  open: boolean;
  onClose: () => void;
  verifiableDocumentId: number;
  nup?: string;
  onSigned: () => void;
}

function SignDialog({ open, onClose, verifiableDocumentId, nup, onSigned }: SignDialogProps) {
  const [signatureType, setSignatureType] = useState<"institutional" | "advanced" | "qualified">("institutional");
  const [cpfMasked, setCpfMasked] = useState("");
  const [role, setRole] = useState("");
  const [unit, setUnit] = useState("");
  const [reason, setReason] = useState("");

  const signMutation = trpc.verification.sign.useMutation({
    onSuccess: (data) => {
      toast.success(`Documento assinado! Código: ${data.accessCode}`);
      onSigned();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSign = () => {
    signMutation.mutate({
      verifiableDocumentId,
      nup,
      signatureType,
      cpfMasked: cpfMasked || undefined,
      role: role || undefined,
      unit: unit || undefined,
      ipAddress: undefined,
      userAgent: navigator.userAgent,
    });
  };

  const selectedType = SIG_TYPES.find((t) => t.value === signatureType);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-primary" />
            Assinar Documento Eletronicamente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de assinatura */}
          <div className="space-y-2">
            <Label>Tipo de Assinatura</Label>
            <div className="space-y-2">
              {SIG_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    className={`w-full text-left border rounded-lg p-3 transition-all ${
                      signatureType === t.value ? `${t.bg} border-current ring-2 ring-offset-1` : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSignatureType(t.value)}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${t.color}`} />
                      <span className="font-medium text-sm">{t.label}</span>
                      {signatureType === t.value && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-6">{t.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dados opcionais */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">CPF (mascarado)</Label>
              <Input
                placeholder="000.000.000-00"
                value={cpfMasked}
                onChange={(e) => setCpfMasked(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cargo/Função</Label>
              <Input
                placeholder="Ex: Secretário Municipal"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Unidade/Setor</Label>
            <Input
              placeholder="Ex: Secretaria de Administração"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Motivo/Observação (opcional)</Label>
            <Textarea
              placeholder="Motivo da assinatura..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {selectedType && (
            <div className={`rounded-lg p-3 border text-sm ${selectedType.bg}`}>
              <p className="font-medium flex items-center gap-1.5">
                <selectedType.icon className={`w-4 h-4 ${selectedType.color}`} />
                {selectedType.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedType.description}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSign} disabled={signMutation.isPending}>
            <PenLine className="w-4 h-4 mr-1.5" />
            {signMutation.isPending ? "Assinando..." : "Assinar Documento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DocumentSignaturesProps {
  entityType: "protocol" | "process" | "document" | "ombudsman" | "template" | "receipt" | "report" | "custom";
  entityId: number;
  nup?: string;
  title?: string;
  documentType?: string;
  content?: string;
  issuingUnit?: string;
}

export function DocumentSignaturesPanel({
  entityType, entityId, nup, title, documentType, content, issuingUnit,
}: DocumentSignaturesProps) {
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [showChancela, setShowChancela] = useState(false);

  const { data: verDoc, refetch } = trpc.verification.getByEntity.useQuery(
    { entityType, entityId },
    { retry: false }
  );

  const issueMutation = trpc.verification.issue.useMutation({
    onSuccess: () => { refetch(); toast.success("Chancela emitida com sucesso!"); },
    onError: (e) => toast.error(e.message),
  });

  const handleIssue = () => {
    if (!title || !documentType) { toast.error("Título e tipo são obrigatórios."); return; }
    issueMutation.mutate({
      entityType, entityId, nup, title, documentType, content, issuingUnit,
      origin: window.location.origin,
    });
  };

  const signatures = verDoc?.signatures ?? [];

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Autenticação e Assinaturas
        </h3>
        <div className="flex gap-2">
          {verDoc && (
            <Button size="sm" variant="outline" onClick={() => setSignDialogOpen(true)}>
              <PenLine className="w-3.5 h-3.5 mr-1.5" />
              Assinar
            </Button>
          )}
          {!verDoc && (
            <Button size="sm" onClick={handleIssue} disabled={issueMutation.isPending}>
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              {issueMutation.isPending ? "Emitindo..." : "Emitir Chancela"}
            </Button>
          )}
          {verDoc && (
            <Button size="sm" variant="ghost" onClick={() => setShowChancela(!showChancela)}>
              {showChancela ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Sem chancela */}
      {!verDoc && (
        <div className="border border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
          <Shield className="w-6 h-6 mx-auto mb-2 opacity-40" />
          Nenhuma chancela emitida para este documento.
        </div>
      )}

      {/* Lista de assinaturas */}
      {verDoc && signatures.length > 0 && (
        <div className="space-y-2">
          {signatures.map((sig) => (
            <div key={sig.id} className="border rounded-lg p-3 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                {sig.signatureOrder}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{sig.signerName}</span>
                  <Badge className={`text-xs ${SIG_STATUS_COLORS[sig.status] ?? "bg-gray-100 text-gray-800"}`}>
                    {sig.status === "valid" ? "Válida" : sig.status}
                  </Badge>
                </div>
                {sig.signerRole && <p className="text-xs text-muted-foreground">{sig.signerRole}</p>}
                {sig.signerUnit && <p className="text-xs text-muted-foreground">{sig.signerUnit}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sig.signatureType === "institutional" ? "Institucional" : sig.signatureType === "advanced" ? "Avançada" : "Qualificada"} · {formatDate(sig.signedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chancela completa */}
      {verDoc && showChancela && (
        <DocumentChancela
          entityType={entityType}
          entityId={entityId}
          nup={nup}
          title={title}
          documentType={documentType}
          content={content}
          issuingUnit={issuingUnit}
        />
      )}

      {/* Dialog de assinatura */}
      {verDoc && (
        <SignDialog
          open={signDialogOpen}
          onClose={() => setSignDialogOpen(false)}
          verifiableDocumentId={verDoc.id}
          nup={nup}
          onSigned={refetch}
        />
      )}
    </div>
  );
}

// ─── Standalone Page ──────────────────────────────────────────────────────────

export default function DocumentSignaturesPage() {
  // Suporta /assinaturas/:entityType/:entityId para acesso direto a um documento
  const [matchDetail, paramsDetail] = useRoute("/assinaturas/:entityType/:entityId");
  const entityType = (paramsDetail?.entityType ?? "document") as DocumentSignaturesProps["entityType"];
  const entityId = parseInt(paramsDetail?.entityId ?? "0");

  if (matchDetail && entityId > 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Assinaturas Eletrônicas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie as assinaturas eletrônicas e a chancela de autenticidade deste documento.
            </p>
          </div>
          <DocumentSignaturesPanel entityType={entityType} entityId={entityId} />
        </div>
      </DashboardLayout>
    );
  }

  // Listagem geral de documentos com chancela
  return <DocumentSignaturesListPage />;
}

function DocumentSignaturesListPage() {
  const { data: docs = [], isLoading } = trpc.verification.list.useQuery({ limit: 100 });
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const filtered = (docs as any[]).filter((d: any) =>
    !search ||
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.nup?.toLowerCase().includes(search.toLowerCase()) ||
    d.documentType?.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    authentic: { label: "Autêntico", color: "bg-green-100 text-green-800" },
    invalid: { label: "Inválido", color: "bg-red-100 text-red-800" },
    cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
    replaced: { label: "Substituído", color: "bg-amber-100 text-amber-800" },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <PenLine className="w-5 h-5 text-primary" />
              Assinaturas Digitais
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Documentos com chancela de autenticidade e assinaturas eletrônicas emitidas pelo sistema.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/verificar", "_blank")}
          >
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Portal de Verificação
          </Button>
        </div>

        {/* Busca */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por título, NUP ou tipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total de Documentos", value: (docs as any[]).length, icon: FileText, color: "text-blue-600" },
            { label: "Autênticos", value: (docs as any[]).filter((d: any) => d.status === "authentic").length, icon: CheckCircle2, color: "text-green-600" },
            { label: "Cancelados", value: (docs as any[]).filter((d: any) => d.status === "cancelled").length, icon: XCircle, color: "text-red-600" },
            { label: "Substituídos", value: (docs as any[]).filter((d: any) => d.status === "replaced").length, icon: AlertTriangle, color: "text-amber-600" },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lista de documentos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Documentos com Chancela</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 animate-spin" />
                <p>Carregando...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-medium">Nenhum documento encontrado</p>
                <p className="text-xs mt-1">Documentos com chancela emitida aparecerão aqui.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((doc: any) => {
                  const statusCfg = STATUS_LABELS[doc.status] ?? { label: doc.status, color: "bg-gray-100 text-gray-800" };
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/assinaturas/${doc.entityType}/${doc.entityId}`)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.documentType}
                            {doc.nup && <span className="ml-2 font-mono">{doc.nup}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {doc.issuedAt ? new Date(doc.issuedAt).toLocaleDateString("pt-BR") : "—"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dica de uso */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Como funciona:</strong> A chancela de autenticidade é emitida automaticamente ao publicar documentos oficiais, protocolos ou processos. Após emitida, agentes autorizados podem assinar eletronicamente com nível institucional, avançado ou qualificado (ICP-Brasil).
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
