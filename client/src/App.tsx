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
      {/* Public route — no auth required */}
      <Route path={"/consulta"} component={PublicConsulta} />

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
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
