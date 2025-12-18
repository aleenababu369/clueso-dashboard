import { Bell, ChevronDown, Video, User, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  onNavigate?: (page: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setShowDropdown(false);
  };

  return (
    <nav className="h-16 bg-white border-b border-[#E2E8F0] fixed top-0 left-0 right-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center shadow-sm">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#0F172A]">Clueso</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors text-[#64748B] hover:text-[#0F172A]">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 pl-2 pr-1 py-1.5 rounded-lg hover:bg-[#F8FAFC] transition-all border border-transparent hover:border-[#E2E8F0]"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[#0F172A] leading-none mb-0.5 max-w-[100px] truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-[#64748B] leading-none max-w-[100px] truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-1.5 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-[#F1F5F9] mb-1">
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {user?.name}
                    </p>
                    <p className="text-xs text-[#64748B] truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => handleNavigation("settings")}
                    className="w-full px-4 py-2 text-left text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => handleNavigation("settings")}
                    className="w-full px-4 py-2 text-left text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <div className="my-1 border-t border-[#F1F5F9]" />

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-[#EF4444] hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
