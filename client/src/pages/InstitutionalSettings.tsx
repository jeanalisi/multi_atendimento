import { useState, useEffect } from "react";
import OmniLayout from "@/components/OmniLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { Building2, Palette, Sun, Moon, Monitor, Save, Image } from "lucide-react";

const CONFIG_FIELDS = [
  { key: "org_name", label: "Nome da Organização", type: "text", placeholder: "Ex: Prefeitura Municipal de..." },
  { key: "org_short_name", label: "Nome Abreviado", type: "text", placeholder: "Ex: PMSF" },
  { key: "org_logo_url", label: "URL da Logomarca", type: "url", placeholder: "https://..." },
  { key: "org_favicon_url", label: "URL do Favicon", type: "url", placeholder: "https://..." },
  { key: "org_primary_color", label: "Cor Primária", type: "color", placeholder: "#6366f1" },
  { key: "org_secondary_color", label: "Cor Secundária", type: "color", placeholder: "#8b5cf6" },
  { key: "org_address", label: "Endereço", type: "text", placeholder: "Rua..." },
  { key: "org_phone", label: "Telefone", type: "text", placeholder: "(00) 0000-0000" },
  { key: "org_email", label: "E-mail Institucional", type: "email", placeholder: "contato@..." },
  { key: "org_website", label: "Website", type: "url", placeholder: "https://..." },
  { key: "org_cnpj", label: "CNPJ", type: "text", placeholder: "00.000.000/0000-00" },
  { key: "platform_name", label: "Nome da Plataforma", type: "text", placeholder: "CAIUS" },
  { key: "platform_welcome_message", label: "Mensagem de Boas-Vindas", type: "text", placeholder: "Bem-vindo ao atendimento..." },
  { key: "platform_footer_text", label: "Texto do Rodapé", type: "text", placeholder: "© 2025 ..." },
  { key: "platform_help_email", label: "E-mail de Suporte", type: "email", placeholder: "suporte@..." },
];

export default function InstitutionalSettings() {
  const { theme, setTheme } = useTheme();
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  const { data: configs = [] } = trpc.institutionalConfig.get.useQuery();
  const saveMutation = trpc.institutionalConfig.save.useMutation({
    onSuccess: () => { toast.success("Configurações salvas!"); setDirty(false); },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (configs.length > 0) {
      const map: Record<string, string> = {};
      configs.forEach((c: any) => { map[c.key] = c.value ?? ""; });
      setValues(map);
    }
  }, [configs]);

  function handleChange(key: string, value: string) {
    setValues(v => ({ ...v, [key]: value }));
    setDirty(true);
  }

  function handleSave() {
    const payload = Object.entries(values).map(([key, value]) => {
      const field = CONFIG_FIELDS.find(f => f.key === key);
      return { key, value, label: field?.label, type: field?.type === "color" ? "color" : field?.type === "url" ? "url" : "text" };
    });
    saveMutation.mutate(payload);
  }

  return (
    <OmniLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Configurações Institucionais</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Personalize a identidade visual, dados da organização e aparência da plataforma.
            </p>
          </div>
          {dirty && (
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          )}
        </div>

        <Tabs defaultValue="organization">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="organization" className="gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Organização
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Aparência
            </TabsTrigger>
            <TabsTrigger value="platform" className="gap-1.5">
              <Image className="w-3.5 h-3.5" /> Plataforma
            </TabsTrigger>
          </TabsList>

          {/* Organization Tab */}
          <TabsContent value="organization" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dados da Organização</CardTitle>
                <CardDescription>Informações institucionais exibidas na plataforma e documentos.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONFIG_FIELDS.filter(f => f.key.startsWith("org_") && !["org_primary_color", "org_secondary_color", "org_logo_url", "org_favicon_url"].includes(f.key)).map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <Label>{field.label}</Label>
                    <Input
                      type={field.type === "email" ? "email" : "text"}
                      value={values[field.key] ?? ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="mt-6 space-y-6">
            {/* Theme Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Modo de Exibição</CardTitle>
                <CardDescription>Escolha entre tema claro, escuro ou automático (segue o sistema operacional).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Claro", icon: Sun },
                    { value: "dark", label: "Escuro", icon: Moon },
                    { value: "system", label: "Sistema", icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value as any)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${theme === value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${theme === value ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cores Institucionais</CardTitle>
                <CardDescription>Cores usadas em documentos, cabeçalhos e elementos de marca.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {CONFIG_FIELDS.filter(f => ["org_primary_color", "org_secondary_color"].includes(f.key)).map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <Label>{field.label}</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={values[field.key] ?? "#6366f1"}
                        onChange={e => handleChange(field.key, e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-border"
                      />
                      <Input
                        value={values[field.key] ?? ""}
                        onChange={e => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="font-mono"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Logomarca e Favicon</CardTitle>
                <CardDescription>URLs das imagens exibidas no cabeçalho e aba do navegador.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {CONFIG_FIELDS.filter(f => ["org_logo_url", "org_favicon_url"].includes(f.key)).map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <Label>{field.label}</Label>
                    <div className="flex gap-3 items-center">
                      {values[field.key] && (
                        <img src={values[field.key]} alt="preview" className="w-10 h-10 object-contain rounded border border-border bg-muted" onError={e => (e.currentTarget.style.display = "none")} />
                      )}
                      <Input
                        type="url"
                        value={values[field.key] ?? ""}
                        onChange={e => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platform Tab */}
          <TabsContent value="platform" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações da Plataforma</CardTitle>
                <CardDescription>Textos, mensagens e informações exibidas na interface.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {CONFIG_FIELDS.filter(f => f.key.startsWith("platform_")).map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <Label>{field.label}</Label>
                    <Input
                      type={field.type === "email" ? "email" : "text"}
                      value={values[field.key] ?? ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {dirty && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Salvando..." : "Salvar Todas as Alterações"}
            </Button>
          </div>
        )}
      </div>
    </OmniLayout>
  );
}
