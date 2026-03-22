import OmniLayout from "@/components/OmniLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Loader2, Shield, Users } from "lucide-react";
import { toast } from "sonner";

export default function Agents() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();

  const update = trpc.users.update.useMutation({
    onSuccess: () => { utils.users.list.invalidate(); toast.success("Usuário atualizado"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <OmniLayout title="Gerenciar Agentes">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Users className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Usuários e Agentes</p>
            <p className="text-xs text-muted-foreground">Gerencie permissões e disponibilidade da equipe</p>
          </div>
        </div>

        <Card className="border-border bg-card/50">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !users || users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Users className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-4">Usuário</div>
                  <div className="col-span-2">Função</div>
                  <div className="col-span-2">É Agente</div>
                  <div className="col-span-2">Disponível</div>
                  <div className="col-span-2">Último acesso</div>
                </div>
                {users.map((user) => (
                  <div key={user.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-accent/30 transition-colors">
                    <div className="col-span-4 flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {(user.name ?? "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{user.email ?? "—"}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={user.role}
                        onValueChange={(v) => update.mutate({ id: user.id, role: v as any })}
                      >
                        <SelectTrigger className={cn(
                          "h-7 text-[10px] border rounded-full px-2 w-24",
                          user.role === "admin"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-secondary text-muted-foreground border-border"
                        )}>
                          <Shield className="h-2.5 w-2.5 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Switch
                        checked={user.isAgent}
                        onCheckedChange={(v) => update.mutate({ id: user.id, isAgent: v })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Switch
                        checked={user.isAvailable}
                        disabled={!user.isAgent}
                        onCheckedChange={(v) => update.mutate({ id: user.id, isAvailable: v })}
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.lastSignedIn).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
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
