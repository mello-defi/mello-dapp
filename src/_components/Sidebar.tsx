import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { XIcon } from '@heroicons/react/solid';
import { toggleSidebar } from '_redux/effects/uiEffects';
import { HorizontalLineBreak } from '_components/onramps/RenBridge';
import React from 'react';
import { NavLinkDefinition } from '../App';
import NavLink from '_components/NavLink';
import { melloLogoFace, melloLogoFaceWithText } from '_assets/images';

export default function Sidebar({ navLinks }: { navLinks: NavLinkDefinition[] }) {
  const isOpen = useSelector((state: AppState) => state.ui.sidebarOpen);
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
          <XIcon
            className={'cursor-pointer hover:text-gray-500 h-7 w-7'}
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
