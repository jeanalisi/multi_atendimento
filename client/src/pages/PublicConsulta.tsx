import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  Lock,
  Scale,
  Search,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "Aberto", color: "text-blue-400", icon: Clock },
  in_analysis: { label: "Em Análise", color: "text-yellow-400", icon: Clock },
  pending_docs: { label: "Pendente de Documentos", color: "text-orange-400", icon: Clock },
  in_progress: { label: "Em Andamento", color: "text-purple-400", icon: Clock },
  concluded: { label: "Concluído", color: "text-green-400", icon: CheckCircle2 },
  archived: { label: "Arquivado", color: "text-muted-foreground", icon: Clock },
  received: { label: "Recebida", color: "text-blue-400", icon: Clock },
  in_progress2: { label: "Em Andamento", color: "text-purple-400", icon: Clock },
  answered: { label: "Respondida", color: "text-green-400", icon: CheckCircle2 },
};

const ENTITY_ICONS: Record<string, any> = {
  protocol: ClipboardList,
  adminProcess: Scale,
  officialDocument: FileText,
  ombudsman: BookOpen,
};

const ENTITY_LABELS: Record<string, string> = {
  protocol: "Protocolo",
  adminProcess: "Processo Administrativo",
  officialDocument: "Documento Oficial",
  ombudsman: "Manifestação de Ouvidoria",
};

export default function PublicConsulta() {
  const [nupInput, setNupInput] = useState("");
  const [searchNup, setSearchNup] = useState("");

  const { data: result, isLoading, error } = trpc.caius.public.lookupNup.useQuery(
    { nup: searchNup },
    { enabled: !!searchNup, retry: false }
  );

  const handleSearch = () => {
    if (nupInput.trim()) setSearchNup(nupInput.trim());
  };

  const EntityIcon = result ? (ENTITY_ICONS[result.entity] ?? ClipboardList) : ClipboardList;
  const statusCfg = result ? (STATUS_CONFIG[(result.data as any).status] ?? STATUS_CONFIG.open) : null;
  const StatusIcon = statusCfg?.icon ?? Clock;

  return (
    <div className="light min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">CAIUS</p>
              <p className="text-[10px] text-muted-foreground">Consulta Pública</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Acessar plataforma
            </Button>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-start pt-16 px-6">
        <div className="w-full max-w-2xl space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Search className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Consulta de Protocolo</h1>
            <p className="text-muted-foreground text-sm">
              Digite o NUP (Número Único de Protocolo) para acompanhar o status do seu atendimento
            </p>
          </div>

          {/* Search */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Input
                  value={nupInput}
                  onChange={(e) => setNupInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Ex: 2026.001.000001"
                  className="font-mono text-base flex-1"
                />
                <Button onClick={handleSearch} disabled={!nupInput.trim() || isLoading} className="gap-2 px-6">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Consultar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                O NUP é fornecido no momento do registro do protocolo ou manifestação
              </p>
            </CardContent>
          </Card>

          {/* Result */}
          {searchNup && !isLoading && (
            <>
              {error || !result ? (
                <Card className="bg-card border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                    <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-foreground font-medium">NUP não encontrado</p>
                    <p className="text-sm text-muted-foreground">Verifique o número e tente novamente</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <EntityIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{ENTITY_LABELS[result.entity] ?? "Registro"}</p>
                        <CardTitle className="text-base font-semibold">
                          {(result.data as any).subject ?? (result.data as any).title ?? "Registro encontrado"}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(result.data as any).isConfidential ? (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <Lock className="h-4 w-4 text-red-400" />
                        <p className="text-sm text-red-400">Este registro é sigiloso. Informações restritas.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">NUP</p>
                          <p className="font-mono text-sm bg-primary/10 text-primary border border-primary/20 rounded px-2 py-1 inline-block">
                            {(result.data as any).nup}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <div className={cn("flex items-center gap-1.5", statusCfg?.color)}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="font-medium">{statusCfg?.label ?? (result.data as any).status}</span>
                          </div>
                        </div>
                        {(result.data as any).type && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                            <p className="text-foreground capitalize">{(result.data as any).type}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Data de Abertura</p>
                          <p className="text-foreground">
                            {new Date((result.data as any).createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        {(result.data as any).updatedAt && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Última Atualização</p>
                            <p className="text-foreground">
                              {new Date((result.data as any).updatedAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Para informações detalhadas, entre em contato com o setor responsável informando o NUP acima.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          CAIUS — Plataforma Pública Omnichannel de Atendimento e Gestão Administrativa
        </p>
      </footer>
    </div>
  );
}
