import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { toggleSidebar } from '_redux/effects/uiEffects';
import React from 'react';
import NavLink from '_components/NavLink';
import { melloLogoFace } from '_assets/images';
import { NavLinkDefinition } from '_redux/types/uiTypes';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { Close } from '@mui/icons-material';

export default function Sidebar() {
  const isOpen = useSelector((state: AppState) => state.ui.sidebarOpen);
  const navLinks = useSelector((state: AppState) => state.ui.navLinks);
  const dispatch = useDispatch();
  return (
    <aside
      className={`flex flex-col md:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transform top-0 left-0 w-64 bg-white fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30`}
    >
      <div className={'mx-4'}>
        <div className={'my-2 flex-row-center justify-between px-2'}>
          <img src={melloLogoFace} alt={'mello'} className={'h-16'} />
          <Close
            className={'cursor-pointer h-7 w-7 transition hover:text-gray-400'}
            onClick={() => dispatch(toggleSidebar(false))}
          />
        </div>
        <HorizontalLineBreak />
        <div>
          {navLinks.map((link: NavLinkDefinition) => (
            <NavLink key={link.tab} tab={link.tab} title={link.title} />
          ))}
        </div>
      </div>
    </aside>
  );
}
