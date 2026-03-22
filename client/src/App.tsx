import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Accounts from "./pages/Accounts";
import Agents from "./pages/Agents";
import Conversations from "./pages/Conversations";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import Queue from "./pages/Queue";
import Reports from "./pages/Reports";
import Tags from "./pages/Tags";
import Tickets from "./pages/Tickets";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/inbox"} component={Inbox} />
      <Route path={"/conversations"} component={Conversations} />
      <Route path={"/tickets"} component={Tickets} />
      <Route path={"/queue"} component={Queue} />
      <Route path={"/accounts"} component={Accounts} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/tags"} component={Tags} />
      <Route path={"/agents"} component={Agents} />
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
