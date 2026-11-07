import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search incidents, errors, services...',
  className = '',
  width = '100%',
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width,
      }}
      className={className}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: 12,
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        className="input-text"
        style={{
          paddingLeft: 36,
          paddingRight: value ? 32 : 12,
          height: 38,
        }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: 10,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
