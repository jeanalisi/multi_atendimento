import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  FormInput,
  GitBranch,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Monitor,
  Moon,
  Paperclip,
  PenLine,
  Scale,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Tag,
  Ticket,
  Users,
  Wifi,
} from "lucide-react";
import { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import GlobalSearchResults from "./GlobalSearchResults";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

// ─── Navigation groups ────────────────────────────────────────────────────────
const atendimentoItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inbox", icon: Inbox, label: "Inbox Unificado" },
  { href: "/conversations", icon: MessageSquare, label: "Conversas" },
  { href: "/tickets", icon: Ticket, label: "Tickets" },
  { href: "/queue", icon: Users, label: "Fila de Atendimento" },
];

const caiusItems = [
  { href: "/protocols", icon: ClipboardList, label: "Protocolos (NUP)" },
  { href: "/processes", icon: Scale, label: "Processos Adm." },
  { href: "/documents", icon: FileText, label: "Documentos Oficiais" },
  { href: "/ombudsman", icon: BookOpen, label: "Ouvidoria" },
  { href: "/templates", icon: PenLine, label: "Modelos de Documentos" },
];

const adminItems = [
  { href: "/accounts", icon: Wifi, label: "Contas Conectadas" },
  { href: "/agents", icon: Users, label: "Agentes e Usuários" },
  { href: "/sectors", icon: Building2, label: "Setores" },
  { href: "/reports", icon: BarChart3, label: "Relatórios" },
  { href: "/audit", icon: ShieldCheck, label: "Auditoria" },
  { href: "/ai-settings", icon: Sparkles, label: "Integrações de IA" },
  { href: "/tags", icon: Tag, label: "Tags" },
];

const advancedItems = [
  { href: "/service-types", icon: Settings2, label: "Tipos de Atendimento" },
  { href: "/form-builder", icon: FormInput, label: "Construtor de Formulários" },
  { href: "/attachments", icon: Paperclip, label: "Gestão de Anexos" },
  { href: "/institutional", icon: Building2, label: "Config. Institucional" },
  { href: "/online-sessions", icon: Monitor, label: "Sessões Online" },
  { href: "/context-help", icon: HelpCircle, label: "Ajuda Contextual" },
];

const orgItems = [
  { href: "/org-structure", icon: GitBranch, label: "Estrutura Organizacional" },
  { href: "/positions", icon: Briefcase, label: "Cargos e Funções" },
  { href: "/org-invites", icon: Mail, label: "Convites e Lotações" },
];

interface OmniLayoutProps {
  children: React.ReactNode;
  title?: string;
  fullHeight?: boolean;
}

function NavItem({ href, icon: Icon, label, isActive }: { href: string; icon: any; label: string; isActive: boolean }) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 cursor-pointer",
          isActive
            ? "bg-primary/15 text-primary font-medium border border-primary/20"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-sidebar-foreground/50")} />
        <span className="truncate">{label}</span>
      </div>
    </Link>
  );
}

