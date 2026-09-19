import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixText?: string;
  suffixText?: string;
  id?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  prefixText,
  suffixText,
  className = '',
  id,
  ...props
}) => {
  const generatedId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={generatedId} className="block text-xs font-semibold text-[#1F1F1F] mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center rounded-md border border-[#D9D9D9] bg-white shadow-xs focus-within:border-[#C62828] focus-within:ring-1 focus-within:ring-[#C62828] transition-all">
        {prefixText && (
          <span className="pl-3 pr-2 text-xs font-semibold text-[#6B6B6B] select-none bg-[#F8F9FA] self-stretch flex items-center border-r border-[#D9D9D9] rounded-l-md">
            {prefixText}
          </span>
        )}
        <input
          id={generatedId}
          className={`w-full px-3 py-2 text-sm text-[#111111] placeholder-[#6B6B6B]/60 bg-transparent rounded-md focus:outline-none disabled:bg-[#F2F2F2] disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {suffixText && (
          <span className="pr-3 pl-2 text-xs text-[#6B6B6B] select-none bg-[#F8F9FA] self-stretch flex items-center border-l border-[#D9D9D9] rounded-r-md">
            {suffixText}
          </span>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#6B6B6B]">{helperText}</p>
      ) : null}
    </div>
  );
};

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const generatedId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={generatedId} className="block text-xs font-semibold text-[#1F1F1F] mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative rounded-md border border-[#D9D9D9] bg-white shadow-xs focus-within:border-[#C62828] focus-within:ring-1 focus-within:ring-[#C62828] transition-all">
        <select
          id={generatedId}
          className={`w-full px-3 py-2 text-sm text-[#111111] bg-white rounded-md focus:outline-none cursor-pointer disabled:bg-[#F2F2F2] ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#6B6B6B]">{helperText}</p>
      ) : null}
    </div>
  );
};

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  id?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const generatedId = id || (label ? `date-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={generatedId} className="block text-xs font-semibold text-[#1F1F1F] mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={generatedId}
        type="date"
        className={`w-full px-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md shadow-xs focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] transition-all cursor-pointer ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#6B6B6B]">{helperText}</p>
      ) : null}
    </div>
  );
};
