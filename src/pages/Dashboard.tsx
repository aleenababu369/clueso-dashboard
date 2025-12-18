import { Upload, Chrome, Video, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

interface DashboardProps {
  onNavigate: (page: string) => void;
  onOpenUpload: () => void;
}

export default function Dashboard({
  onNavigate,
  onOpenUpload,
}: DashboardProps) {
  const { user } = useAuth();
  const stats = [
    { label: "Total Recordings", value: "24", icon: Video, change: "+12%" },
    { label: "Processing Time", value: "2.4m", icon: Clock, change: "-8%" },
    { label: "Success Rate", value: "98%", icon: TrendingUp, change: "+3%" },
  ];

  const recentRecordings = [
    {
      id: 1,
      name: "Product Demo Tutorial",
      thumbnail:
        "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400",
      duration: "4:32",
      date: "2 hours ago",
      status: "completed" as const,
    },
    {
      id: 2,
      name: "Onboarding Walkthrough",
      thumbnail:
        "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400",
      duration: "6:15",
      date: "5 hours ago",
      status: "processing" as const,
    },
    {
      id: 3,
      name: "Feature Showcase",
      thumbnail:
        "https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=400",
      duration: "3:48",
      date: "Yesterday",
      status: "completed" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-xl p-8 md:p-12 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Welcome back, {user?.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-lg text-indigo-100 mb-8 max-w-2xl">
          Upload or record a video to start generating AI-powered tutorials.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onOpenUpload}
            className="bg-white text-[#6366F1] hover:bg-slate-50 border-0"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Video
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-sm"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Open Chrome Extension
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#475569] mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#0F172A]">
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#6366F1]" />
                </div>
              </div>
              <div className="mt-4">
                <span
                  className={`text-sm font-medium ${
                    stat.change.startsWith("+")
                      ? "text-[#22C55E]"
                      : "text-[#EF4444]"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-[#475569] ml-1">
                  vs last month
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#0F172A]">
            Recent Recordings
          </h2>
          <Button variant="subtle" onClick={() => onNavigate("recordings")}>
            View all
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentRecordings.map((recording) => (
            <Card
              key={recording.id}
              padding="none"
              hover
              className="cursor-pointer"
              onClick={() => onNavigate("recording-details")}
            >
              <div className="relative aspect-video bg-slate-100 rounded-t-lg overflow-hidden">
                <img
                  src={recording.thumbnail}
                  alt={recording.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white font-medium">
                  {recording.duration}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-[#0F172A] mb-2 line-clamp-1">
                  {recording.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#475569]">
                    {recording.date}
                  </span>
                  <Badge status={recording.status} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
