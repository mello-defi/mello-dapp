import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { AppState } from '_redux/store';
import { setActiveTab } from '_redux/effects/uiEffects';
import { NavTab } from '_redux/types/uiTypes';
import { walletIcon } from '_assets/images';
import { DefaultTransition } from '_components/core/Transition';
import { ArrowRightIcon, ClipboardCheckIcon, LinkIcon, LogoutIcon } from '@heroicons/react/solid';
import { ClipboardCopyIcon } from '@heroicons/react/outline';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { shortenBlockchainAddress } from '_utils/index';

function WalletDropdownListItem({ children }: { children: any }) {
  return <div className={'py-2 cursor-pointer'}>{children}</div>;
}

export default function WalletDropdown() {
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const network = useSelector((state: AppState) => state.web3.network);
  const userAddress = useSelector((state: AppState) => state.web3.userAddress);
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (dropdownOpen) {
      setCopied(false);
    }
  };
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
                  <span className={'flex-row-center'}>
                    {copied ? (
                      <ClipboardCheckIcon className={'h-5 w-5 text-gray-600'} />
                    ) : (
                      <ClipboardCopyIcon
                        onClick={() => copyToClipboard(userAddress)}
                        className={'h-5 w-5 text-gray-600 transition hover:text-gray-400'}
                      />
                    )}
                    <LinkIcon
                      onClick={() =>
                        window.open(`${network.explorerUrl}/address/${userAddress}`, '_blank')
                      }
                      className={'h-5 w-5 ml-2 transition text-gray-600 hover:text-gray-400'}
                    />
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
                  <span className={'flex-row-center'}>
                    <span>{network.name}</span>
                    <img
                      src={network.imageUrl}
                      alt={`${network.name} logo`}
                      className={'h-5 ml-1'}
                    />
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
