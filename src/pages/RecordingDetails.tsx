import {
  ArrowLeft,
  Play,
  Mic,
  FileText,
  Wand2,
  Zap,
  Check,
  Clock,
  Download,
  RefreshCw,
  AlertCircle,
  XCircle,
  Merge,
  Globe,
  Languages,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Progress from "../components/ui/Progress";
import {
  useRecording,
  getStepLabel,
  getStepIndex,
  TOTAL_STEPS,
} from "../hooks/useRecording";
import { api } from "../services/api";
import { useState } from "react";

interface RecordingDetailsProps {
  onNavigate: (page: string, recordingId?: string) => void;
  recordingId?: string | null;
}

import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function RecordingDetails({
  onNavigate,
  recordingId,
}: RecordingDetailsProps) {
  const { accessToken, refreshAccessToken } = useAuth();
  const {
    recording,
    isLoading,
    error,
    currentStep,
    failedAtStep,
    processingError,
    refetch,
  } = useRecording(recordingId || null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isProcessingStart, setIsProcessingStart] = useState(false);
  const [videoToken, setVideoToken] = useState<string | null>(accessToken);

  // Refresh token when recording is ready to display video
  useEffect(() => {
    if (
      (recording?.status === "completed" ||
        recording?.status === "draft_ready") &&
      refreshAccessToken
    ) {
      refreshAccessToken().then((token) => {
        if (token) {
          setVideoToken(token);
        }
      });
    }
  }, [recording?.status, refreshAccessToken]);

  const LANGUAGES = [
    { code: "en", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
    { code: "pt", name: "Portuguese" },
  ];

  // Processing steps based on actual backend pipeline
  const processingSteps = [
    { id: "extracting-audio", label: "Extracting Audio", icon: Mic },
    { id: "transcribing", label: "Transcribing Audio", icon: FileText },
    { id: "ai-processing", label: "AI Processing", icon: Wand2 },
    { id: "applying-zoom-effects", label: "Applying Zoom Effects", icon: Zap },
    { id: "merging", label: "Final Render", icon: Merge },
  ];

  const getStepStatus = (
    stepId: string
  ): "completed" | "processing" | "pending" | "failed" => {
    // 1. Draft Ready: Logic override
    // Even if currentStep says "completed", we only show first 2 steps as done
    if (recording?.status === "draft_ready") {
      const stepIndex = processingSteps.findIndex((s) => s.id === stepId);
      // extracting-audio (0) and transcribing (1) are done
      if (stepIndex <= 1) return "completed";
      return "pending";
    }

    // 2. Completed: All done
    if (recording?.status === "completed") return "completed";

    // 3. Failed: Show progress until failure
    if (recording?.status === "failed") {
      const failedStepId = failedAtStep || currentStep;
      const failedIndex = processingSteps.findIndex(
        (s) => s.id === failedStepId
      );
      const stepIndex = processingSteps.findIndex((s) => s.id === stepId);

      if (failedIndex !== -1) {
        if (stepIndex < failedIndex) return "completed";
        if (stepIndex === failedIndex) return "failed";
        return "pending";
      }
      return "failed"; // Fallback if regular logic fails
    }

    // 4. Processing / Normal Flow
    if (!currentStep) return "pending";
    if (currentStep === "completed") return "completed";

    const currentIndex = processingSteps.findIndex((s) => s.id === currentStep);
    const stepIndex = processingSteps.findIndex((s) => s.id === stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "processing";
    return "pending";
  };

  const handleDownload = async () => {
    if (!recordingId) return;

    setIsDownloading(true);
    try {
      const blob = await api.downloadRecording(recordingId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${recording?.title || "recording"}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleStartProcessing = async () => {
    if (!recordingId) return;
    setIsProcessingStart(true);
    try {
      await api.processRecording(recordingId, selectedLanguage);
      refetch();
    } catch (err) {
      console.error("Failed to start processing:", err);
      // Optional: Show toast error
    } finally {
      setIsProcessingStart(false);
    }
  };

  const progressPercent =
    recording?.status === "completed"
      ? 100
      : Math.round(((getStepIndex(currentStep) + 1) / TOTAL_STEPS) * 100);

  if (isLoading && !recording) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-[#6366F1] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#0F172A] mb-2">
          Error Loading Recording
        </h2>
        <p className="text-[#475569] mb-4">{error}</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate("recordings")}
          className="p-2 rounded-lg hover:bg-white border border-[#E2E8F0] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#475569]" />
        </button>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-1">
            {recording?.title || "Recording Details"}
          </h1>
          <p className="text-[#475569]">
            {recording?.createdAt
              ? `Uploaded on ${new Date(recording.createdAt).toLocaleString()}`
              : "Loading..."}
          </p>
        </div>

        <Badge
          status={
            recording?.status === "completed"
              ? "completed"
              : recording?.status === "failed"
              ? "failed"
              : "processing"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview */}
          <Card padding="none">
            <div className="aspect-video bg-slate-900 rounded-t-lg flex items-center justify-center relative overflow-hidden">
              {(recording?.status === "completed" &&
                recording.finalVideoPath) ||
              recording?.status === "draft_ready" ? (
                <video
                  src={`${
                    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
                  }/recordings/${recordingId}/${
                    recording?.status === "draft_ready"
                      ? "stream-raw"
                      : "download"
                  }?token=${videoToken || accessToken}`}
                  controls
                  className="w-full h-full"
                />
              ) : (
                <div className="text-center text-white">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    {recording?.status === "processing" ? (
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-8 h-8" />
                    )}
                  </div>
                  <p className="text-lg font-medium">
                    {recording?.status === "processing"
                      ? getStepLabel(currentStep)
                      : recording?.status === "failed"
                      ? "Processing Failed"
                      : "Video Preview"}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#475569]">Video Controls</span>
                <div className="flex gap-2">
                  {recording?.status === "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={isDownloading}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {isDownloading ? "Downloading..." : "Download"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Processing Progress */}
          {recording?.status === "processing" && (
            <Card>
              <h2 className="text-xl font-bold text-[#0F172A] mb-4">
                Processing Progress
              </h2>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#0F172A]">
                    {getStepLabel(currentStep)}
                  </span>
                  <span className="text-sm text-[#475569]">
                    {progressPercent}%
                  </span>
                </div>
                <Progress value={progressPercent} max={100} />
              </div>

              <Button onClick={refetch} variant="outline" fullWidth>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </Card>
          )}

          {/* Transcript (for draft recordings) */}
          {recording?.transcript && recording?.status === "draft_ready" && (
            <Card>
              <h2 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6366F1]" />
                Transcript
              </h2>
              <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] max-h-80 overflow-y-auto">
                <p className="text-[#475569] whitespace-pre-wrap">
                  {recording.transcript}
                </p>
              </div>
            </Card>
          )}

          {/* Cleaned Script */}
          {recording?.cleanedScript && (
            <Card>
              <h2 className="text-xl font-bold text-[#0F172A] mb-4">
                Generated Script
              </h2>
              <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <p className="text-[#475569] whitespace-pre-wrap">
                  {recording.cleanedScript}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Draft Action Card */}
          {recording?.status === "draft_ready" && (
            <Card>
              <h2 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-[#6366F1]" />
                Generate Video
              </h2>
              <p className="text-sm text-[#475569] mb-4">
                Your draft is ready. Select a target language for the AI
                voiceover and generate the final video.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">
                    Target Language
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#6366F1] appearance-none"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  fullWidth
                  onClick={handleStartProcessing}
                  disabled={isProcessingStart}
                >
                  {isProcessingStart ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Final Video
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Processing Timeline */}
          <Card>
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">
              Processing Timeline
            </h2>

            <div className="space-y-4">
              {processingSteps.map((step, index) => {
                const Icon = step.icon;
                const status = getStepStatus(step.id);
                const isCompleted = status === "completed";
                const isProcessing = status === "processing";
                const isFailed = status === "failed";

                return (
                  <div key={step.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-[#22C55E]"
                            : isFailed
                            ? "bg-red-500"
                            : isProcessing
                            ? "bg-[#6366F1] animate-pulse"
                            : "bg-slate-200"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : isFailed ? (
                          <XCircle className="w-4 h-4 text-white" />
                        ) : isProcessing ? (
                          <Clock className="w-4 h-4 text-white" />
                        ) : (
                          <Icon className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      {index < processingSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-8 ${
                            isCompleted
                              ? "bg-[#22C55E]"
                              : isFailed
                              ? "bg-red-500"
                              : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-medium ${
                            isFailed
                              ? "text-red-600"
                              : status === "pending"
                              ? "text-[#475569]"
                              : "text-[#0F172A]"
                          }`}
                        >
                          {step.label}
                        </span>
                        {isProcessing && <Badge status="processing" />}
                        {isFailed && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                            Failed
                          </span>
                        )}
                      </div>
                      {isFailed && processingError && (
                        <p className="text-xs text-red-500 mt-1 line-clamp-2">
                          {processingError.split("\n")[0]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recording Info */}
          <Card>
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">
              Recording Info
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#E2E8F0]">
                <span className="text-sm text-[#475569]">Status</span>
                <span className="text-sm font-medium text-[#0F172A] capitalize">
                  {recording?.status || "-"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#E2E8F0]">
                <span className="text-sm text-[#475569]">Recording ID</span>
                <span className="text-sm font-mono text-[#0F172A]">
                  {recordingId?.slice(0, 8) || "-"}...
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[#475569]">Language</span>
                <span className="text-sm font-medium text-[#0F172A] flex items-center gap-1">
                  <Languages className="w-3 h-3 text-[#64748B]" />
                  {recording?.targetLanguage
                    ? LANGUAGES.find((l) => l.code === recording.targetLanguage)
                        ?.name || recording.targetLanguage
                    : "English (Default)"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[#475569]">Created</span>
                <span className="text-sm font-medium text-[#0F172A]">
                  {recording?.createdAt
                    ? new Date(recording.createdAt).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
          </Card>

          {/* Error Display */}
          {recording?.status === "failed" && recording.errorMessage && (
            <Card>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-700 mb-1">
                    Processing Failed
                  </h3>
                  <p className="text-sm text-red-600">
                    {recording.errorMessage}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
