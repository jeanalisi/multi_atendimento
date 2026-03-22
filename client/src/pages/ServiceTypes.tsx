import { useState } from "react";
import OmniLayout from "@/components/OmniLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Settings2, Clock, Shield, Camera, MapPin,
  CheckCircle2, XCircle, FileText, FormInput, FileCheck, ChevronRight,
  GripVertical, X, CircleDot, Circle, ArrowLeft,
} from "lucide-react";

const secrecyLabels: Record<string, { label: string; color: string }> = {
  public: { label: "Público", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  restricted: { label: "Restrito", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  confidential: { label: "Confidencial", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  secret: { label: "Sigiloso", color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const FIELD_TYPES = [
  { value: "text", label: "Texto" }, { value: "textarea", label: "Texto Longo" },
  { value: "number", label: "Número" }, { value: "email", label: "E-mail" },
  { value: "phone", label: "Telefone" }, { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" }, { value: "date", label: "Data" },
  { value: "datetime", label: "Data e Hora" }, { value: "select", label: "Seleção Única" },
  { value: "multiselect", label: "Seleção Múltipla" }, { value: "checkbox", label: "Caixa de Seleção" },
  { value: "radio", label: "Opção Única" }, { value: "file", label: "Arquivo" },
  { value: "image", label: "Imagem" }, { value: "signature", label: "Assinatura" },
  { value: "geolocation", label: "Geolocalização" },
];

const REQUIREMENT_CONFIG = {
  required: { label: "Obrigatório", color: "bg-red-500/10 text-red-400 border-red-500/20", Icon: CheckCircle2 },
  complementary: { label: "Complementar", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", Icon: CircleDot },
  optional: { label: "Opcional", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", Icon: Circle },
};

function ReqBadge({ r }: { r: string }) {
  const cfg = REQUIREMENT_CONFIG[r as keyof typeof REQUIREMENT_CONFIG] ?? REQUIREMENT_CONFIG.optional;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

type ServiceTypeForm = {
  name: string; description: string; category: string; code: string;
  slaResponseHours: string; slaConclusionHours: string;
  secrecyLevel: "public" | "restricted" | "confidential" | "secret";
  requiresApproval: boolean; canConvertToProcess: boolean; allowPublicConsult: boolean;
  requiresSelfie: boolean; requiresGeolocation: boolean; requiresStrongAuth: boolean;
};
const defaultForm: ServiceTypeForm = {
  name: "", description: "", category: "", code: "", slaResponseHours: "", slaConclusionHours: "",
  secrecyLevel: "public", requiresApproval: false, canConvertToProcess: false, allowPublicConsult: true,
  requiresSelfie: false, requiresGeolocation: false, requiresStrongAuth: false,
};

export default function ServiceTypes() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceTypeForm>(defaultForm);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("fields");
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [fieldForm, setFieldForm] = useState({ label: "", fieldType: "text", requirement: "optional", placeholder: "", helpText: "" });
  const [showDocForm, setShowDocForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [docForm, setDocForm] = useState({ name: "", description: "", requirement: "required", acceptedFormats: "pdf,jpg,png", maxSizeMb: 10 });

  const utils = trpc.useUtils();
  const { data: serviceTypes = [], refetch } = trpc.serviceTypes.list.useQuery({});
  const { data: fields = [] } = trpc.serviceTypeFields.list.useQuery(
    { serviceTypeId: selectedId! }, { enabled: !!selectedId }
  );
  const { data: documents = [] } = trpc.serviceTypeDocuments.list.useQuery(
    { serviceTypeId: selectedId! }, { enabled: !!selectedId }
  );

  const selectedType = serviceTypes.find((s: any) => s.id === selectedId);

  const createMutation = trpc.serviceTypes.create.useMutation({
    onSuccess: () => { toast.success("Tipo criado!"); refetch(); setOpen(false); setForm(defaultForm); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.serviceTypes.update.useMutation({
    onSuccess: () => { toast.success("Tipo atualizado!"); refetch(); setOpen(false); setEditId(null); setForm(defaultForm); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.serviceTypes.delete.useMutation({
    onSuccess: () => { toast.success("Tipo removido."); refetch(); if (selectedId === editId) setSelectedId(null); },
    onError: (e) => toast.error(e.message),
  });

  const createField = trpc.serviceTypeFields.create.useMutation({
    onSuccess: () => { utils.serviceTypeFields.list.invalidate({ serviceTypeId: selectedId! }); setShowFieldForm(false); setEditingField(null); toast.success("Campo adicionado"); },
    onError: (e) => toast.error(e.message),
  });
  const updateField = trpc.serviceTypeFields.update.useMutation({
    onSuccess: () => { utils.serviceTypeFields.list.invalidate({ serviceTypeId: selectedId! }); setShowFieldForm(false); setEditingField(null); toast.success("Campo atualizado"); },
  });
  const deleteField = trpc.serviceTypeFields.delete.useMutation({
    onSuccess: () => utils.serviceTypeFields.list.invalidate({ serviceTypeId: selectedId! }),
  });

  const createDoc = trpc.serviceTypeDocuments.create.useMutation({
    onSuccess: () => { utils.serviceTypeDocuments.list.invalidate({ serviceTypeId: selectedId! }); setShowDocForm(false); setEditingDoc(null); toast.success("Documento adicionado"); },
    onError: (e) => toast.error(e.message),
  });
  const updateDoc = trpc.serviceTypeDocuments.update.useMutation({
    onSuccess: () => { utils.serviceTypeDocuments.list.invalidate({ serviceTypeId: selectedId! }); setShowDocForm(false); setEditingDoc(null); toast.success("Documento atualizado"); },
  });
  const deleteDoc = trpc.serviceTypeDocuments.delete.useMutation({
    onSuccess: () => utils.serviceTypeDocuments.list.invalidate({ serviceTypeId: selectedId! }),
  });

  function openCreate() { setEditId(null); setForm(defaultForm); setOpen(true); }
  function openEdit(st: any) {
    setEditId(st.id);
    setForm({ name: st.name ?? "", description: st.description ?? "", category: st.category ?? "", code: st.code ?? "", slaResponseHours: st.slaResponseHours?.toString() ?? "", slaConclusionHours: st.slaConclusionHours?.toString() ?? "", secrecyLevel: st.secrecyLevel ?? "public", requiresApproval: st.requiresApproval ?? false, canConvertToProcess: st.canConvertToProcess ?? false, allowPublicConsult: st.allowPublicConsult ?? true, requiresSelfie: st.requiresSelfie ?? false, requiresGeolocation: st.requiresGeolocation ?? false, requiresStrongAuth: st.requiresStrongAuth ?? false });
    setOpen(true);
  }
  function handleSubmit() {
    const payload = { ...form, slaResponseHours: form.slaResponseHours ? Number(form.slaResponseHours) : undefined, slaConclusionHours: form.slaConclusionHours ? Number(form.slaConclusionHours) : undefined, code: form.code || undefined, category: form.category || undefined, description: form.description || undefined };
    if (editId) updateMutation.mutate({ id: editId, ...payload });
    else createMutation.mutate(payload);
  }
  function handleSaveField() {
    if (!selectedId) return;
    const name = fieldForm.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (editingField) updateField.mutate({ id: editingField.id, label: fieldForm.label, fieldType: fieldForm.fieldType as any, requirement: fieldForm.requirement as any, placeholder: fieldForm.placeholder || undefined, helpText: fieldForm.helpText || undefined });
    else createField.mutate({ serviceTypeId: selectedId, name, label: fieldForm.label, fieldType: fieldForm.fieldType as any, requirement: fieldForm.requirement as any, placeholder: fieldForm.placeholder || undefined, helpText: fieldForm.helpText || undefined });
  }
  function handleSaveDoc() {
    if (!selectedId) return;
    if (editingDoc) updateDoc.mutate({ id: editingDoc.id, name: docForm.name, description: docForm.description || undefined, requirement: docForm.requirement as any, acceptedFormats: docForm.acceptedFormats, maxSizeMb: docForm.maxSizeMb });
    else createDoc.mutate({ serviceTypeId: selectedId, name: docForm.name, description: docForm.description || undefined, requirement: docForm.requirement as any, acceptedFormats: docForm.acceptedFormats, maxSizeMb: docForm.maxSizeMb });
  }

  return (
    <OmniLayout>
      {selectedId && selectedType ? (
        /* ── Detail view: fields & documents ── */
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="p-5 border-b border-border/50 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />Voltar
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground truncate">{selectedType.name}</h1>
                {selectedType.code && <Badge variant="outline" className="font-mono text-xs">{selectedType.code}</Badge>}
                <Badge className={`text-xs border ${secrecyLabels[selectedType.secrecyLevel]?.color ?? ""}`}>
                  <Shield className="w-3 h-3 mr-1" />{secrecyLabels[selectedType.secrecyLevel]?.label}
                </Badge>
              </div>
              {selectedType.description && <p className="text-xs text-muted-foreground mt-0.5">{selectedType.description}</p>}
            </div>
            <Button variant="outline" size="sm" onClick={() => openEdit(selectedType)}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" />Editar
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="mx-5 mt-4 w-fit">
              <TabsTrigger value="fields">
                <FormInput className="w-4 h-4 mr-1.5" />Campos do Formulário
                {fields.length > 0 && <Badge className="ml-1.5 h-4 px-1 text-xs">{fields.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileCheck className="w-4 h-4 mr-1.5" />Documentos Exigidos
                {documents.length > 0 && <Badge className="ml-1.5 h-4 px-1 text-xs">{documents.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            {/* FIELDS TAB */}
            <TabsContent value="fields" className="flex-1 overflow-y-auto p-5">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Campos do Formulário</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Configure os campos exibidos ao cidadão ao abrir este tipo de atendimento</p>
                  </div>
                  <Button size="sm" onClick={() => { setEditingField(null); setFieldForm({ label: "", fieldType: "text", requirement: "optional", placeholder: "", helpText: "" }); setShowFieldForm(true); }}>
                    <Plus className="w-4 h-4 mr-1.5" />Adicionar Campo
                  </Button>
                </div>

                {fields.length > 0 && (
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border/30 text-xs">
                    <span className="text-muted-foreground">Resumo:</span>
                    <span className="text-red-400 font-medium">{(fields as any[]).filter(f => f.requirement === "required").length} obrigatórios</span>
                    <span className="text-amber-400 font-medium">{(fields as any[]).filter(f => f.requirement === "complementary").length} complementares</span>
                    <span className="text-zinc-400 font-medium">{(fields as any[]).filter(f => f.requirement === "optional").length} opcionais</span>
                  </div>
                )}

                {fields.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-lg">
                    <FormInput className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum campo configurado</p>
                    <p className="text-xs mt-1">Adicione campos obrigatórios e complementares para este serviço</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(fields as any[]).map(f => (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/30 group hover:border-border/60 transition-colors">
                        <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-foreground">{f.label}</span>
                            <ReqBadge r={f.requirement} />
                            <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                              {FIELD_TYPES.find(t => t.value === f.fieldType)?.label ?? f.fieldType}
                            </span>
                          </div>
                          {(f.placeholder || f.helpText) && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {f.helpText || f.placeholder}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingField(f); setFieldForm({ label: f.label, fieldType: f.fieldType, requirement: f.requirement, placeholder: f.placeholder ?? "", helpText: f.helpText ?? "" }); setShowFieldForm(true); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteField.mutate({ id: f.id })}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* DOCUMENTS TAB */}
            <TabsContent value="documents" className="flex-1 overflow-y-auto p-5">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Documentos Exigidos</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Configure os documentos que o cidadão deve apresentar para este serviço</p>
                  </div>
                  <Button size="sm" onClick={() => { setEditingDoc(null); setDocForm({ name: "", description: "", requirement: "required", acceptedFormats: "pdf,jpg,png", maxSizeMb: 10 }); setShowDocForm(true); }}>
                    <Plus className="w-4 h-4 mr-1.5" />Adicionar Documento
                  </Button>
                </div>

                {documents.length > 0 && (
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border/30 text-xs">
                    <span className="text-muted-foreground">Resumo:</span>
                    <span className="text-red-400 font-medium">{(documents as any[]).filter(d => d.requirement === "required").length} obrigatórios</span>
                    <span className="text-amber-400 font-medium">{(documents as any[]).filter(d => d.requirement === "complementary").length} complementares</span>
                    <span className="text-zinc-400 font-medium">{(documents as any[]).filter(d => d.requirement === "optional").length} opcionais</span>
                  </div>
                )}

                {documents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-lg">
                    <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum documento configurado</p>
                    <p className="text-xs mt-1">Adicione documentos obrigatórios e complementares para este serviço</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(documents as any[]).map(d => (
                      <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/30 group hover:border-border/60 transition-colors">
                        <FileText className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-foreground">{d.name}</span>
                            <ReqBadge r={d.requirement} />
                          </div>
                          {d.description && <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Formatos: {d.acceptedFormats} · Máx: {d.maxSizeMb}MB
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingDoc(d); setDocForm({ name: d.name, description: d.description ?? "", requirement: d.requirement, acceptedFormats: d.acceptedFormats ?? "pdf,jpg,png", maxSizeMb: d.maxSizeMb ?? 10 }); setShowDocForm(true); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteDoc.mutate({ id: d.id })}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        /* ── List view: service type cards ── */
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Tipos de Atendimento</h1>
              <p className="text-sm text-muted-foreground mt-1">Configure os serviços, campos obrigatórios, documentos exigidos, SLAs e fluxos de tramitação.</p>
            </div>
            <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" />Novo Tipo</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {serviceTypes.length === 0 && (
              <div className="col-span-3 text-center py-16 text-muted-foreground">
                <Settings2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum tipo de atendimento configurado.</p>
                <p className="text-sm mt-1">Crie o primeiro tipo para começar a receber protocolos.</p>
              </div>
            )}
            {(serviceTypes as any[]).map((st) => {
              const secrecy = secrecyLabels[st.secrecyLevel] ?? secrecyLabels.public;
              return (
                <div key={st.id} className="rounded-xl border border-border bg-card hover:border-primary/40 transition-colors p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{st.name}</h3>
                      {st.code && <p className="font-mono text-xs text-muted-foreground mt-0.5">{st.code}</p>}
                    </div>
                    <Badge className={`text-xs border shrink-0 ${secrecy.color}`}>
                      <Shield className="w-3 h-3 mr-1" />{secrecy.label}
                    </Badge>
                  </div>
                  {st.description && <p className="text-xs text-muted-foreground line-clamp-2">{st.description}</p>}
                  {(st.slaResponseHours || st.slaConclusionHours) && (
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {st.slaResponseHours && <span>Resposta: {st.slaResponseHours}h</span>}
                      {st.slaConclusionHours && <span>Conclusão: {st.slaConclusionHours}h</span>}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {st.requiresSelfie && <span className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded px-1.5 py-0.5"><Camera className="w-3 h-3" />Selfie</span>}
                    {st.requiresGeolocation && <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded px-1.5 py-0.5"><MapPin className="w-3 h-3" />Geoloc.</span>}
                    {st.requiresApproval && <span className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1.5 py-0.5"><CheckCircle2 className="w-3 h-3" />Aprovação</span>}
                    {!st.isActive && <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded px-1.5 py-0.5"><XCircle className="w-3 h-3" />Inativo</span>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => { setSelectedId(st.id); setActiveTab("fields"); }}>
                      <FormInput className="w-3.5 h-3.5" />Campos & Docs
                      <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(st)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate({ id: st.id })}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create/Edit Service Type Dialog */}
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
              <div className="space-y-1.5">
                <Label>SLA Resposta (horas)</Label>
                <Input type="number" value={form.slaResponseHours} onChange={e => setForm(f => ({ ...f, slaResponseHours: e.target.value }))} placeholder="Ex: 24" />
              </div>
              <div className="space-y-1.5">
                <Label>SLA Conclusão (horas)</Label>
                <Input type="number" value={form.slaConclusionHours} onChange={e => setForm(f => ({ ...f, slaConclusionHours: e.target.value }))} placeholder="Ex: 720" />
              </div>
              <div className="col-span-2 space-y-1.5">
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
                  <div className="flex items-center gap-2 text-sm"><Icon className="w-4 h-4 text-muted-foreground" />{label}</div>
                  <Switch checked={(form as any)[key]} onCheckedChange={v => setForm(f => ({ ...f, [key]: v }))} />
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

      {/* Field Form Dialog */}
      <Dialog open={showFieldForm} onOpenChange={setShowFieldForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingField ? "Editar Campo" : "Adicionar Campo"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Rótulo (label) *</Label>
              <Input placeholder="Ex: Nome Completo" value={fieldForm.label} onChange={e => setFieldForm(p => ({ ...p, label: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de Campo</Label>
                <Select value={fieldForm.fieldType} onValueChange={v => setFieldForm(p => ({ ...p, fieldType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Obrigatoriedade</Label>
                <Select value={fieldForm.requirement} onValueChange={v => setFieldForm(p => ({ ...p, requirement: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Obrigatório</SelectItem>
                    <SelectItem value="complementary">Complementar</SelectItem>
                    <SelectItem value="optional">Opcional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Placeholder</Label>
              <Input placeholder="Texto de exemplo no campo..." value={fieldForm.placeholder} onChange={e => setFieldForm(p => ({ ...p, placeholder: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Texto de Ajuda</Label>
              <Input placeholder="Instrução para o cidadão..." value={fieldForm.helpText} onChange={e => setFieldForm(p => ({ ...p, helpText: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFieldForm(false)}>Cancelar</Button>
            <Button onClick={handleSaveField} disabled={!fieldForm.label || createField.isPending || updateField.isPending}>
              {editingField ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Form Dialog */}
      <Dialog open={showDocForm} onOpenChange={setShowDocForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingDoc ? "Editar Documento" : "Adicionar Documento"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Nome do Documento *</Label>
              <Input placeholder="Ex: RG ou CNH" value={docForm.name} onChange={e => setDocForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea placeholder="Instruções sobre o documento..." value={docForm.description} onChange={e => setDocForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Obrigatoriedade</Label>
              <Select value={docForm.requirement} onValueChange={v => setDocForm(p => ({ ...p, requirement: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Obrigatório</SelectItem>
                  <SelectItem value="complementary">Complementar</SelectItem>
                  <SelectItem value="optional">Opcional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Formatos Aceitos</Label>
                <Input placeholder="pdf,jpg,png" value={docForm.acceptedFormats} onChange={e => setDocForm(p => ({ ...p, acceptedFormats: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Tamanho Máximo (MB)</Label>
                <Input type="number" value={docForm.maxSizeMb} onChange={e => setDocForm(p => ({ ...p, maxSizeMb: parseInt(e.target.value) || 10 }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocForm(false)}>Cancelar</Button>
            <Button onClick={handleSaveDoc} disabled={!docForm.name || createDoc.isPending || updateDoc.isPending}>
              {editingDoc ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OmniLayout>
  );
}
