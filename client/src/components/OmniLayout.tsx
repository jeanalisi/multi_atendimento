import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  ChevronDown,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Tag,
  Ticket,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inbox", icon: Inbox, label: "Inbox" },
  { href: "/conversations", icon: MessageSquare, label: "Conversas" },
  { href: "/tickets", icon: Ticket, label: "Tickets" },
  { href: "/queue", icon: Users, label: "Fila" },
  { href: "/accounts", icon: Wifi, label: "Contas" },
  { href: "/reports", icon: BarChart3, label: "Relatórios" },
  { href: "/tags", icon: Tag, label: "Tags" },
];

const adminItems = [
  { href: "/agents", icon: Users, label: "Agentes" },
  { href: "/settings", icon: Settings, label: "Configurações" },
];

interface OmniLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function OmniLayout({ children, title }: OmniLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

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
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <MessageSquare className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">OmniChannel</h1>
          <p className="text-sm text-muted-foreground">Plataforma de Atendimento Unificado</p>
        </div>
        <a href={getLoginUrl()}>
          <Button size="lg" className="gap-2">
            Entrar na plataforma
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="flex h-full w-16 flex-col items-center border-r border-sidebar-border bg-sidebar py-4 gap-1">
        {/* Logo */}
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>

        <Separator className="mb-2 w-8 bg-sidebar-border" />

        {/* Nav items */}
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-1 px-2">
            {navItems.map((item) => {
              const isActive = location.startsWith(item.href);
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <button
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150",
                          isActive
                            ? "bg-primary/15 text-primary border border-primary/20"
                            : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="h-4.5 w-4.5" />
                      </button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {user?.role === "admin" && (
              <>
                <Separator className="my-1 w-8 bg-sidebar-border" />
                {adminItems.map((item) => {
                  const isActive = location.startsWith(item.href);
                  return (
                    <Tooltip key={item.href} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link href={item.href}>
                          <button
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150",
                              isActive
                                ? "bg-primary/15 text-primary border border-primary/20"
                                : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            )}
                          >
                            <item.icon className="h-4.5 w-4.5" />
                          </button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>

        <Separator className="mt-2 mb-2 w-8 bg-sidebar-border" />

        {/* Notifications */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                if (unreadCount > 0) markRead.mutate();
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Notificações
          </TooltipContent>
        </Tooltip>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-sidebar-accent transition-all">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                {user?.role}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        {title && (
          <header className="flex h-14 items-center border-b border-border px-6 gap-3 bg-background/80 backdrop-blur-sm">
            <h1 className="text-base font-semibold text-foreground">{title}</h1>
          </header>
        )}
        <div className="flex-1 overflow-auto scrollbar-thin">
          {children}
        </div>
      </main>

      {/* Notification panel */}
      {notifOpen && (
        <div className="absolute right-0 top-0 z-50 h-full w-80 border-l border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Notificações</h2>
            <button
              onClick={() => setNotifOpen(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Fechar
            </button>
          </div>
          <ScrollArea className="h-full pb-16">
            {notifications?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Bell className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications?.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "px-4 py-3 transition-colors",
                      !n.isRead && "bg-primary/5"
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
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
