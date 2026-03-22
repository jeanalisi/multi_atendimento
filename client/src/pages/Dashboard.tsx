import OmniLayout from "@/components/OmniLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Inbox,
  MessageSquare,
  TrendingUp,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "oklch(0.60 0.18 145)",
  instagram: "oklch(0.60 0.20 340)",
  email: "oklch(0.60 0.15 220)",
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  email: "E-mail",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#3b82f6",
  pending: "#eab308",
  resolved: "#22c55e",
  snoozed: "#a855f7",
};

export default function Dashboard() {
  const { data: stats } = trpc.conversations.stats.useQuery();
  const { data: analytics } = trpc.analytics.overview.useQuery();
  const { data: agents } = trpc.users.agents.useQuery();
  const { data: accounts } = trpc.accounts.list.useQuery();

  const connectedAccounts = accounts?.filter((a) => a.status === "connected").length ?? 0;
  const availableAgents = agents?.filter((a) => a.isAvailable).length ?? 0;

  const channelData = useMemo(() => {
    if (!analytics?.byChannel) return [];
    return analytics.byChannel.map((c) => ({
      name: CHANNEL_LABELS[c.channel] ?? c.channel,
      value: Number(c.count),
      color: CHANNEL_COLORS[c.channel] ?? "#6366f1",
    }));
  }, [analytics]);

  const statusData = useMemo(() => {
    if (!analytics?.byStatus) return [];
    return analytics.byStatus.map((s) => ({
      name: s.status,
      value: Number(s.count),
      color: STATUS_COLORS[s.status] ?? "#6366f1",
    }));
  }, [analytics]);

  const agentData = useMemo(() => {
    if (!analytics?.byAgent) return [];
    return analytics.byAgent
      .filter((a) => a.agentName)
      .map((a) => ({
        name: (a.agentName ?? "").split(" ")[0],
        conversas: Number(a.count),
      }));
  }, [analytics]);

  const metricCards = [
    {
      title: "Conversas Abertas",
      value: stats?.open ?? 0,
      icon: Inbox,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Pendentes",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      title: "Resolvidas",
      value: stats?.resolved ?? 0,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      title: "Total de Mensagens",
      value: analytics?.totalMessages ?? 0,
      icon: MessageSquare,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Contas Conectadas",
      value: connectedAccounts,
      icon: Wifi,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Agentes Disponíveis",
      value: availableAgents,
      icon: Users,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
  ];

  return (
    <OmniLayout title="Dashboard">
      <div className="p-6 space-y-6">
        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {metricCards.map((card) => (
            <Card key={card.title} className={cn("border", card.border, "bg-card/50")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-foreground">{card.value.toLocaleString()}</p>
                  </div>
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", card.bg)}>
                    <card.icon className={cn("h-4.5 w-4.5", card.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* By Channel */}
          <Card className="border-border bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Por Canal</CardTitle>
            </CardHeader>
            <CardContent>
              {channelData.length === 0 ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-sm text-muted-foreground">Sem dados</p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="60%" height={140}>
                    <PieChart>
                      <Pie data={channelData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                        {channelData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2">
                    {channelData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-xs text-muted-foreground">{d.name}</span>
                        <span className="text-xs font-semibold text-foreground ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Status */}
          <Card className="border-border bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Por Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length === 0 ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-sm text-muted-foreground">Sem dados</p>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  {statusData.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-xs text-muted-foreground capitalize flex-1">{s.name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            background: s.color,
                            width: `${Math.round((s.value / (stats?.total || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground w-8 text-right">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Agent */}
          <Card className="border-border bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Por Agente</CardTitle>
            </CardHeader>
            <CardContent>
              {agentData.length === 0 ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-sm text-muted-foreground">Sem dados</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={agentData} barSize={16}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Bar dataKey="conversas" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Accounts status */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status das Contas</CardTitle>
          </CardHeader>
          <CardContent>
            {!accounts || accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Wifi className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma conta conectada</p>
                <a href="/accounts" className="text-xs text-primary hover:underline">
                  Conectar uma conta →
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 bg-secondary/30"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                        account.channel === "whatsapp" && "channel-whatsapp",
                        account.channel === "instagram" && "channel-instagram",
                        account.channel === "email" && "channel-email"
                      )}
                    >
                      {account.channel === "whatsapp" ? "WA" : account.channel === "instagram" ? "IG" : "EM"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{account.identifier}</p>
                    </div>
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        account.status === "connected" && "bg-green-400",
                        account.status === "connecting" && "bg-yellow-400 animate-pulse",
                        account.status === "disconnected" && "bg-muted-foreground/30",
                        account.status === "error" && "bg-red-400"
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OmniLayout>
  );
}
