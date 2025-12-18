interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function Progress({
  value,
  max = 100,
  size = 'md',
  showLabel = false
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className="h-full bg-[#6366F1] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {showLabel && (
        <p className="mt-1.5 text-sm text-[#475569] text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}
