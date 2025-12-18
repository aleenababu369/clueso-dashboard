import { useState, useRef, DragEvent } from "react";
import { Upload, File, X, AlertCircle } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Progress from "./ui/Progress";
import { api } from "../services/api";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (recordingId: string) => void;
}

export default function UploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [eventsFile, setEventsFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventsInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "video/webm" || file.type === "video/mp4") {
        setSelectedFile(file);
      } else {
        setError("Please upload a .webm or .mp4 video file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };

  const handleEventsFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setEventsFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Parse events file if provided
      let domEvents: any[] = [];
      if (eventsFile) {
        const eventsText = await eventsFile.text();
        try {
          domEvents = JSON.parse(eventsText);
        } catch {
          setError("Invalid events JSON file");
          setIsUploading(false);
          return;
        }
      }

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to backend
      const result = await api.uploadRecording(selectedFile, domEvents, {
        title: title || selectedFile.name.replace(/\.[^/.]+$/, ""),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Wait a moment before closing
      setTimeout(() => {
        setIsUploading(false);
        setSelectedFile(null);
        setEventsFile(null);
        setUploadProgress(0);
        setTitle("");
        onUploadComplete(result.recordingId);
        onClose();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setEventsFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setTitle("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetModal} title="Upload Video" size="lg">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? "border-[#6366F1] bg-indigo-50"
              : "border-[#E2E8F0] bg-[#F8FAFC]"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-[#6366F1]" />
            </div>

            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
              Drop your video here
            </h3>

            <p className="text-[#475569] mb-6">
              or click to browse from your computer
            </p>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              Browse Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".webm,.mp4"
              onChange={handleFileSelect}
              className="hidden"
            />

            <p className="text-sm text-[#475569] mt-6">
              Supported formats: .webm, .mp4
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Video File */}
          <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <File className="w-6 h-6 text-[#6366F1]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#0F172A] truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-[#475569]">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {!isUploading && (
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5 text-[#475569]" />
              </button>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this recording"
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none"
              disabled={isUploading}
            />
          </div>

          {/* Events File (optional) */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">
              DOM Events JSON (optional)
            </label>
            {eventsFile ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <File className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 flex-1 truncate">
                  {eventsFile.name}
                </span>
                {!isUploading && (
                  <button
                    onClick={() => setEventsFile(null)}
                    className="p-1 rounded hover:bg-green-100"
                  >
                    <X className="w-4 h-4 text-green-600" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => eventsInputRef.current?.click()}
                className="w-full p-3 border border-dashed border-[#E2E8F0] rounded-lg text-sm text-[#475569] hover:border-[#6366F1] hover:bg-indigo-50 transition-colors"
                disabled={isUploading}
              >
                Click to attach events.json file
              </button>
            )}
            <input
              ref={eventsInputRef}
              type="file"
              accept=".json"
              onChange={handleEventsFileSelect}
              className="hidden"
            />
          </div>

          {isUploading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#0F172A]">
                  Uploading...
                </span>
                <span className="text-sm text-[#475569]">
                  {uploadProgress}%
                </span>
              </div>
              <Progress value={uploadProgress} max={100} />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpload} disabled={isUploading} fullWidth>
              {isUploading ? "Processing..." : "Start Processing with AI Agent"}
            </Button>

            {!isUploading && (
              <Button variant="outline" onClick={resetModal}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
