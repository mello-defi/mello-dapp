import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { toggleSidebar } from '_redux/effects/uiEffects';
import React from 'react';

export default function MobileHamburgerMenu() {
  const sidebarOpen = useSelector((state: AppState) => state.ui.sidebarOpen);
  const dispatch = useDispatch();

  return (
    <div>
      <div
        onClick={() => dispatch(toggleSidebar(!sidebarOpen))}
        className="md:hidden mr-2 cursor-pointer hover:text-gray-500 transition"
        aria-controls="mobile-menu"
        aria-expanded="false"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </div>
    </div>
  );
}
