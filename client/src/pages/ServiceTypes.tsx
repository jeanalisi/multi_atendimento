import { useState } from "react";
import OmniLayout from "@/components/OmniLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Settings2,
  Clock,
  Shield,
  Camera,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const secrecyLabels: Record<string, { label: string; color: string }> = {
  public: { label: "Público", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  restricted: { label: "Restrito", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  confidential: { label: "Confidencial", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  secret: { label: "Sigiloso", color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

type ServiceTypeForm = {
  name: string;
  description: string;
  category: string;
  code: string;
  slaResponseHours: string;
  slaConclusionHours: string;
  secrecyLevel: "public" | "restricted" | "confidential" | "secret";
  requiresApproval: boolean;
  canConvertToProcess: boolean;
  allowPublicConsult: boolean;
  requiresSelfie: boolean;
  requiresGeolocation: boolean;
  requiresStrongAuth: boolean;
};

const defaultForm: ServiceTypeForm = {
  name: "",
  description: "",
  category: "",
  code: "",
  slaResponseHours: "",
  slaConclusionHours: "",
  secrecyLevel: "public",
  requiresApproval: false,
  canConvertToProcess: false,
  allowPublicConsult: true,
  requiresSelfie: false,
  requiresGeolocation: false,
  requiresStrongAuth: false,
};

export default function ServiceTypes() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceTypeForm>(defaultForm);

  const { data: serviceTypes = [], refetch } = trpc.serviceTypes.list.useQuery({});

  const createMutation = trpc.serviceTypes.create.useMutation({
    onSuccess: () => { toast.success("Tipo de atendimento criado!"); refetch(); setOpen(false); setForm(defaultForm); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.serviceTypes.update.useMutation({
    onSuccess: () => { toast.success("Tipo atualizado!"); refetch(); setOpen(false); setEditId(null); setForm(defaultForm); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.serviceTypes.delete.useMutation({
    onSuccess: () => { toast.success("Tipo removido."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  function openCreate() {
    setEditId(null);
    setForm(defaultForm);
    setOpen(true);
  }

  function openEdit(st: any) {
    setEditId(st.id);
    setForm({
      name: st.name ?? "",
      description: st.description ?? "",
      category: st.category ?? "",
      code: st.code ?? "",
      slaResponseHours: st.slaResponseHours?.toString() ?? "",
      slaConclusionHours: st.slaConclusionHours?.toString() ?? "",
      secrecyLevel: st.secrecyLevel ?? "public",
      requiresApproval: st.requiresApproval ?? false,
      canConvertToProcess: st.canConvertToProcess ?? false,
      allowPublicConsult: st.allowPublicConsult ?? true,
      requiresSelfie: st.requiresSelfie ?? false,
      requiresGeolocation: st.requiresGeolocation ?? false,
      requiresStrongAuth: st.requiresStrongAuth ?? false,
    });
    setOpen(true);
  }

  function handleSubmit() {
    const payload = {
      ...form,
      slaResponseHours: form.slaResponseHours ? Number(form.slaResponseHours) : undefined,
      slaConclusionHours: form.slaConclusionHours ? Number(form.slaConclusionHours) : undefined,
      code: form.code || undefined,
      category: form.category || undefined,
      description: form.description || undefined,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <OmniLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Tipos de Atendimento</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure os serviços oferecidos, SLAs, sigilo, selfie, geolocalização e fluxos de tramitação.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Tipo
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {serviceTypes.length === 0 && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              <Settings2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum tipo de atendimento configurado.</p>
              <p className="text-sm mt-1">Crie o primeiro tipo para começar a receber protocolos.</p>
            </div>
          )}
          {serviceTypes.map((st: any) => {
            const secrecy = secrecyLabels[st.secrecyLevel] ?? secrecyLabels.public;
            return (
              <Card key={st.id} className="border-border bg-card hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{st.name}</CardTitle>
                      {st.code && (
                        <CardDescription className="font-mono text-xs mt-0.5">{st.code}</CardDescription>
                      )}
                    </div>
                    <Badge className={`text-xs border shrink-0 ${secrecy.color}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {secrecy.label}
                    </Badge>
                  </div>
                  {st.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{st.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* SLA */}
                  {(st.slaResponseHours || st.slaConclusionHours) && (
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {st.slaResponseHours && <span>Resposta: {st.slaResponseHours}h</span>}
                      {st.slaConclusionHours && <span>Conclusão: {st.slaConclusionHours}h</span>}
                    </div>
                  )}
                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5">
                    {st.requiresSelfie && (
                      <span className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded px-1.5 py-0.5">
                        <Camera className="w-3 h-3" /> Selfie
                      </span>
                    )}
                    {st.requiresGeolocation && (
                      <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded px-1.5 py-0.5">
                        <MapPin className="w-3 h-3" /> Geoloc.
                      </span>
                    )}
                    {st.requiresApproval && (
                      <span className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1.5 py-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Aprovação
                      </span>
                    )}
                    {st.canConvertToProcess && (
                      <span className="flex items-center gap-1 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded px-1.5 py-0.5">
                        <Settings2 className="w-3 h-3" /> Processo
                      </span>
                    )}
                    {!st.isActive && (
                      <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded px-1.5 py-0.5">
                        <XCircle className="w-3 h-3" /> Inativo
                      </span>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => openEdit(st)}>
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate({ id: st.id })}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Tipo de Atendimento" : "Novo Tipo de Atendimento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Nome do Serviço *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Solicitação de Certidão" />
              </div>
              <div className="space-y-1.5">
                <Label>Código</Label>
                <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="Ex: CERT-001" className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ex: Documentação" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Descreva o serviço..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>SLA Resposta (horas)</Label>
                <Input type="number" value={form.slaResponseHours} onChange={e => setForm(f => ({ ...f, slaResponseHours: e.target.value }))} placeholder="Ex: 24" />
              </div>
              <div className="space-y-1.5">
                <Label>SLA Conclusão (horas)</Label>
                <Input type="number" value={form.slaConclusionHours} onChange={e => setForm(f => ({ ...f, slaConclusionHours: e.target.value }))} placeholder="Ex: 72" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Nível de Sigilo</Label>
              <Select value={form.secrecyLevel} onValueChange={(v: any) => setForm(f => ({ ...f, secrecyLevel: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="restricted">Restrito</SelectItem>
                  <SelectItem value="confidential">Confidencial</SelectItem>
                  <SelectItem value="secret">Sigiloso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { key: "requiresSelfie", label: "Exige Selfie", icon: Camera },
                { key: "requiresGeolocation", label: "Exige Geolocalização", icon: MapPin },
                { key: "requiresApproval", label: "Requer Aprovação", icon: CheckCircle2 },
                { key: "requiresStrongAuth", label: "Autenticação Forte", icon: Shield },
                { key: "canConvertToProcess", label: "Pode virar Processo", icon: Settings2 },
                { key: "allowPublicConsult", label: "Consulta Pública", icon: CheckCircle2 },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {label}
                  </div>
                  <Switch
                    checked={(form as any)[key]}
                    onCheckedChange={v => setForm(f => ({ ...f, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!form.name || createMutation.isPending || updateMutation.isPending}>
              {editId ? "Salvar Alterações" : "Criar Tipo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OmniLayout>
  );
}
