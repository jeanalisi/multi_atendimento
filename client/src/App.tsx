import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useParams, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Accounts from "./pages/Accounts";
import AdminProcesses from "./pages/AdminProcesses";
import Agents from "./pages/Agents";
import AiSettings from "./pages/AiSettings";
import Audit from "./pages/Audit";
import Conversations from "./pages/Conversations";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Inbox from "./pages/Inbox";
import Ombudsman from "./pages/Ombudsman";
import Protocols from "./pages/Protocols";
import ProtocolDetail from "./pages/ProtocolDetail";
import PublicConsulta from "./pages/PublicConsulta";
import Queue from "./pages/Queue";
import Reports from "./pages/Reports";
import Sectors from "./pages/Sectors";
import Tags from "./pages/Tags";
import Templates from "./pages/Templates";
import Tickets from "./pages/Tickets";
import ServiceTypes from "./pages/ServiceTypes";
import FormBuilder from "./pages/FormBuilder";
import InstitutionalSettings from "./pages/InstitutionalSettings";
import OnlineSessions from "./pages/OnlineSessions";
import ContextHelpAdmin from "./pages/ContextHelpAdmin";
import AttachmentsManager from "./pages/AttachmentsManager";
import OrgStructure from "./pages/OrgStructure";
import Positions from "./pages/Positions";
import OrgInvites from "./pages/OrgInvites";
import AcceptInvite from "./pages/AcceptInvite";
import CentralCidadao from "./pages/CentralCidadao";
import EstruturaAdministrativa from "./pages/EstruturaAdministrativa";
import ServicoDetalhe from "./pages/ServicoDetalhe";

function ProtocolDetailWrapper() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = Number(params.id);
  if (!id) return null;
  return <ProtocolDetail id={id} onBack={() => navigate("/protocols")} />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes — no auth required */}
      <Route path={"/consulta"} component={PublicConsulta} />
      <Route path={"/consultar-protocolo"} component={PublicConsulta} />
      <Route path={"/consulta-publica"} component={PublicConsulta} />
      <Route path={"/convite/:token"} component={AcceptInvite} />
      <Route path={"/central-cidadao"} component={CentralCidadao} />
      <Route path={"/estrutura-administrativa"} component={EstruturaAdministrativa} />
      <Route path={"/estrutura"} component={EstruturaAdministrativa} />
      <Route path={"/servico/:id"} component={ServicoDetalhe} />

      {/* Dashboard */}
      <Route path={"/"} component={Dashboard} />
      <Route path={"/dashboard"} component={Dashboard} />

      {/* Omnichannel */}
      <Route path={"/inbox"} component={Inbox} />
      <Route path={"/conversations"} component={Conversations} />
      <Route path={"/tickets"} component={Tickets} />
      <Route path={"/queue"} component={Queue} />
      <Route path={"/accounts"} component={Accounts} />
      <Route path={"/tags"} component={Tags} />

      {/* CAIUS — Gestão Administrativa */}
      <Route path={"/protocols"} component={Protocols} />
      <Route path={"/protocols/:id"} component={ProtocolDetailWrapper} />
      <Route path={"/documents"} component={Documents} />
      <Route path={"/processes"} component={AdminProcesses} />
      <Route path={"/ombudsman"} component={Ombudsman} />
      <Route path={"/templates"} component={Templates} />
      <Route path={"/sectors"} component={Sectors} />

      {/* Módulos Avançados */}
      <Route path={"/service-types"} component={ServiceTypes} />
      <Route path={"/form-builder"} component={FormBuilder} />
      <Route path={"/form-builder/:id"} component={FormBuilder} />
      <Route path={"/attachments"} component={AttachmentsManager} />
      <Route path={"/institutional"} component={InstitutionalSettings} />
      <Route path={"/online-sessions"} component={OnlineSessions} />
      <Route path={"/context-help"} component={ContextHelpAdmin} />
      {/* Estrutura Organizacional */}
      <Route path={"/org-structure"} component={OrgStructure} />
      <Route path={"/positions"} component={Positions} />
      <Route path={"/org-invites"} component={OrgInvites} />
      {/* Administração */}
      <Route path={"/reports"} component={Reports} />
      <Route path={"/agents"} component={Agents} />
      <Route path={"/audit"} component={Audit} />
      <Route path={"/ai-settings"} component={AiSettings} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
