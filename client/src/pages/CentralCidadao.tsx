import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Search, Clock, Shield, Camera, MapPin, CheckCircle2, FileText,
  FormInput, ChevronRight, Building2, Phone, Mail, Globe, ArrowLeft,
  FileCheck, CircleDot, Circle, Info, ExternalLink, Scale,
} from "lucide-react";

const secrecyLabels: Record<string, { label: string; color: string }> = {
  public: { label: "Público", color: "bg-green-500/15 text-green-600 border-green-500/30" },
  restricted: { label: "Restrito", color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" },
  confidential: { label: "Confidencial", color: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
  secret: { label: "Sigiloso", color: "bg-red-500/15 text-red-600 border-red-500/30" },
};

const REQUIREMENT_CONFIG = {
  required: { label: "Obrigatório", color: "text-red-600 bg-red-500/10 border-red-500/30", Icon: CheckCircle2 },
  complementary: { label: "Complementar", color: "text-amber-600 bg-amber-500/10 border-amber-500/30", Icon: CircleDot },
  optional: { label: "Opcional", color: "text-muted-foreground bg-muted border-border", Icon: Circle },
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

export default function CentralCidadao() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);

  const { data: services = [], isLoading } = trpc.cidadao.listServices.useQuery({
    search: search || undefined,
    category: selectedCategory || undefined,
  });
  const { data: detail } = trpc.cidadao.getService.useQuery(
    { id: selectedService?.id ?? 0 },
    { enabled: !!selectedService?.id }
  );

  const categories = Array.from(
    new Set((services as any[]).filter((s) => s.category).map((s: any) => s.category))
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Central de Serviços ao Cidadão</h1>
              <p className="text-xs text-muted-foreground">Município de Itabaiana — Encontre e solicite serviços públicos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href="/consulta">
                <Search className="w-3.5 h-3.5" />Consultar Protocolo
              </a>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <a href="/">
                <ExternalLink className="w-3.5 h-3.5" />Área Restrita
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* ── Hero search ── */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">Como podemos te ajudar?</h2>
          <p className="text-muted-foreground mb-6">
            Encontre o serviço que você precisa e veja os documentos e informações necessários
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              className="pl-12 h-12 text-base rounded-xl bg-card border-border focus-visible:ring-primary"
              placeholder="Buscar serviço... (ex: certidão, alvará, licença)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Category filters ── */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                !selectedCategory
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50 hover:text-primary"
              )}
            >
              Todos os serviços
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/50 hover:text-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Services grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (services as any[]).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-foreground">Nenhum serviço encontrado</p>
            <p className="text-sm mt-1">Tente buscar com outros termos ou remova os filtros</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {(services as any[]).length} serviço{(services as any[]).length !== 1 ? "s" : ""} disponível{(services as any[]).length !== 1 ? "is" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(services as any[]).map((svc) => {
                const secrecy = secrecyLabels[svc.secrecyLevel] ?? secrecyLabels.public;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className="text-left bg-card rounded-xl border border-border p-5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {svc.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                    </div>

                    {svc.category && (
                      <span className="inline-block text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 mb-2">
                        {svc.category}
                      </span>
                    )}

                    {svc.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{svc.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                      {svc.slaResponseHours && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />Resposta em {svc.slaResponseHours}h
                        </span>
                      )}
                      {svc.requiresSelfie && (
                        <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-500/10 border border-purple-500/20 rounded px-1.5 py-0.5">
                          <Camera className="w-3 h-3" />Selfie
                        </span>
                      )}
                      {svc.requiresGeolocation && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">
                          <MapPin className="w-3 h-3" />Localização
                        </span>
                      )}
                      {svc.requiresApproval && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">
                          <CheckCircle2 className="w-3 h-3" />Aprovação
                        </span>
                      )}
                    </div>

                    {(svc.fieldsCount > 0 || svc.documentsCount > 0) && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                        {svc.fieldsCount > 0 && (
                          <span className="flex items-center gap-1">
                            <FormInput className="w-3 h-3" />{svc.fieldsCount} campo{svc.fieldsCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {svc.documentsCount > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />{svc.documentsCount} doc{svc.documentsCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Footer info ── */}
        <div className="mt-12 p-6 rounded-xl bg-card border border-border flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">Precisa de ajuda?</h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              Entre em contato com nossa central de atendimento ou acesse a área restrita para acompanhar seus protocolos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="tel:" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />Telefone
            </a>
            <a href="mailto:" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />E-mail
            </a>
            <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Globe className="w-4 h-4" />Portal
            </a>
          </div>
        </div>
      </main>

      {/* ── Service Detail Modal ── */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <button
                onClick={() => setSelectedService(null)}
                className="mt-1 p-1 rounded-lg hover:bg-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <div className="flex-1">
                <DialogTitle className="text-xl text-foreground">{selectedService?.name}</DialogTitle>
                {selectedService?.category && (
                  <span className="inline-block text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 mt-1">
                    {selectedService.category}
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {selectedService?.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">{selectedService.description}</p>
            )}

            {/* Service info cards */}
            <div className="grid grid-cols-2 gap-3">
              {selectedService?.slaResponseHours && (
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3.5 h-3.5" />Prazo de Resposta
                  </div>
                  <p className="font-semibold text-foreground">{selectedService.slaResponseHours} horas</p>
                </div>
              )}
              {selectedService?.slaConclusionHours && (
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3.5 h-3.5" />Prazo de Conclusão
                  </div>
                  <p className="font-semibold text-foreground">{selectedService.slaConclusionHours} horas</p>
                </div>
              )}
              <div className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Shield className="w-3.5 h-3.5" />Nível de Acesso
                </div>
                <p className="font-semibold text-foreground">
                  {secrecyLabels[selectedService?.secrecyLevel]?.label ?? "Público"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />Aprovação
                </div>
                <p className="font-semibold text-foreground">
                  {selectedService?.requiresApproval ? "Necessária" : "Automática"}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {(selectedService?.requiresSelfie || selectedService?.requiresGeolocation) && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <h4 className="font-semibold text-amber-600 text-sm mb-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />Requisitos Especiais
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedService.requiresSelfie && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-amber-600">
                      <Camera className="w-4 h-4" />Este serviço requer captura de selfie para identificação
                    </span>
                  )}
                  {selectedService.requiresGeolocation && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-amber-600">
                      <MapPin className="w-4 h-4" />Este serviço requer confirmação de localização
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Fields */}
            {detail?.fields && (detail.fields as any[]).length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FormInput className="w-4 h-4 text-primary" />
                  Informações Necessárias
                  <span className="text-xs font-normal text-muted-foreground">
                    ({(detail.fields as any[]).length} campo{(detail.fields as any[]).length !== 1 ? "s" : ""})
                  </span>
                </h4>
                <div className="space-y-2">
                  {(detail.fields as any[]).map((f: any) => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                      <div>
                        <span className="text-sm font-medium text-foreground">{f.label}</span>
                        {f.helpText && <p className="text-xs text-muted-foreground mt-0.5">{f.helpText}</p>}
                      </div>
                      <ReqBadge r={f.requirement} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {detail?.documents && (detail.documents as any[]).length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-primary" />
                  Documentos Necessários
                  <span className="text-xs font-normal text-muted-foreground">
                    ({(detail.documents as any[]).length} documento{(detail.documents as any[]).length !== 1 ? "s" : ""})
                  </span>
                </h4>
                <div className="space-y-2">
                  {(detail.documents as any[]).map((d: any) => (
                    <div key={d.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted border border-border">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-foreground">{d.name}</span>
                          {d.description && <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>}
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            Formatos: {d.acceptedFormats} · Máx: {d.maxSizeMb}MB
                          </p>
                        </div>
                      </div>
                      <ReqBadge r={d.requirement} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="p-4 rounded-xl bg-primary text-primary-foreground">
              <h4 className="font-semibold mb-1">Pronto para solicitar?</h4>
              <p className="text-sm text-primary-foreground/80 mb-3">
                Acesse a área restrita para abrir um protocolo para este serviço.
              </p>
              <Button variant="secondary" size="sm" className="bg-background text-foreground hover:bg-background/90" asChild>
                <a href="/">Acessar e Solicitar <ExternalLink className="w-3.5 h-3.5 ml-1.5" /></a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
