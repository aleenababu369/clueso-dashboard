import { User, Mail, Shield, Key } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
          Account Settings
        </h1>
        <p className="text-[#475569]">
          Manage your profile and account preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">{user?.name}</h2>
              <p className="text-[#475569]">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-[#6366F1]" />
                  <span className="text-sm font-medium text-[#64748B]">
                    Full Name
                  </span>
                </div>
                <p className="text-[#0F172A] font-medium">{user?.name}</p>
              </div>

              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-[#6366F1]" />
                  <span className="text-sm font-medium text-[#64748B]">
                    Email Address
                  </span>
                </div>
                <p className="text-[#0F172A] font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#6366F1]" />
            Security
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Key className="w-5 h-5 text-[#6366F1]" />
                </div>
                <div>
                  <p className="font-medium text-[#0F172A]">Password</p>
                  <p className="text-sm text-[#475569]">
                    Last changed recently
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
