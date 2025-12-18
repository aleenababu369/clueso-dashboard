import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          {label}
        </label>
      )}

      <input
        className={`w-full px-4 py-2 rounded-lg border ${
          error
            ? 'border-[#EF4444] focus:ring-[#EF4444]'
            : 'border-[#E2E8F0] focus:ring-[#6366F1]'
        } focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${className}`}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-sm text-[#EF4444]">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-sm text-[#475569]">{helperText}</p>
      )}
    </div>
  );
}
