import { useLocation } from "wouter";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageDetails: Record<string, { title: string; subtitle: string }> = {
  "/admin/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of your Guhdeh platform"
  },
  "/admin/runners": {
    title: "Runners",
    subtitle: "Manage and verify runner accounts"
  },
  "/admin/jobs": {
    title: "Jobs",
    subtitle: "Monitor and manage all errands"
  },
  "/admin/services": {
    title: "Services",
    subtitle: "Configure pricing and service types"
  },
  "/admin/subscriptions": {
    title: "Subscriptions",
    subtitle: "Manage user plans and billing"
  },
};

export default function Header() {
  const [location] = useLocation();
  const currentPage = pageDetails[location] || pageDetails["/admin/dashboard"];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{currentPage.title}</h2>
          <p className="text-slate-600">{currentPage.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <Button className="admin-secondary hover:bg-amber-600">
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>
    </header>
  );
}
