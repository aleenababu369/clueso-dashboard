import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-[#6366F1] text-white hover:bg-[#4F46E5] focus:ring-[#6366F1] disabled:bg-slate-300',
    outline: 'border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] focus:ring-[#6366F1] disabled:bg-slate-50 disabled:text-slate-400',
    subtle: 'bg-transparent text-[#475569] hover:bg-[#F8FAFC] focus:ring-[#6366F1] disabled:text-slate-300',
    danger: 'bg-[#EF4444] text-white hover:bg-red-600 focus:ring-red-500 disabled:bg-red-300'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