function NavGroup({ label, children, defaultOpen = true }: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
      >
        {label}
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

export default function OmniLayout({ children, title, fullHeight }: OmniLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { resolvedTheme, toggleTheme } = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: notifications } = trpc.notifications.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const markRead = trpc.notifications.markRead.useMutation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando CAIUS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative flex h-screen overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
        </div>
        {/* Left panel — branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">CAIUS</span>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
                Atendimento e Gestão<br />
                <span className="text-primary">em um só lugar</span>
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
                Plataforma omnichannel para centralizar WhatsApp, Instagram, e-mail e gestão administrativa com protocolo digital (NUP), tramitação interna e ouvidoria.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: MessageSquare, label: "Inbox Unificado", desc: "WhatsApp, Instagram, E-mail" },
                { icon: ClipboardList, label: "Protocolo Digital", desc: "NUP automático" },
                { icon: GitBranch, label: "Estrutura Org.", desc: "Lei 010/2025" },
                { icon: ShieldCheck, label: "Auditoria", desc: "Trilha completa" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-card/50 p-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50">
            Município de Itabaiana &mdash; Powered by CAIUS
          </p>
        </div>
        {/* Right panel — login */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Scale className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">CAIUS</h1>
              <p className="text-xs text-muted-foreground">Plataforma Pública Omnichannel</p>
            </div>
          </div>
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Bem-vindo</h2>
              <p className="text-sm text-muted-foreground">Acesse com sua conta Manus para continuar.</p>
            </div>
            <a href={getLoginUrl()} className="block">
              <button className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-primary/30 bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/30 hover:shadow-xl active:scale-[0.98]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Entrar com Manus
                <span className="absolute right-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </button>
            </a>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground/60">ou acesso público</span>
              </div>
            </div>
            <Link href="/central-cidadao">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/50 px-6 py-3 text-sm font-medium text-foreground/80 transition-all hover:bg-card hover:text-foreground hover:border-border">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Central de Serviços ao Cidadão
              </button>
            </Link>
            <Link href="/consulta">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/50 px-5 py-2.5 text-sm font-medium text-foreground/70 transition-all hover:bg-card hover:text-foreground hover:border-border">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                Consultar protocolo por NUP
              </button>
            </Link>
            <p className="text-center text-[11px] text-muted-foreground/50 leading-relaxed">
              Ao acessar, você concorda com os termos de uso da plataforma.<br />
              Acesso restrito a servidores e colaboradores autorizados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar lateral expandido ── */}
      <aside className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        {/* Logo + nome */}
        <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
          <Link href="/dashboard">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/30 cursor-pointer hover:opacity-90 transition-opacity">
              <Scale className="h-4 w-4 text-primary-foreground" />
            </div>
          </Link>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">CAIUS</span>
            <span className="text-[10px] text-sidebar-foreground/40">Plataforma Omnichannel</span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-3">
          <div className="space-y-4">
            <NavGroup label="Atendimento">
              {atendimentoItems.map((item) => (
                <NavItem key={item.href} {...item} isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))} />
              ))}
            </NavGroup>

            <NavGroup label="Gestão Pública">
              {caiusItems.map((item) => (
                <NavItem key={item.href} {...item} isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))} />
              ))}
            </NavGroup>

            {user?.role === "admin" && (
              <>
                <NavGroup label="Administração">
                  {adminItems.map((item) => (
                    <NavItem key={item.href} {...item} isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))} />
                  ))}
                </NavGroup>

                <NavGroup label="Configurações" defaultOpen={false}>
                  {advancedItems.map((item) => (
                    <NavItem key={item.href} {...item} isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))} />
                  ))}
                </NavGroup>

                <NavGroup label="Estrutura Org." defaultOpen={false}>
                  {orgItems.map((item) => (
                    <NavItem key={item.href} {...item} isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))} />
                  ))}
                </NavGroup>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer do sidebar */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Link href="/consulta">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all cursor-pointer">
              <ClipboardList className="h-4 w-4 shrink-0" />
              <span className="truncate">Consulta Pública NUP</span>
            </div>
          </Link>
          <Link href="/central-cidadao">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all cursor-pointer">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">Central do Cidadão</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Área principal ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Barra superior ── */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4 gap-3">
          {/* Título da página */}
          <h1 className="text-sm font-semibold text-foreground truncate">
            {title ?? "CAIUS — Plataforma Omnichannel"}
          </h1>

          {/* Ações do header */}
          <div className="flex items-center gap-1">
            {/* Busca global */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  <Search className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Pesquisa Global</TooltipContent>
            </Tooltip>

            {/* Toggle tema */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  {resolvedTheme === "dark"
                    ? <Sun className="h-4 w-4" />
                    : <Moon className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {resolvedTheme === "dark" ? "Modo Claro" : "Modo Escuro"}
              </TooltipContent>
            </Tooltip>

            {/* Notificações */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    if (unreadCount > 0) markRead.mutate();
                  }}
                  className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>Notificações</TooltipContent>
            </Tooltip>

            {/* Avatar / menu usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent transition-all ml-1">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-xs font-medium text-foreground max-w-[100px] truncate">{user?.name}</span>
                    <Badge variant="outline" className="text-[9px] capitalize h-3.5 px-1">{user?.role}</Badge>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <Badge variant="outline" className="text-[10px] capitalize">{user?.role}</Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive gap-2">
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className={fullHeight ? "flex-1 overflow-hidden" : "flex-1 overflow-auto scrollbar-thin"}>
          {children}
        </main>
      </div>

      {/* ── Painel de pesquisa global ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 backdrop-blur-sm" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
          <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={searchRef}
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Pesquisar protocolos, conversas, contatos..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-muted-foreground hover:text-foreground text-xs px-2 py-1 rounded hover:bg-accent">
                Esc
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-auto">
              {!searchQuery && (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Search className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Digite para pesquisar</p>
                  <p className="text-xs text-muted-foreground/60">Protocolos, conversas, contatos, documentos</p>
                </div>
              )}
              {searchQuery && searchQuery.length >= 2 && (
                <GlobalSearchResults query={searchQuery} onClose={() => { setSearchOpen(false); setSearchQuery(""); }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Painel de notificações ── */}
      {notifOpen && (
        <div className="fixed right-0 top-0 z-50 h-full w-80 border-l border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 h-14">
            <h2 className="text-sm font-semibold">Notificações</h2>
            <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground text-xs px-2 py-1 rounded hover:bg-accent">
              Fechar
            </button>
          </div>
          <ScrollArea className="h-[calc(100%-3.5rem)]">
            {!notifications?.length ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Bell className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications?.map((n) => (
                  <div key={n.id} className={cn("px-4 py-3 transition-colors", !n.isRead && "bg-primary/5")}>
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                    {(n as any).nup && (
                      <p className="text-[10px] text-primary/70 mt-0.5 font-mono">NUP: {(n as any).nup}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      {new Date(n.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
