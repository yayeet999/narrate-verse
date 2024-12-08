import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Library from "./dashboard/Library";
import Reader from "./dashboard/Reader";
import Settings from "./dashboard/Settings";
import Footer from "@/components/navigation/Footer";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <div className="flex-1 flex">
          <DashboardSidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <main className="flex-1 p-4 bg-slate-50 dark:bg-slate-900">
            <Routes>
              <Route index element={<Library />} />
              <Route path="read/:id" element={<Reader />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;