import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  footer,
  noPadding = false,
}) => {
  return (
    <div className={`bg-white border border-[#D9D9D9] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden ${className}`}>
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-[#D9D9D9] flex items-center justify-between bg-white">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-[#111111] tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-[#6B6B6B] mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
      {footer && <div className="px-6 py-3.5 bg-[#F8F9FA] border-t border-[#D9D9D9]">{footer}</div>}
    </div>
  );
};
