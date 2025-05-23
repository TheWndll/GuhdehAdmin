import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Settings, 
  CreditCard, 
  ShieldCheck,
  User,
  LogOut
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Runners", href: "/admin/runners", icon: Users },
  { name: "Jobs", href: "/admin/jobs", icon: Package },
  { name: "Services", href: "/admin/services", icon: Settings },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 admin-primary flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 admin-secondary rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-admin-primary" />
          </div>
          <h1 className="text-xl font-bold text-white">Guhdeh Admin</h1>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors",
                  isActive
                    ? "admin-secondary font-medium"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700">
          <div className="w-8 h-8 admin-secondary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-admin-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.fullName || "Admin User"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email || "admin@guhdeh.com"}
            </p>
          </div>
          <button 
            onClick={logout}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
