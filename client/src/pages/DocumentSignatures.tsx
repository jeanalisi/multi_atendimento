/**
 * DocumentSignatures.tsx
 * Módulo interno de assinatura eletrônica de documentos.
 * Permite assinar documentos com 3 níveis: institucional, avançada, qualificada.
 * Suporta múltiplos signatários em ordem configurável.
 */
import { useState } from "react";
import { useRoute } from "wouter";
import {
  Shield, PenLine, CheckCircle2, XCircle, AlertTriangle, Plus,
  FileText, User, Building2, Clock, ChevronDown, ChevronUp, Trash2
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
  const [, params] = useRoute("/assinaturas/:entityType/:entityId");
  const entityType = (params?.entityType ?? "document") as DocumentSignaturesProps["entityType"];
  const entityId = parseInt(params?.entityId ?? "0");

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

        {entityId > 0 ? (
          <DocumentSignaturesPanel
            entityType={entityType}
            entityId={entityId}
          />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Documento não encontrado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
