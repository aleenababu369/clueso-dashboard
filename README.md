# Clueso Dashboard

React web dashboard for viewing and managing screen recordings with real-time processing updates.

## ✨ Features

- 📹 **Recording List** - View all your recordings
- ⏱️ **Real-time Progress** - Watch processing steps update live via WebSocket
- 🌍 **Language Selection** - Choose target language for AI voiceover translation
- 📝 **Draft Preview** - Preview recordings before generating final video
- 🎬 **Video Playback** - Play completed recordings in-browser
- 📥 **Download** - Download your finished videos
- ❌ **Error Handling** - Clear feedback when processing fails

## 🏗️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time updates
- **Lucide React** - Icons

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Clueso Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │                      App.tsx                          │  │
│   │                   (Router Logic)                      │  │
│   └──────────────────┬───────────────────────────────────┘  │
│                      │                                       │
│        ┌─────────────┼─────────────┐                        │
│        ▼             ▼             ▼                        │
│   ┌─────────┐   ┌─────────┐   ┌─────────────────┐          │
│   │Dashboard│   │Recordings│   │RecordingDetails │          │
│   │  Page   │   │  List   │   │(Video + Timeline)│          │
│   └─────────┘   └─────────┘   └────────┬────────┘          │
│                                        │                    │
│                              ┌─────────┴─────────┐          │
│                              ▼                   ▼          │
│                         ┌────────┐         ┌────────┐       │
│                         │ api.ts │         │socket.ts│      │
│                         │ (HTTP) │         │  (WS)  │       │
│                         └────┬───┘         └────┬───┘       │
│                              │                  │           │
└──────────────────────────────┼──────────────────┼───────────┘
                               ▼                  ▼
                          Backend API      WebSocket Server
```

## 📁 Project Structure

```
src/
├── App.tsx               # Main application component
├── main.tsx              # Entry point
├── index.css             # Global styles
├── components/
│   ├── ui/
│   │   ├── Button.tsx    # Reusable button component
│   │   ├── Card.tsx      # Card container
│   │   ├── Badge.tsx     # Status badges
│   │   └── Progress.tsx  # Progress bar
│   ├── Header.tsx        # Navigation header
│   └── Sidebar.tsx       # Navigation sidebar
├── pages/
│   ├── Dashboard.tsx     # Home page
│   ├── RecordingDetails.tsx  # Single recording view
│   ├── Recordings.tsx    # Recordings list
│   └── Settings.tsx      # Settings page
├── hooks/
│   ├── useRecording.ts   # Single recording with WebSocket
│   └── useRecordings.ts  # Recordings list
└── services/
    ├── api.ts            # HTTP API client
    └── socket.ts         # WebSocket service
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Backend running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

### Running

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🔌 Real-time Updates

The dashboard uses Socket.io to receive real-time processing updates from the backend.

### Connection Flow

```
1. Dashboard opens recording details page
2. Connects to WebSocket server
3. Joins recording room: socket.emit("join-recording", recordingId)
4. Receives updates: socket.on("processing-update", handler)
5. UI updates in real-time
```

### Processing Steps

```typescript
type ProcessingStep =
  | "extracting-audio"
  | "transcribing"
  | "ai-processing"
  | "applying-zoom-effects"
  | "merging"
  | "completed"
  | "failed";

type RecordingStatus =
  | "uploaded"
  | "processing"
  | "draft_ready" // Paused after transcription
  | "completed"
  | "failed";
```

### WebSocket Events

```typescript
// Processing update
socket.on("processing-update", (data) => {
  // data.step: "transcribing", "ai-processing", etc.
  // data.recordingId: "abc-123"
  // data.timestamp: "2024-01-01T00:00:00.000Z"
});

// Processing error
socket.on("processing-error", (data) => {
  // data.error: "FFmpeg merge failed: ..."
  // data.recordingId: "abc-123"
});
```

## 📊 Components

### RecordingDetails

Shows the processing timeline with visual status:

| Status     | Color            | Icon      |
| ---------- | ---------------- | --------- |
| Completed  | Green            | ✓ Check   |
| Processing | Purple (pulsing) | Clock     |
| Failed     | Red              | ✗ XCircle |
| Pending    | Gray             | Step icon |

### useRecording Hook

```typescript
const {
  recording, // Recording data from API
  isLoading, // Loading state
  error, // Error message
  currentStep, // Current processing step
  failedAtStep, // Which step failed (if any)
  processingError, // Detailed error message
  refetch, // Refresh data
} = useRecording(recordingId);
```

## 🎨 Styling

Uses Tailwind CSS with custom design tokens:

```css
/* Primary Colors */
--primary: #6366f1; /* Indigo */
--success: #22c55e; /* Green */
--error: #ef4444; /* Red */

/* Text Colors */
--text-primary: #0f172a;
--text-secondary: #475569;
--text-muted: #94a3b8;
```

## 📡 API Service

### Endpoints Used

```typescript
// Get recording details
api.getRecording(id): Promise<{ recording: Recording }>

// List all recordings
api.listRecordings(params): Promise<{ recordings: Recording[] }>

// Download video
api.downloadRecording(id): Promise<Blob>

// Delete recording
api.deleteRecording(id): Promise<void>
```

### Recording Type

```typescript
interface Recording {
  id: string;
  status: "uploaded" | "processing" | "draft_ready" | "completed" | "failed";
  currentStep?: string;
  targetLanguage?: string; // Selected language for translation
  title?: string;
  description?: string;
  transcript?: string; // Raw transcript (shown in draft mode)
  finalVideoPath?: string;
  cleanedScript?: string; // AI-cleaned/translated script
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🐛 Debugging

### Console Logs

The app logs WebSocket events with emojis for easy debugging:

```
✅ [WebSocket] Connected to server
📥 [WebSocket] Joined recording room: abc-123
🔔 [WebSocket] Processing update received: {step: "transcribing", ...}
📊 [useRecording] Update received for abc-123: transcribing
🚨 [WebSocket] Processing error received: {...}
❌ [useRecording] Error received for abc-123: FFmpeg failed
📤 [WebSocket] Left recording room: abc-123
```

### Common Issues

| Issue                    | Solution                                 |
| ------------------------ | ---------------------------------------- |
| WebSocket not connecting | Check `VITE_WS_URL` matches backend      |
| Updates not showing      | Check if backend worker is running       |
| Video not playing        | Check if recording status is "completed" |

## 📦 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript checks
```

## 🏛️ Architecture Decisions

### Why Socket.io?

- Real-time updates without polling
- Automatic reconnection
- Room-based subscriptions per recording

### Why Tailwind?

- Rapid UI development
- Consistent design tokens
- Small production bundle

### Why Custom Hooks?

- Separation of concerns
- Reusable logic
- Easy testing

## 📄 License

MIT
