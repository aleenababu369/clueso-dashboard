import { ArrowLeft, Download, Share2, RotateCcw, Play, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

interface FinalOutputProps {
  onNavigate: (page: string) => void;
}

export default function FinalOutput({ onNavigate }: FinalOutputProps) {
  const script = `Welcome to this comprehensive product demo tutorial.

In this video, we'll walk through the key features of our platform and show you how to get the most out of your experience.

First, let's start with the dashboard overview. As you can see, the interface is clean and intuitive, designed to help you navigate effortlessly.

The main navigation is located on the left side, giving you quick access to all essential features including recordings, analytics, and settings.

Next, we'll explore the video upload process. Simply click the upload button, and you can either drag and drop your video files or browse from your computer.

Our AI-powered processing engine will automatically analyze your content and apply intelligent enhancements to create a polished, professional result.

The processing timeline shows you exactly what's happening at each stage, from transcription to voiceover generation and final rendering.

Once complete, you can preview your enhanced video, download it, or share it directly with your team or audience.

Thank you for watching this tutorial. We hope you find our platform helpful in creating amazing video content.`;

  const metadata = {
    originalDuration: '4:32',
    processedDuration: '4:45',
    enhancements: ['AI Voiceover', 'Zoom Effects', 'Auto Captions'],
    processingTime: '3m 24s'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('recording-details')}
          className="p-2 rounded-lg hover:bg-white border border-[#E2E8F0] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#475569]" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-[#0F172A]">Final Output</h1>
            <CheckCircle className="w-7 h-7 text-[#22C55E]" />
          </div>
          <p className="text-[#475569]">Your video has been successfully processed</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Re-run Agent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="none">
            <div className="aspect-video bg-slate-900 rounded-t-lg flex items-center justify-center relative overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Final video"
                className="w-full h-full object-cover"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group">
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                  <Play className="w-10 h-10 text-[#6366F1] ml-1" />
                </div>
              </button>
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg text-sm text-white font-medium">
                {metadata.processedDuration}
              </div>
            </div>

            <div className="p-6 border-t border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="flex-1">
                  <Download className="w-5 h-5 mr-2" />
                  Download Video
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Link
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Processing Summary</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-[#F8FAFC] rounded-lg">
                <p className="text-sm text-[#475569] mb-1">Original</p>
                <p className="text-lg font-bold text-[#0F172A]">{metadata.originalDuration}</p>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-lg">
                <p className="text-sm text-[#475569] mb-1">Processed</p>
                <p className="text-lg font-bold text-[#0F172A]">{metadata.processedDuration}</p>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-lg">
                <p className="text-sm text-[#475569] mb-1">Processing Time</p>
                <p className="text-lg font-bold text-[#0F172A]">{metadata.processingTime}</p>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-lg">
                <p className="text-sm text-[#475569] mb-1">Enhancements</p>
                <p className="text-lg font-bold text-[#0F172A]">{metadata.enhancements.length}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Applied Enhancements</h3>
              <div className="flex flex-wrap gap-2">
                {metadata.enhancements.map((enhancement, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-indigo-50 text-[#6366F1] rounded-lg text-sm font-medium"
                  >
                    {enhancement}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0F172A]">Script</h2>
              <Button variant="subtle" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>

            <div className="prose prose-sm max-w-none">
              <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] max-h-[600px] overflow-y-auto">
                {script.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-[#0F172A] mb-4 last:mb-0 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Processing Complete</h3>
                  <p className="text-sm text-green-700">
                    Your video has been successfully enhanced with AI-powered improvements.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
