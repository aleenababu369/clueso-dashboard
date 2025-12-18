import {
  Search,
  Filter,
  MoreVertical,
  Video as VideoIcon,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { useState } from "react";
import { useRecordingsList } from "../hooks/useRecording";
import { api, Recording } from "../services/api";

interface RecordingsProps {
  onNavigate: (page: string, recordingId?: string) => void;
  onOpenUpload: () => void;
}

export default function Recordings({
  onNavigate,
  onOpenUpload,
}: RecordingsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { recordings, isLoading, error, pagination, refetch, setPage } =
    useRecordingsList(1, 20);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRecordings = recordings.filter((recording) =>
    recording.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, recordingId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this recording?")) return;

    setDeletingId(recordingId);
    try {
      await api.deleteRecording(recordingId);
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: Recording["status"]) => {
    const statusMap: Record<
      string,
      "completed" | "processing" | "failed" | "uploaded"
    > = {
      completed: "completed",
      processing: "processing",
      failed: "failed",
      uploaded: "uploaded",
    };
    return statusMap[status] || "processing";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Recordings</h1>
          <p className="text-[#475569]">
            Manage and process your video recordings
            {pagination && ` (${pagination.total} total)`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={onOpenUpload}>
            <VideoIcon className="w-4 h-4 mr-2" />
            Upload New
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
            <Input
              placeholder="Search recordings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {isLoading && recordings.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-[#6366F1] border-t-transparent rounded-full" />
        </div>
      ) : filteredRecordings.length === 0 ? (
        <EmptyState
          icon={VideoIcon}
          title={searchQuery ? "No matches found" : "No recordings yet"}
          description={
            searchQuery
              ? "Try adjusting your search query"
              : "Upload your first video to get started"
          }
          action={
            !searchQuery && (
              <Button onClick={onOpenUpload}>Upload Recording</Button>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-slate-50">
                  <th className="text-left py-3 px-6 text-sm font-semibold text-[#0F172A]">
                    Recording
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-[#0F172A]">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-[#0F172A]">
                    Created
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-[#0F172A]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecordings.map((recording) => (
                  <tr
                    key={recording.id}
                    className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    onClick={() =>
                      onNavigate("recording-details", recording.id)
                    }
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-slate-200 rounded border border-[#E2E8F0] flex items-center justify-center">
                          <VideoIcon className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <span className="font-medium text-[#0F172A] block">
                            {recording.title ||
                              `Recording ${recording.id.slice(0, 8)}`}
                          </span>
                          <span className="text-xs text-[#475569] font-mono">
                            {recording.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={getStatusBadge(recording.status)} />
                    </td>
                    <td className="py-4 px-6 text-[#475569]">
                      {formatDate(recording.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleDelete(e, recording.id)}
                          disabled={deletingId === recording.id}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-[#475569]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0]">
              <span className="text-sm text-[#475569]">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
