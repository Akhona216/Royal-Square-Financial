import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'emerald' | 'amber';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  sublabel,
  size = 'md',
  color = 'primary',
  showPercentage = true,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    primary: 'bg-[#C62828]',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="font-semibold text-[#111111]">{label}</span>
          <div className="flex items-center gap-2">
            {sublabel && <span className="text-[#6B6B6B]">{sublabel}</span>}
            {showPercentage && (
              <span className="font-bold text-[#111111]">{clampedValue}%</span>
            )}
          </div>
        </div>
      )}
      <div className={`w-full bg-[#E5E7EB] rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${heightClasses[size]} ${colorClasses[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
