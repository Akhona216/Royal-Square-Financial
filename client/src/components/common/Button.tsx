import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-[#C62828] text-white hover:bg-[#8E1B1B] focus:ring-[#C62828] shadow-sm',
    secondary: 'bg-[#1F1F1F] text-white hover:bg-[#111111] focus:ring-[#1F1F1F]',
    outline: 'border border-[#D9D9D9] bg-white text-[#111111] hover:bg-[#F2F2F2] hover:border-[#6B6B6B] focus:ring-[#C62828]',
    danger: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-600',
    ghost: 'bg-transparent text-[#1F1F1F] hover:bg-[#F2F2F2] focus:ring-gray-300',
    dark: 'bg-[#111111] text-white hover:bg-black focus:ring-black',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
