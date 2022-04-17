import { NavLinkDefinition } from '_redux/types/uiTypes';
import NavLink from '_components/NavLink';
import React from 'react';
import { navLinks } from '_components/Container';

export default function DesktopNavLinks() {
  return (
    <div className={'flex-row justify-evenly hidden sm:flex'}>
      {navLinks.map((link: NavLinkDefinition) => (
        <NavLink key={link.tab} tab={link.tab} title={link.title} />
      ))}
    </div>
  );
}
