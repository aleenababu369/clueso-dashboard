import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Video,
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    resetToken: string;
    resetLink: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await forgotPassword(email);
      setSuccess(true);
      if (result.debug) {
        setDebugInfo(result.debug);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#6366F1] flex items-center justify-center text-white">
            <Video size={24} />
          </div>
          <span className="text-2xl font-bold text-[#0F172A]">Clueso AI</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-8">
          {/* Back link */}
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-[#475569] hover:text-[#0F172A] transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span>Back to login</span>
          </Link>

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
                Check your email
              </h2>
              <p className="text-[#475569] text-sm mb-6">
                If an account exists for {email}, you'll receive a password
                reset link.
              </p>

              {/* Debug info for development */}
              {debugInfo && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6">
                  <p className="text-amber-700 text-xs font-medium mb-2">
                    Development Only:
                  </p>
                  <a
                    href={debugInfo.resetLink}
                    className="text-[#6366F1] hover:text-[#4F46E5] text-sm break-all underline"
                  >
                    Click here to reset password
                  </a>
                </div>
              )}

              <Link
                to="/auth"
                className="inline-flex items-center justify-center w-full py-3 bg-[#F1F5F9] text-[#0F172A] font-medium rounded-lg hover:bg-[#E2E8F0] transition-colors"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
                Reset Password
              </h2>
              <p className="text-[#475569] text-sm mb-6">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[#0F172A] text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                      size={18}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#6366F1] text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
