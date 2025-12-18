import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>

      <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{title}</h3>

      {description && (
        <p className="text-[#475569] text-center max-w-sm mb-6">{description}</p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
