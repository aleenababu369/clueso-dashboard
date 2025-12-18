import { useState, useEffect, useCallback } from "react";
import { api, Recording } from "../services/api";
import {
  socketService,
  ProcessingStep,
  ProcessingUpdate,
} from "../services/socket";

export interface UseRecordingResult {
  recording: Recording | null;
  isLoading: boolean;
  error: string | null;
  currentStep: ProcessingStep | null;
  failedAtStep: ProcessingStep | null; // Which step failed (for showing previous steps as complete)
  processingError: string | null; // Detailed error message from processing
  refetch: () => Promise<void>;
}

/**
 * Hook for managing a single recording with real-time updates
 */
export function useRecording(recordingId: string | null): UseRecordingResult {
  const [recording, setRecording] = useState<Recording | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<ProcessingStep | null>(null);
  const [failedAtStep, setFailedAtStep] = useState<ProcessingStep | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const fetchRecording = useCallback(async () => {
    if (!recordingId) {
      setRecording(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.getRecording(recordingId);
      setRecording(result.recording);
      setCurrentStep((result.recording.currentStep as ProcessingStep) || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch recording"
      );
    } finally {
      setIsLoading(false);
    }
  }, [recordingId]);

  useEffect(() => {
    fetchRecording();
  }, [fetchRecording]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!recordingId) return;

    // Connect to socket and join room
    socketService.connect();
    socketService.joinRecording(recordingId);

    // Listen for updates
    const unsubscribeUpdate = socketService.onProcessingUpdate(
      recordingId,
      (update: ProcessingUpdate) => {
        console.log(
          `📊 [useRecording] Update received for ${recordingId}:`,
          update.step
        );
        setCurrentStep(update.step);

        // Refetch recording data when step changes
        fetchRecording();
      }
    );

    const unsubscribeError = socketService.onProcessingError(
      recordingId,
      (errorData) => {
        console.error(
          `❌ [useRecording] Error received for ${recordingId}:`,
          errorData.error
        );
        // Store which step failed (the current step before failure)
        setFailedAtStep(currentStep);
        setProcessingError(errorData.error);
        setCurrentStep("failed");
        fetchRecording();
      }
    );

    return () => {
      unsubscribeUpdate();
      unsubscribeError();
      socketService.leaveRecording(recordingId);
    };
  }, [recordingId, fetchRecording]);

  return {
    recording,
    isLoading,
    error,
    currentStep,
    failedAtStep,
    processingError,
    refetch: fetchRecording,
  };
}

export interface UseRecordingsListResult {
  recordings: Recording[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
}

/**
 * Hook for managing a list of recordings
 */
export function useRecordingsList(
  initialPage = 1,
  limit = 10
): UseRecordingsListResult {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  const fetchRecordings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.listRecordings({ page, limit });
      setRecordings(result.recordings);
      setPagination(result.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch recordings"
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  return {
    recordings,
    isLoading,
    error,
    pagination,
    refetch: fetchRecordings,
    setPage,
  };
}

/**
 * Map processing step to display label
 */
export function getStepLabel(step: ProcessingStep | string | null): string {
  const labels: Record<string, string> = {
    "extracting-audio": "Extracting Audio",
    transcribing: "Transcribing",
    "ai-processing": "AI Processing",
    "applying-zoom-effects": "Applying Zoom Effects",
    merging: "Merging Video",
    completed: "Completed",
    failed: "Failed",
  };
  return labels[step || ""] || "Processing";
}

/**
 * Get step index for progress calculation
 */
export function getStepIndex(step: ProcessingStep | string | null): number {
  const steps = [
    "extracting-audio",
    "transcribing",
    "ai-processing",
    "applying-zoom-effects",
    "merging",
    "completed",
  ];
  return steps.indexOf(step || "");
}

export const TOTAL_STEPS = 6;
