import {
  Home,
  Video,
  PlusCircle,
  Cpu,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "recordings", label: "Recordings", icon: Video },
    { id: "create", label: "Create New", icon: PlusCircle },
    { id: "jobs", label: "Agent Jobs", icon: Cpu },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-3 py-6 flex-1">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#6366F1] text-white shadow-sm"
                    : "text-[#475569] hover:bg-[#F8FAFC]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="lg:block hidden">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User info and logout */}
      <div className="px-3 py-4 border-t border-[#E2E8F0]">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="lg:block hidden flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F172A] truncate">
                {user.name}
              </p>
              <p className="text-xs text-[#475569] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="lg:block hidden">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-[#E2E8F0]"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-[#E2E8F0] transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } lg:w-60 w-60`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
