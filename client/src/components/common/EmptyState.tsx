import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button.js';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-10 text-center bg-white border border-[#D9D9D9] rounded-lg border-dashed ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[#6B6B6B] mb-3">
        {icon || <FolderOpen className="w-6 h-6 text-[#6B6B6B]" />}
      </div>
      <h4 className="text-sm font-semibold text-[#111111] mb-1">{title}</h4>
      <p className="text-xs text-[#6B6B6B] max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
