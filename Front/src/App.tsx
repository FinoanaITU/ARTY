
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { UserProvider } from "./contexts/UserContext";
import { CartProvider } from "./contexts/CartContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Workshops from "./pages/Workshops";
import ArtisanProfile from "./pages/ArtisanProfile";
import WorkshopDetail from "./pages/WorkshopDetail";
import Dashboard from "./pages/Dashboard";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import AdminPanel from "./pages/AdminPanel";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import BecomeProfessional from "./pages/BecomeProfessional";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <UserProvider>
          <SubscriptionProvider>
            <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/workshops" element={<Workshops />} />
                <Route path="/artisan/:id" element={<ArtisanProfile />} />
                <Route path="/workshop/:id" element={<WorkshopDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/artisan-dashboard" element={<ArtisanDashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/become-professional" element={<BecomeProfessional />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </CartProvider>
          </SubscriptionProvider>
        </UserProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
