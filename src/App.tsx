import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Recordings from "./pages/Recordings";
import RecordingDetails from "./pages/RecordingDetails";
import FinalOutput from "./pages/FinalOutput";
import UploadModal from "./components/UploadModal";
import Auth from "./pages/auth/Auth";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Settings from "./pages/Settings";

// Main app content with protected routes
function AppContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(
    null
  );

  // Check for recording ID in URL on initial load
  useEffect(() => {
    const recordingId = searchParams.get("recording");
    if (recordingId && isAuthenticated) {
      console.log("Recording ID from URL:", recordingId);
      setCurrentRecordingId(recordingId);
      setCurrentPage("recording-details");
      // Clean up URL without page reload
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate, isAuthenticated]);

  // Open upload modal when navigating to "create" page
  useEffect(() => {
    if (currentPage === "create") {
      setIsUploadModalOpen(true);
    }
  }, [currentPage]);

  const handleNavigate = (page: string, recordingId?: string) => {
    setCurrentPage(page);
    if (recordingId) {
      setCurrentRecordingId(recordingId);
    }
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleUploadComplete = (recordingId: string) => {
    setCurrentRecordingId(recordingId);
    setCurrentPage("recording-details");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onOpenUpload={handleOpenUploadModal}
          />
        );
      case "recordings":
        return (
          <Recordings
            onNavigate={handleNavigate}
            onOpenUpload={handleOpenUploadModal}
          />
        );
      case "recording-details":
        return (
          <RecordingDetails
            onNavigate={handleNavigate}
            recordingId={currentRecordingId}
          />
        );
      case "final-output":
        return <FinalOutput onNavigate={handleNavigate} />;
      case "create":
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onOpenUpload={handleOpenUploadModal}
          />
        );
      case "jobs":
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Page
            </h2>
            <p className="text-[#475569]">This page is under construction</p>
          </div>
        );
      case "settings":
        return <Settings />;
      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onOpenUpload={handleOpenUploadModal}
          />
        );
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </Layout>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes (redirect to dashboard if logged in) */}
          <Route
            path="/auth"
            element={
              <PublicOnlyRoute>
                <Auth />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicOnlyRoute>
                <ResetPassword />
              </PublicOnlyRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
