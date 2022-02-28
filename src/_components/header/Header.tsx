import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Web3Login from '../Web3Login';
import { AppState } from '_redux/store';
import { melloLogoFaceWithText } from '_assets/images';
import NavLink from '../NavLink';
import { NavLinkDefinition } from '_redux/types/uiTypes';
import WalletDropdown from '_components/header/WalletDropdown';
import MobileHamburgerMenu from '_components/header/MobileHamburgerMenu';

function DesktopNavLinks({ navLinks }: { navLinks: NavLinkDefinition[] }) {
  return (
    <div className={'flex-row justify-evenly hidden sm:flex'}>
      {navLinks.map((link: NavLinkDefinition) => (
        <NavLink key={link.tab} tab={link.tab} title={link.title} />
      ))}
    </div>
  );
}

export default function Header() {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const navLinks = useSelector((state: AppState) => state.ui.navLinks);
  const [userAddress, setUserAddress] = useState<string>('');
  const [userBalance, setUserBalance] = useState<string>('');
  useEffect(() => {
    const getWalletInfo = async () => {
      if (provider) {
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const balance = await signer.getBalance();
        console.log('address', address);
        setUserAddress(address);
        setUserBalance(balance.toString());
        // const walletHistory: WalletHistory = {
        //   address: address,
        //   balance: '10',
        //   source: 'metamask',
        //   token: 'ETH'
        // };
        // supabase
        //   .from('wallet_history')
        //   .insert([walletHistory])
        //   .then((data) => {
        //     console.log(data);
        //   });
      }
    };
    provider && getWalletInfo();
  }, [provider]);
  return (
    <header className={'mb-2 py-2 sm:py-4 px-2 w-full bg-white'}>
      <div className={'max-w-5xl mx-auto flex-row-center justify-between'}>
        <div className={'flex-row-center'}>
          <div className={'border-r-2 pr-2 mr-2 sm:pr-4 sm:mr-4 border-gray-200'}>
            <img src={melloLogoFaceWithText} className={'h-10 sm:h-12'} alt={'mello logo'} />
          </div>
          <DesktopNavLinks navLinks={navLinks} />
        </div>
        <div className={'flex-row-center'}>
          <MobileHamburgerMenu />
          {!userAddress ? <Web3Login /> : <WalletDropdown />}
        </div>
      </div>
    </header>
  );
}
