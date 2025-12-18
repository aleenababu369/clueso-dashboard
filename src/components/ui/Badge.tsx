interface BadgeProps {
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  text?: string;
}

export default function Badge({ status, text }: BadgeProps) {
  const statusConfig = {
    uploaded: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      dot: 'bg-slate-500',
      label: text || 'Uploaded'
    },
    processing: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500 animate-pulse',
      label: text || 'Processing'
    },
    completed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      dot: 'bg-[#22C55E]',
      label: text || 'Completed'
    },
    failed: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      dot: 'bg-[#EF4444]',
      label: text || 'Failed'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}
