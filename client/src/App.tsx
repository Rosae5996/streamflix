import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Public pages
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import ContentDetail from "./pages/ContentDetail";
import Watch from "./pages/Watch";
import Subscription from "./pages/Subscription";
import Profile from "./pages/Profile";
import Watchlist from "./pages/Watchlist";
import WatchHistory from "./pages/WatchHistory";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminContent from "./pages/admin/AdminContent";
import AdminContentForm from "./pages/admin/AdminContentForm";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAds from "./pages/admin/AdminAds";

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/auth/callback" component={AuthCallback} />

      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/browse" component={Browse} />
      <Route path="/content/:slug" component={ContentDetail} />
      <Route path="/watch/:id" component={Watch} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/profile" component={Profile} />
      <Route path="/watchlist" component={Watchlist} />
      <Route path="/history" component={WatchHistory} />

      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/plans" component={AdminPlans} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/content" component={AdminContent} />
      <Route path="/admin/content/new" component={AdminContentForm} />
      <Route path="/admin/content/:id/edit" component={AdminContentForm} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/ads" component={AdminAds} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
