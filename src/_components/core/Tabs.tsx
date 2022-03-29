import React from 'react';
export function TabHeader({
  isActive,
  onClick,
  title,
  disabled = false
}: {
  isActive: boolean;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <span
      onClick={() => !disabled && onClick()}
      className={`${
        isActive ? 'text-color-dark bg-white' : 'text-color-light bg-gray-100'
      } inline-block w-full p-4 cursor-pointer w-full transition first:rounded-tl-2xl last:rounded-tr-2xl hover:text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-blue-300 focus:outline-none`}
    >
      {title}
    </span>
  );
}
export function TabHeaderContainer({ children }: { children: React.ReactNode }) {
  return (
    <ul className="font-medium text-center text-color-light text-body-smaller divide-x divide-gray-200 flex ">
      {children}
    </ul>
  );
}
