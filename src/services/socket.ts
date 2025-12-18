import { io, Socket } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3000";

export type ProcessingStep =
  | "extracting-audio"
  | "transcribing"
  | "ai-processing"
  | "applying-zoom-effects"
  | "merging"
  | "completed"
  | "failed";

export interface ProcessingUpdate {
  step: ProcessingStep;
  recordingId: string;
  timestamp: string;
}

export interface ProcessingError {
  step: "failed";
  recordingId: string;
  error: string;
  timestamp: string;
}

type ProcessingUpdateCallback = (update: ProcessingUpdate) => void;
type ProcessingErrorCallback = (error: ProcessingError) => void;

class SocketService {
  private socket: Socket | null = null;
  private updateCallbacks: Map<string, ProcessingUpdateCallback[]> = new Map();
  private errorCallbacks: Map<string, ProcessingErrorCallback[]> = new Map();

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("✅ [WebSocket] Connected to server");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ [WebSocket] Disconnected from server:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("⚠️ [WebSocket] Connection error:", error);
    });

    // Listen for processing updates
    this.socket.on("processing-update", (data: ProcessingUpdate) => {
      console.log("🔔 [WebSocket] Processing update received:", data);
      const callbacks = this.updateCallbacks.get(data.recordingId) || [];
      callbacks.forEach((cb) => cb(data));
    });

    // Listen for processing errors
    this.socket.on("processing-error", (data: ProcessingError) => {
      console.error("🚨 [WebSocket] Processing error received:", data);
      const callbacks = this.errorCallbacks.get(data.recordingId) || [];
      callbacks.forEach((cb) => cb(data));
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Join a recording room to receive updates
   */
  joinRecording(recordingId: string): void {
    if (!this.socket?.connected) {
      this.connect();
    }
    this.socket?.emit("join-recording", recordingId);
    console.log(`📥 [WebSocket] Joined recording room: ${recordingId}`);
  }

  /**
   * Leave a recording room
   */
  leaveRecording(recordingId: string): void {
    this.socket?.emit("leave-recording", recordingId);
    this.updateCallbacks.delete(recordingId);
    this.errorCallbacks.delete(recordingId);
    console.log(`📤 [WebSocket] Left recording room: ${recordingId}`);
  }

  /**
   * Subscribe to processing updates for a recording
   */
  onProcessingUpdate(
    recordingId: string,
    callback: ProcessingUpdateCallback
  ): () => void {
    const callbacks = this.updateCallbacks.get(recordingId) || [];
    callbacks.push(callback);
    this.updateCallbacks.set(recordingId, callbacks);

    // Return unsubscribe function
    return () => {
      const cbs = this.updateCallbacks.get(recordingId) || [];
      const index = cbs.indexOf(callback);
      if (index > -1) {
        cbs.splice(index, 1);
        this.updateCallbacks.set(recordingId, cbs);
      }
    };
  }

  /**
   * Subscribe to processing errors for a recording
   */
  onProcessingError(
    recordingId: string,
    callback: ProcessingErrorCallback
  ): () => void {
    const callbacks = this.errorCallbacks.get(recordingId) || [];
    callbacks.push(callback);
    this.errorCallbacks.set(recordingId, callbacks);

    // Return unsubscribe function
    return () => {
      const cbs = this.errorCallbacks.get(recordingId) || [];
      const index = cbs.indexOf(callback);
      if (index > -1) {
        cbs.splice(index, 1);
        this.errorCallbacks.set(recordingId, cbs);
      }
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const socketService = new SocketService();

export default socketService;
