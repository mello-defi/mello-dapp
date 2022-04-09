import React from 'react';

export enum ButtonVariant {
  PRIMARY = 'bg-gray-700 text-white hover:bg-gray-600',
  SECONDARY = 'bg-gray-100 border-gray-150 border text-black hover:bg-gray-200'
}

export enum ButtonSize {
  SMALL = 'px-3 py-1 rounded-xl',
  MEDIUM = 'px-6 py-3.5 rounded-2xl',
  LARGE = 'px-8 py-4 rounded-2xl'
}

export function Button({
  children,
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.MEDIUM,
  onClick,
  className,
  disabled = false,
  id = null
}: {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick: () => void;
  disabled?: boolean;
  id?: string | null;
}) {
  return (
    <button
      {...(id && { id })}
      className={`${size} flex-none text-button transition ${variant} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
