import OmniLayout from "@/components/OmniLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronRight,
  Filter,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Shield,
  Star,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  complaint: { label: "Reclamação", icon: TriangleAlert, color: "text-orange-400" },
  denounce: { label: "Denúncia", icon: Shield, color: "text-red-400" },
  praise: { label: "Elogio", icon: Star, color: "text-yellow-400" },
  suggestion: { label: "Sugestão", icon: ThumbsUp, color: "text-blue-400" },
  request: { label: "Solicitação", icon: MessageSquare, color: "text-purple-400" },
  esic: { label: "e-SIC", icon: BookOpen, color: "text-green-400" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received: { label: "Recebida", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  in_analysis: { label: "Em Análise", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
  in_progress: { label: "Em Andamento", color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  answered: { label: "Respondida", color: "bg-green-500/15 text-green-400 border-green-500/20" },
  archived: { label: "Arquivada", color: "bg-muted text-muted-foreground border-border" },
};

function CreateManifestationDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "complaint" as any,
    subject: "",
    description: "",
    isAnonymous: false,
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    requesterCpfCnpj: "",
  });

  const create = trpc.caius.ombudsman.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Manifestação registrada com NUP: ${data.nup}`, { duration: 8000 });
      setOpen(false);
      setForm({ type: "complaint", subject: "", description: "", isAnonymous: false, requesterName: "", requesterEmail: "", requesterPhone: "", requesterCpfCnpj: "" });
      onCreated();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" />Nova Manifestação</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Registrar Manifestação de Ouvidoria
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Manifestação</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as any }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([v, c]) => (
                    <SelectItem key={v} value={v}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={form.isAnonymous}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isAnonymous: v }))}
              />
              <Label>Manifestação Anônima</Label>
            </div>
            <div className="col-span-2">
              <Label>Assunto *</Label>
              <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Assunto da manifestação" className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Descrição *</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descreva detalhadamente..." rows={4} className="mt-1" />
            </div>
          </div>

          {!form.isAnonymous && (
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dados do Manifestante</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nome</Label>
                  <Input value={form.requesterName} onChange={(e) => setForm((f) => ({ ...f, requesterName: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>CPF/CNPJ</Label>
                  <Input value={form.requesterCpfCnpj} onChange={(e) => setForm((f) => ({ ...f, requesterCpfCnpj: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input type="email" value={form.requesterEmail} onChange={(e) => setForm((f) => ({ ...f, requesterEmail: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={form.requesterPhone} onChange={(e) => setForm((f) => ({ ...f, requesterPhone: e.target.value }))} className="mt-1" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => create.mutate(form)}
            disabled={!form.subject || !form.description || create.isPending}
          >
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Registrar Manifestação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Ombudsman() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const utils = trpc.useUtils();

  const { data: manifestations, isLoading } = trpc.caius.ombudsman.list.useQuery({
    type: typeFilter === "all" ? undefined : typeFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
    limit: 100,
  });

  // Stats
  const stats = Object.keys(TYPE_CONFIG).map((type) => ({
    type,
    count: manifestations?.filter((m: any) => m.manifestation.type === type).length ?? 0,
  }));

  return (
    <OmniLayout title="Ouvidoria">
      <div className="p-6 space-y-6">
        {/* Type stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {stats.map(({ type, count }) => {
            const cfg = TYPE_CONFIG[type];
            const Icon = cfg.icon;
            return (
              <Card
                key={type}
                className={cn("bg-card border-border cursor-pointer hover:bg-muted/30 transition-colors", typeFilter === type && "border-primary/40 bg-primary/5")}
                onClick={() => setTypeFilter(typeFilter === type ? "" : type)}
              >
                <CardContent className="p-4 flex flex-col items-center gap-1">
                  <Icon className={cn("h-5 w-5", cfg.color)} />
                  <p className="text-lg font-bold text-foreground">{count}</p>
                  <p className="text-[10px] text-muted-foreground text-center">{cfg.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por NUP, assunto..." className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([v, c]) => <SelectItem key={v} value={v}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <CreateManifestationDialog onCreated={() => utils.caius.ombudsman.list.invalidate()} />
        </div>

        {/* Table */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">NUP</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assunto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manifestante</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                ) : !manifestations?.length ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-sm">Nenhuma manifestação encontrada</p>
                    </td>
                  </tr>
                ) : (
                  manifestations.map(({ manifestation, sector }: any) => {
                    const type = TYPE_CONFIG[manifestation.type] ?? TYPE_CONFIG.complaint;
                    const TypeIcon = type.icon;
                    const status = STATUS_CONFIG[manifestation.status] ?? STATUS_CONFIG.received;
                    return (
                      <tr key={manifestation.id} className="hover:bg-muted/30 cursor-pointer transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5">{manifestation.nup}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("flex items-center gap-1.5 text-xs font-medium", type.color)}>
                            <TypeIcon className="h-3.5 w-3.5" />
                            {type.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground line-clamp-1 max-w-xs">{manifestation.subject}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center text-xs border rounded-full px-2 py-0.5", status.color)}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">
                            {manifestation.isAnonymous ? "Anônimo" : (manifestation.requesterName ?? "—")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{new Date(manifestation.createdAt).toLocaleDateString("pt-BR")}</span>
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
