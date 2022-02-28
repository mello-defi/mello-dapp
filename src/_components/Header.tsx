import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Web3Login from './Web3Login';
import { supabase } from '_services/supabaseService';
import { HorizontalLineBreak, shortenBlockchainAddress } from './onramps/RenBridge';
import { AppState } from '_redux/store';
import { setActiveTab, toggleSidebar } from '_redux/effects/uiEffects';
import { ArrowRightIcon, ClipboardCheckIcon, LinkIcon, LogoutIcon } from '@heroicons/react/solid';
import { melloLogoFaceWithText, walletIcon } from '_assets/images';
import { NavLinkDefinition } from '../App';
import NavLink from './NavLink';
import { DefaultTransition } from '_components/core/Transition';
import { NavTab } from '_redux/types/uiTypes';
import { ClipboardCopyIcon } from '@heroicons/react/outline';

interface WalletHistory {
  address: string;
  source: string;
  balance: string;
  token: string;
}

function WalletDropdownListItem({ children }: { children: any }) {
  return <div className={'py-2 cursor-pointer'}>{children}</div>;
}

function WalletDropdown() {
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const network = useSelector((state: AppState) => state.web3.network);
  const userAddress = useSelector((state: AppState) => state.web3.userAddress);
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (dropdownOpen) {
      setCopied(false)
    }
  }
  const navigateToWallet = () => {
    dispatch(setActiveTab(NavTab.WALLET));
    setDropdownOpen(false);
  };
  const disconnect = () => {
    console.log('disconnecting');
  };
  const [copied, setCopied] = useState(false);
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <div className="w-full my-2 sm:my-1">
      <div className="mt-1 relative">
        <div>
          <div
            onClick={toggleDropdown}
            className={
              'hidden sm:block rounded-2xl w-full border-gray-100 border-2 px-4 py-2 cursor-pointer hover:border-gray-300 transition'
            }
          >
            {shortenBlockchainAddress(userAddress)}
          </div>
          <div className={'block sm:hidden'}>
            <img
              onClick={toggleDropdown}
              src={walletIcon}
              alt={'a'}
              className={
                'h-11 w-11 -mt-1 cursor-pointer ml-2 rounded-full hover:border-gray-200 border-gray-100 border-2 transition p-2'
              }
            />
          </div>
        </div>
        <DefaultTransition isOpen={dropdownOpen}>
          <div className="absolute mt-1 w-80 right-0 z-10 rounded-xl bg-white shadow-lg px-2">
            <div className={'flex flex-col px-4 py-2'}>
              <WalletDropdownListItem>
                <div className={'flex-row-center justify-between'}>
                  <span>{shortenBlockchainAddress(userAddress)}</span>
                  <span className={"flex-row-center"}>
                    {copied ? (
                      <ClipboardCheckIcon className={'h-5 w-5 text-gray-600'} />
                    ): (
                      <ClipboardCopyIcon
                        onClick={() => copyToClipboard(userAddress)}
                        className={'h-5 w-5 text-gray-600 transition hover:text-gray-400'} />
                    )}
                    <LinkIcon onClick={() => window.open(`${network.explorerUrl}/address/${userAddress}`, "_blank")} className={'h-5 w-5 ml-2 transition text-gray-600 hover:text-gray-400'} />
                  </span>
                </div>
              </WalletDropdownListItem>
              <HorizontalLineBreak />
              <WalletDropdownListItem>
                <div onClick={navigateToWallet} className={'flex-row-center justify-between'}>
                  <span>Balance</span>
                  <ArrowRightIcon className={'ml-2 h-5 text-gray-600'} />
                </div>
              </WalletDropdownListItem>
              <HorizontalLineBreak />
              <WalletDropdownListItem>
                <div className={'flex-row-center justify-between'} onClick={disconnect}>
                  <span>Network</span>
                  <span className={"flex-row-center"}>
                    <span>{network.name}</span>
                    <img src={network.imageUrl} alt={`${network.name} logo`} className={"h-5 ml-1"}/>
                  </span>
                </div>
              </WalletDropdownListItem>
              <HorizontalLineBreak />
              <WalletDropdownListItem>
                <div className={'flex-row-center justify-between'} onClick={disconnect}>
                  <span>Disconnect</span>
                  <LogoutIcon className={'ml-2 h-5 text-gray-600'} />
                </div>
              </WalletDropdownListItem>
            </div>
          </div>
        </DefaultTransition>
      </div>
    </div>
  );
}

function DesktopNavLinks({ navLinks }: { navLinks: NavLinkDefinition[] }) {
  return (
    <div className={'flex-row justify-evenly hidden sm:flex'}>
      {navLinks.map((link: NavLinkDefinition) => (
        <NavLink key={link.tab} tab={link.tab} title={link.title} />
      ))}
    </div>
  );
}

function MobileHamburgerMenu() {
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

export default function Header({ navLinks }: { navLinks: NavLinkDefinition[] }) {
  const provider = useSelector((state: AppState) => state.web3.provider);
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
        const walletHistory: WalletHistory = {
          address: address,
          balance: '10',
          source: 'metamask',
          token: 'ETH'
        };
        supabase
          .from('wallet_history')
          .insert([walletHistory])
          .then((data) => {
            console.log(data);
          });
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
