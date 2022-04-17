import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { melloLogoFaceWithText } from '_assets/images';
import { NavLinkDefinition } from '_redux/types/uiTypes';
import WalletDropdown from '_components/header/WalletDropdown';
import MobileHamburgerMenu from '_components/header/MobileHamburgerMenu';
import Web3Login from '_components/Web3Login';
import NavLink from '_components/NavLink';
import { navLinks } from '../../App';
import DesktopNavLinks from '_components/header/DesktopNavLinks';
import { setOnboardingComplete } from '_redux/effects/onboardingEffects';

export default function Header() {
  const isConnected = useSelector((state: AppState) => state.web3.isConnected);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const [count, setCount] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    if (count >= 5) {
      setCount(0);
      dispatch(setOnboardingComplete(true));
    }
  }, [count]);
  return (
    <header className={'mb-2 py-2 sm:py-4 px-2 w-full bg-white'}>
      <div className={'max-w-5xl mx-auto flex-row-center justify-between'}>
        <div className={'flex-row-center'}>
          <div className={'border-r-2 pr-2 mr-2 sm:pr-4 sm:mr-4 border-gray-200'}>
            <img
              onClick={() => setCount(count + 1)}
              src={melloLogoFaceWithText}
              className={'h-10 sm:h-12'}
              alt={'mello logo'}
            />
          </div>
          <DesktopNavLinks />
        </div>
        <div className={'flex-row-center'}>
          <MobileHamburgerMenu />
          {!isConnected || !userAddress ? <Web3Login /> : <WalletDropdown />}
        </div>
      </div>
    </header>
  );
}
