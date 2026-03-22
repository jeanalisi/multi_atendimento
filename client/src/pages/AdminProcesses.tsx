import OmniLayout from "@/components/OmniLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Loader2,
  Plus,
  Scale,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "Aberto", color: "bg-blue-500/15 text-blue-400 border-blue-500/20", icon: Clock },
  in_analysis: { label: "Em Análise", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", icon: AlertCircle },
  pending_docs: { label: "Pendente Docs", color: "bg-orange-500/15 text-orange-400 border-orange-500/20", icon: AlertCircle },
  in_progress: { label: "Em Andamento", color: "bg-purple-500/15 text-purple-400 border-purple-500/20", icon: Clock },
  concluded: { label: "Concluído", color: "bg-green-500/15 text-green-400 border-green-500/20", icon: CheckCircle2 },
  archived: { label: "Arquivado", color: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

const PROCESS_TYPES = [
  "Licitação", "Contrato", "Convênio", "Sindicância", "PAD",
  "Recurso Administrativo", "Dispensa de Licitação", "Inexigibilidade",
  "Prestação de Contas", "Outro",
];

function CreateProcessDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    legalBasis: "",
    observations: "",
    priority: "normal" as any,
    isConfidential: false,
    originProtocolNup: "",
  });
  const { data: sectors } = trpc.caius.sectors.list.useQuery();
  const [sectorId, setSectorId] = useState<number | undefined>();

  const create = trpc.caius.processes.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Processo criado com NUP: ${data.nup}`, { duration: 8000 });
      setOpen(false);
      setForm({ title: "", type: "", description: "", legalBasis: "", observations: "", priority: "normal", isConfidential: false, originProtocolNup: "" });
      onCreated();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" />Novo Processo</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Abrir Processo Administrativo
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título do processo" className="mt-1" />
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                <SelectContent>
                  {PROCESS_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as any }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setor Responsável</Label>
              <Select value={sectorId?.toString() ?? "none"} onValueChange={(v) => setSectorId(v && v !== "none" ? Number(v) : undefined)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar setor" /></SelectTrigger>
                <SelectContent>
                  {sectors?.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>NUP de Origem (opcional)</Label>
              <Input value={form.originProtocolNup} onChange={(e) => setForm((f) => ({ ...f, originProtocolNup: e.target.value }))} placeholder="NUP do protocolo origem" className="mt-1 font-mono text-sm" />
            </div>
            <div className="col-span-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="mt-1" />
            </div>
            <div>
              <Label>Fundamento Legal</Label>
              <Input value={form.legalBasis} onChange={(e) => setForm((f) => ({ ...f, legalBasis: e.target.value }))} placeholder="Ex: Lei 8.666/93, art. 24" className="mt-1" />
            </div>
            <div>
              <Label>Observações</Label>
              <Input value={form.observations} onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))} className="mt-1" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => create.mutate({ ...form, responsibleSectorId: sectorId, originProtocolNup: form.originProtocolNup || undefined })}
            disabled={!form.title || !form.type || create.isPending}
          >
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Abrir Processo e Gerar NUP
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminProcesses() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const utils = trpc.useUtils();

  const { data: processes, isLoading } = trpc.caius.processes.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
    limit: 100,
  });

  return (
    <OmniLayout title="Processos Administrativos">
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por NUP, título..." className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([v, c]) => <SelectItem key={v} value={v}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <CreateProcessDialog onCreated={() => utils.caius.processes.list.invalidate()} />
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">NUP</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Título</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Setor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Abertura</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                ) : !processes?.length ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Scale className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-sm">Nenhum processo encontrado</p>
                    </td>
                  </tr>
                ) : (
                  processes.map(({ process, sector, responsible }: any) => {
                    const status = STATUS_CONFIG[process.status] ?? STATUS_CONFIG.open;
                    const StatusIcon = status.icon;
                    return (
                      <tr key={process.id} className="hover:bg-muted/30 cursor-pointer transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5">{process.nup}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground line-clamp-1 max-w-xs">{process.title}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{process.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center gap-1 text-xs border rounded-full px-2 py-0.5", status.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{sector?.name ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{new Date(process.createdAt).toLocaleDateString("pt-BR")}</span>
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </OmniLayout>
  );
}
