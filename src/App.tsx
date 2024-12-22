import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import PricingPage from "./pages/Pricing";
import ReferenceChunks from "./pages/dashboard/ReferenceChunks";
import NovelBuffer from "./pages/dashboard/NovelBuffer";
import NovelSetup from "./pages/dashboard/NovelSetup";
import NovelGeneration from "./pages/dashboard/NovelGeneration";

function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Route changed, scrolling to top');
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Routes>
            <Route element={<Layout><Outlet /></Layout>}>
              <Route index element={<Index />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/pricing" element={<PricingPage />} />
            </Route>
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/admin/reference-chunks" element={<ReferenceChunks />} />
            <Route path="/dashboard/create/novel/setup" element={<NovelSetup />} />
            <Route path="/dashboard/create/novel/generation" element={<NovelGeneration />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
