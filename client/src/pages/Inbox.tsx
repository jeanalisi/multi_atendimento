import OmniLayout from "@/components/OmniLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Inbox as InboxIcon,
  Loader2,
  MessageSquare,
  Search,
  Send,
  User,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  open: "Aberta",
  pending: "Pendente",
  resolved: "Resolvida",
  snoozed: "Adiada",
};

function ChannelBadge({ channel }: { channel: string }) {
  const map: Record<string, string> = { whatsapp: "WA", instagram: "IG", email: "EM" };
  const colorMap: Record<string, string> = {
    whatsapp: "bg-green-500/15 text-green-500",
    instagram: "bg-pink-500/15 text-pink-500",
    email: "bg-blue-500/15 text-blue-500",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide", colorMap[channel] ?? "bg-muted text-muted-foreground")}>
      {map[channel] ?? channel}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    open: "bg-blue-500/10 text-blue-400",
    pending: "bg-yellow-500/10 text-yellow-400",
    resolved: "bg-green-500/10 text-green-400",
    snoozed: "bg-purple-500/10 text-purple-400",
  };
  return (
    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", colorMap[status] ?? "bg-muted text-muted-foreground")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function timeAgo(date: Date | string | null) {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Inbox() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: conversations = [], isLoading: convsLoading } = trpc.conversations.list.useQuery(
    {
      channel: channelFilter !== "all" ? (channelFilter as any) : undefined,
      status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      limit: 100,
    },
    { refetchInterval: 10000 }
  );

  const { data: agents = [] } = trpc.users.agents.useQuery();

  const selectedConv = useMemo(
    () => (conversations as any[]).find((c: any) => c.conversation.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const { data: messages = [], isLoading: msgsLoading } = trpc.messages.list.useQuery(
    { conversationId: selectedId! },
    { enabled: !!selectedId, refetchInterval: 5000 }
  );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const sendMessage = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessageText("");
      utils.messages.list.invalidate({ conversationId: selectedId! });
      utils.conversations.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const markRead = trpc.messages.markRead.useMutation();

  const updateConv = trpc.conversations.update.useMutation({
    onSuccess: () => utils.conversations.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedId) {
      markRead.mutate({ conversationId: selectedId });
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (messages && (messages as any[]).length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const list = conversations as any[];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c: any) =>
        c.contact?.name?.toLowerCase().includes(q) ||
        c.contact?.email?.toLowerCase().includes(q) ||
        c.contact?.phone?.toLowerCase().includes(q) ||
        c.conversation.subject?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectConv = (id: number) => {
    setSelectedId(id);
    setMessageText("");
  };

  const handleSend = () => {
    if (!messageText.trim() || !selectedId || sendMessage.isPending) return;
    sendMessage.mutate({ conversationId: selectedId, content: messageText.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <OmniLayout title="Inbox Unificado" fullHeight>
      {/* Root: fills the main area completely */}
      <div className="flex h-full w-full overflow-hidden">

        {/* ── Left panel: conversation list ── */}
        <aside className="flex w-80 shrink-0 flex-col border-r border-border bg-card/20 overflow-hidden">
          {/* Filters */}
          <div className="shrink-0 space-y-2 border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-8 h-8 text-xs bg-secondary/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5">
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="h-7 text-xs flex-1 bg-secondary/50">
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos canais</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-7 text-xs flex-1 bg-secondary/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  <SelectItem value="open">Aberta</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="resolved">Resolvida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* List */}
          <ScrollArea className="flex-1">
            {convsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 px-4 text-center">
                <InboxIcon className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma conversa encontrada</p>
                {search && (
                  <button onClick={() => setSearch("")} className="text-xs text-primary hover:underline">
                    Limpar busca
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filtered.map(({ conversation: conv, contact }: any) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConv(conv.id)}
                    className={cn(
                      "w-full text-left px-3 py-3 transition-colors hover:bg-accent/50",
                      selectedId === conv.id && "bg-accent/80 border-l-2 border-l-primary"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {(contact?.name ?? "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {contact?.name ?? contact?.phone ?? contact?.email ?? "Desconhecido"}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            <ChannelBadge channel={conv.channel} />
                            <span className="text-[10px] text-muted-foreground">{timeAgo(conv.lastMessageAt)}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {conv.subject ?? `Conversa #${conv.id}`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <StatusBadge status={conv.status} />
                          {conv.unreadCount > 0 && (
                            <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Count footer */}
          <div className="shrink-0 border-t border-border px-3 py-2">
            <p className="text-[10px] text-muted-foreground">
              {filtered.length} conversa{filtered.length !== 1 ? "s" : ""}
              {search ? ` (filtrado de ${(conversations as any[]).length})` : ""}
            </p>
          </div>
        </aside>

        {/* ── Right panel: conversation view ── */}
        {selectedId && selectedConv ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Conversation header */}
            <div className="shrink-0 flex items-center justify-between border-b border-border px-4 py-3 bg-card/20">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {(selectedConv.contact?.name ?? "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {selectedConv.contact?.name ?? selectedConv.contact?.phone ?? selectedConv.contact?.email ?? "Desconhecido"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <ChannelBadge channel={selectedConv.conversation.channel} />
                    <span className="text-[10px] text-muted-foreground truncate">
                      {selectedConv.account?.name ?? ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {/* Assign agent */}
                <Select
                  value={selectedConv.conversation.assignedAgentId?.toString() ?? "unassigned"}
                  onValueChange={(v) =>
                    updateConv.mutate({
                      id: selectedId,
                      assignedAgentId: v === "unassigned" ? null : parseInt(v),
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs w-36 bg-secondary/50">
                    <User className="h-3 w-3 mr-1 shrink-0" />
                    <SelectValue placeholder="Atribuir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sem agente</SelectItem>
                    {(agents as any[]).map((a: any) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status */}
                <Select
                  value={selectedConv.conversation.status}
                  onValueChange={(v) => updateConv.mutate({ id: selectedId, status: v as any })}
                >
                  <SelectTrigger className="h-7 text-xs w-28 bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberta</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="resolved">Resolvida</SelectItem>
                    <SelectItem value="snoozed">Adiar</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 text-green-500 border-green-500/30 hover:bg-green-500/10"
                  onClick={() => updateConv.mutate({ id: selectedId, status: "resolved" })}
                  disabled={updateConv.isPending}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Resolver
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <ScrollArea className="flex-1 px-4 py-4">
              {msgsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (messages as any[]).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
                  <p className="text-xs text-muted-foreground/60">Envie a primeira mensagem abaixo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...(messages as any[])].reverse().map((msg: any) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2 max-w-[80%]",
                        msg.direction === "outbound" ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      {msg.direction === "inbound" && (
                        <Avatar className="h-6 w-6 shrink-0 mt-1">
                          <AvatarFallback className="bg-primary/10 text-primary text-[9px]">
                            {(selectedConv.contact?.name ?? "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div
                          className={cn(
                            "rounded-2xl px-3 py-2 text-sm break-words",
                            msg.direction === "outbound"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-secondary text-foreground rounded-tl-sm"
                          )}
                        >
                          {msg.content}
                        </div>
                        <p className={cn(
                          "text-[10px] text-muted-foreground mt-0.5",
                          msg.direction === "outbound" ? "text-right" : ""
                        )}>
                          {msg.senderName && msg.direction === "outbound" ? `${msg.senderName} · ` : ""}
                          {new Date(msg.sentAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message input */}
            <div className="shrink-0 border-t border-border p-3 bg-card/20">
              <div className="flex items-end gap-2">
                <Textarea
                  placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                  className="min-h-[60px] max-h-32 resize-none text-sm bg-secondary/50 border-border flex-1"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  size="sm"
                  className="h-10 w-10 p-0 shrink-0"
                  onClick={handleSend}
                  disabled={!messageText.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <InboxIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Selecione uma conversa</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(conversations as any[]).length > 0
                  ? "Escolha uma conversa na lista para visualizar as mensagens"
                  : "Nenhuma conversa disponível no momento"}
              </p>
            </div>
          </div>
        )}
      </div>
    </OmniLayout>
  );
}
