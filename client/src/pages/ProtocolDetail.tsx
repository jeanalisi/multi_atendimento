import OmniLayout from "@/components/OmniLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  Lock,
  MessageSquare,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: "Aberto", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  in_analysis: { label: "Em Análise", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
  pending_docs: { label: "Pendente Docs", color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  in_progress: { label: "Em Andamento", color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  concluded: { label: "Concluído", color: "bg-green-500/15 text-green-400 border-green-500/20" },
  archived: { label: "Arquivado", color: "bg-muted text-muted-foreground border-border" },
};

const ACTION_LABELS: Record<string, string> = {
  forward: "Encaminhado",
  return: "Devolvido",
  assign: "Atribuído",
  conclude: "Concluído",
  archive: "Arquivado",
  reopen: "Reaberto",
  comment: "Comentário",
};

interface Props {
  id: number;
  onBack: () => void;
}

function TramitationDialog({ protocolId, nup, onDone }: { protocolId: number; nup: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<any>("forward");
  const [dispatch, setDispatch] = useState("");
  const [toSectorId, setToSectorId] = useState<number | undefined>();
  const { data: sectors } = trpc.caius.sectors.list.useQuery();

  const create = trpc.caius.tramitations.create.useMutation({
    onSuccess: () => {
      toast.success("Tramitação registrada com sucesso");
      setOpen(false);
      setDispatch("");
      onDone();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          Tramitar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Tramitação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Ação</Label>
            <Select value={action} onValueChange={(v) => setAction(v as any)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="forward">Encaminhar</SelectItem>
                <SelectItem value="return">Devolver</SelectItem>
                <SelectItem value="assign">Atribuir</SelectItem>
                <SelectItem value="conclude">Concluir</SelectItem>
                <SelectItem value="archive">Arquivar</SelectItem>
                <SelectItem value="reopen">Reabrir</SelectItem>
                <SelectItem value="comment">Comentário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(action === "forward" || action === "assign") && (
            <div>
              <Label>Setor Destino</Label>
              <Select value={toSectorId?.toString() ?? ""} onValueChange={(v) => setToSectorId(v ? Number(v) : undefined)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar setor" /></SelectTrigger>
                <SelectContent>
                  {sectors?.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Despacho / Observação</Label>
            <Textarea
              value={dispatch}
              onChange={(e) => setDispatch(e.target.value)}
              placeholder="Descreva a ação realizada..."
              rows={4}
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => create.mutate({ protocolId, nup, action, dispatch, toSectorId })}
            disabled={create.isPending}
          >
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Registrar Tramitação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AiAssistDialog({ protocolId, nup, subject, description }: { protocolId: number; nup: string; subject: string; description?: string | null }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<any>("suggest_response");
  const [result, setResult] = useState("");

  const assist = trpc.caius.ai.assist.useMutation({
    onSuccess: (data) => setResult(data.suggestion),
    onError: (e) => toast.error(e.message),
  });

  const context = `NUP: ${nup}\nAssunto: ${subject}\n${description ? `Descrição: ${description}` : ""}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Assistente IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Assistente de IA — CAIUS
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Ação da IA</Label>
            <Select value={action} onValueChange={(v) => setAction(v as any)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="suggest_response">Sugerir Resposta</SelectItem>
                <SelectItem value="summarize">Resumir Protocolo</SelectItem>
                <SelectItem value="classify">Classificar e Sugerir Roteamento</SelectItem>
                <SelectItem value="suggest_routing">Sugerir Encaminhamento</SelectItem>
                <SelectItem value="extract_info">Extrair Informações</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => assist.mutate({ action, context, nup, entityType: "protocol", entityId: protocolId })}
              disabled={assist.isPending}
              className="gap-2"
            >
              {assist.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Gerar com IA
            </Button>
          </div>
          {result && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Resultado da IA</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProtocolDetail({ id, onBack }: Props) {
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.caius.protocols.byId.useQuery({ id });
  const { data: tramitations } = trpc.caius.tramitations.byProtocol.useQuery({ protocolId: id });

  if (isLoading) {
    return (
      <OmniLayout title="Protocolo">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </OmniLayout>
    );
  }

  if (!data) {
    return (
      <OmniLayout title="Protocolo">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">Protocolo não encontrado</p>
          <Button variant="outline" onClick={onBack}>Voltar</Button>
        </div>
      </OmniLayout>
    );
  }

  const { protocol, sector, responsible, creator } = data as any;
  const status = STATUS_CONFIG[protocol.status] ?? STATUS_CONFIG.open;

  return (
    <OmniLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 mt-0.5">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm bg-primary/10 text-primary border border-primary/20 rounded px-2 py-0.5 select-all">
                  {protocol.nup}
                </span>
                <span className={cn("inline-flex items-center text-xs border rounded-full px-2 py-0.5", status.color)}>
                  {status.label}
                </span>
                {protocol.isConfidential && (
                  <span className="inline-flex items-center gap-1 text-xs border rounded-full px-2 py-0.5 bg-red-500/10 text-red-400 border-red-500/20">
                    <Lock className="h-3 w-3" />
                    Sigiloso
                  </span>
                )}
              </div>
              <h1 className="text-xl font-semibold text-foreground">{protocol.subject}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AiAssistDialog
              protocolId={protocol.id}
              nup={protocol.nup}
              subject={protocol.subject}
              description={protocol.description}
            />
            <TramitationDialog
              protocolId={protocol.id}
              nup={protocol.nup}
              onDone={() => {
                utils.caius.protocols.byId.invalidate({ id });
                utils.caius.tramitations.byProtocol.invalidate({ protocolId: id });
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main info */}
          <div className="col-span-2 space-y-4">
            {protocol.description && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{protocol.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Tramitations */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Histórico de Tramitações ({tramitations?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!tramitations?.length ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma tramitação registrada</p>
                ) : (
                  <div className="space-y-3">
                    {tramitations.map((t: any) => (
                      <div key={t.tramitation.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <ArrowRight className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex-1 w-px bg-border mt-1" />
                        </div>
                        <div className="pb-4 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-foreground">
                              {ACTION_LABELS[t.tramitation.action] ?? t.tramitation.action}
                            </span>
                            {t.fromSector && (
                              <span className="text-xs text-muted-foreground">
                                {t.fromSector.name} → {t.toSector?.name ?? "—"}
                              </span>
                            )}
                          </div>
                          {t.tramitation.dispatch && (
                            <p className="text-sm text-foreground bg-muted/30 rounded p-2 border border-border">
                              {t.tramitation.dispatch}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {t.fromUser?.name ?? "Sistema"} · {new Date(t.tramitation.createdAt).toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="text-foreground font-medium">{protocol.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Canal</span>
                  <span className="text-foreground font-medium capitalize">{protocol.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prioridade</span>
                  <span className="text-foreground font-medium capitalize">{protocol.priority}</span>
                </div>
                {sector && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Setor</span>
                    <span className="text-foreground font-medium">{sector.name}</span>
                  </div>
                )}
                {responsible && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Responsável</span>
                    <span className="text-foreground font-medium">{responsible.name}</span>
                  </div>
                )}
                {creator && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Criado por</span>
                    <span className="text-foreground font-medium">{creator.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Abertura</span>
                  <span className="text-foreground font-medium">
                    {new Date(protocol.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {protocol.deadline && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prazo</span>
                    <span className="text-foreground font-medium">
                      {new Date(protocol.deadline).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requester */}
            {(protocol.requesterName || protocol.requesterEmail) && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Solicitante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {protocol.requesterName && (
                    <div>
                      <span className="text-muted-foreground">Nome</span>
                      <p className="text-foreground font-medium">{protocol.requesterName}</p>
                    </div>
                  )}
                  {protocol.requesterCpfCnpj && (
                    <div>
                      <span className="text-muted-foreground">CPF/CNPJ</span>
                      <p className="text-foreground font-mono text-xs">{protocol.requesterCpfCnpj}</p>
                    </div>
                  )}
                  {protocol.requesterEmail && (
                    <div>
                      <span className="text-muted-foreground">E-mail</span>
                      <p className="text-foreground text-xs">{protocol.requesterEmail}</p>
                    </div>
                  )}
                  {protocol.requesterPhone && (
                    <div>
                      <span className="text-muted-foreground">Telefone</span>
                      <p className="text-foreground">{protocol.requesterPhone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </OmniLayout>
  );
}
