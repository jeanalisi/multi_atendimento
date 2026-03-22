import OmniLayout from "@/components/OmniLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Filter,
  Inbox as InboxIcon,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Tag,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  email: "E-mail",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Aberta",
  pending: "Pendente",
  resolved: "Resolvida",
  snoozed: "Adiada",
};

function ChannelBadge({ channel }: { channel: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide", `channel-${channel}`)}>
      {channel === "whatsapp" ? "WA" : channel === "instagram" ? "IG" : "EM"}
    </span>
  );
}

function timeAgo(date: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function Inbox() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: conversations, isLoading } = trpc.conversations.list.useQuery({
    channel: channelFilter !== "all" ? (channelFilter as any) : undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    limit: 100,
  });

  const { data: agents } = trpc.users.agents.useQuery();

  const selectedConv = useMemo(
    () => conversations?.find((c) => c.conversation.id === selectedId),
    [conversations, selectedId]
  );

  const { data: messages, isLoading: messagesLoading } = trpc.messages.list.useQuery(
    { conversationId: selectedId! },
    { enabled: !!selectedId, refetchInterval: 5000 }
  );

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
  });

  useEffect(() => {
    if (selectedId) markRead.mutate({ conversationId: selectedId });
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!search) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.contact?.name?.toLowerCase().includes(q) ||
        c.contact?.email?.toLowerCase().includes(q) ||
        c.contact?.phone?.toLowerCase().includes(q) ||
        c.conversation.subject?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const handleSend = () => {
    if (!messageText.trim() || !selectedId) return;
    sendMessage.mutate({ conversationId: selectedId, content: messageText.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <OmniLayout title="Inbox" fullHeight>
      <div className="flex h-full overflow-hidden">
        {/* Conversation list */}
        <div className="flex w-80 flex-col border-r border-border bg-card/30 shrink-0">
          {/* Filters */}
          <div className="p-3 space-y-2 border-b border-border">
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 px-4">
                <InboxIcon className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground text-center">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredConversations.map(({ conversation: conv, contact, account }) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      "w-full text-left px-3 py-3 hover:bg-accent/50 transition-colors",
                      selectedId === conv.id && "bg-accent/80"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {(contact?.name ?? "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {contact?.name ?? contact?.phone ?? contact?.email ?? "Desconhecido"}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            <ChannelBadge channel={conv.channel} />
                            <span className="text-[10px] text-muted-foreground">{timeAgo(conv.lastMessageAt)}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {conv.subject ?? `Conversa #${conv.id}`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                            conv.status === "open" && "bg-blue-500/10 text-blue-400",
                            conv.status === "pending" && "bg-yellow-500/10 text-yellow-400",
                            conv.status === "resolved" && "bg-green-500/10 text-green-400",
                            conv.status === "snoozed" && "bg-purple-500/10 text-purple-400",
                          )}>
                            {STATUS_LABELS[conv.status]}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                              {conv.unreadCount}
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
        </div>

        {/* Conversation view */}
        {selectedId && selectedConv ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {(selectedConv.contact?.name ?? "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedConv.contact?.name ?? selectedConv.contact?.phone ?? selectedConv.contact?.email ?? "Desconhecido"}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <ChannelBadge channel={selectedConv.conversation.channel} />
                    <span className="text-[10px] text-muted-foreground">
                      {selectedConv.account?.name ?? ""}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                    <User className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Atribuir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sem agente</SelectItem>
                    {agents?.map((a) => (
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
                  className="h-7 text-xs gap-1 text-green-400 border-green-500/20 hover:bg-green-500/10"
                  onClick={() => updateConv.mutate({ id: selectedId, status: "resolved" })}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Resolver
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...messages].reverse().map((msg) => (
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
                            "rounded-2xl px-3 py-2 text-sm",
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

            {/* Input */}
            <div className="border-t border-border p-3 bg-card/30">
              <div className="flex items-end gap-2">
                <Textarea
                  placeholder="Digite sua mensagem... (Enter para enviar)"
                  className="min-h-[60px] max-h-32 resize-none text-sm bg-secondary/50 border-border"
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
          <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-background/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <InboxIcon className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Selecione uma conversa</p>
            <p className="text-xs text-muted-foreground">Escolha uma conversa na lista para visualizar as mensagens</p>
          </div>
        )}
      </div>
    </OmniLayout>
  );
}
