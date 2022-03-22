import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { AppState } from '_redux/store';
import { setActiveTab } from '_redux/effects/uiEffects';
import { NavTab } from '_redux/types/uiTypes';
import { DefaultTransition } from '_components/core/Transition';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { shortenBlockchainAddress } from '_utils/index';
import { disconnect } from '_redux/effects/web3Effects';
import {
  AccountBalanceWallet,
  AssignmentTurnedInOutlined,
  ChevronRightOutlined,
  ContentCopyOutlined,
  Link,
  LogoutOutlined
} from '@mui/icons-material';

function WalletDropdownListItem({ children }: { children: React.ReactNode }) {
  return <div className={'py-2 cursor-pointer'}>{children}</div>;
}

export default function WalletDropdown() {
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const network = useSelector((state: AppState) => state.web3.network);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
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
  const handleDisconnect = () => {
    dispatch(disconnect());
  };
  const [copied, setCopied] = useState(false);
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <div className="w-full my-2 sm:my-1">
      <div className="mt-1 relative">
        {userAddress && (
          <>
            <div>
              <div
                onClick={toggleDropdown}
                className={
                  'hidden sm:block rounded-2xl w-full border-gray-100 border px-4 py-2 cursor-pointer hover:border-gray-300 transition'
                }
              >
                {shortenBlockchainAddress(userAddress)}
              </div>
              <div className={'block sm:hidden text-4xl'}>
                <AccountBalanceWallet
                  onClick={toggleDropdown}
                  fontSize={'inherit'}
                  className={
                    'text-color-light cursor-pointer mb-2 ml-2 transition hover:text-gray-400'
                  }
                />
              </div>
            </div>
            <DefaultTransition isOpen={dropdownOpen}>
              <div className="absolute mt-1 w-80 right-0 z-10 rounded-2xl bg-white shadow-lg px-2">
                <div className={'flex flex-col px-4 py-2'}>
                  <WalletDropdownListItem>
                    <div className={'flex-row-center justify-between'}>
                      <span className={'flex-row-center'}>
                        <span>{shortenBlockchainAddress(userAddress)}</span>
                        <span className={'ml-2'}>
                          {copied ? (
                            <AssignmentTurnedInOutlined className={'h-5 w-5 text-color-light'} />
                          ) : (
                            <ContentCopyOutlined
                              onClick={() => copyToClipboard(userAddress)}
                              className={'h-5 w-5 text-color-light transition hover:text-gray-400'}
                            />
                          )}
                        </span>
                      </span>

                      <span className={'flex-row-center'}>
                        <Link
                          onClick={() =>
                            window.open(`${network.explorerUrl}/address/${userAddress}`, '_blank')
                          }
                          className={'h-5 w-5 ml-2 transition text-color-light hover:text-gray-400'}
                        />
                      </span>
                    </div>
                  </WalletDropdownListItem>
                  <HorizontalLineBreak />
                  <WalletDropdownListItem>
                    <div onClick={navigateToWallet} className={'flex-row-center justify-between'}>
                      <span>Balance</span>
                      <ChevronRightOutlined className={'ml-2 h-5 text-color-light'} />
                    </div>
                  </WalletDropdownListItem>
                  <HorizontalLineBreak />
                  <WalletDropdownListItem>
                    <div
                      className={'flex-row-center justify-between'}
                      onClick={() => {
                        console.log('logout');
                      }}
                    >
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
                    <div className={'flex-row-center justify-between'} onClick={handleDisconnect}>
                      <span>Disconnect</span>
                      <LogoutOutlined
                        className={'ml-2 h-5 text-color-light hover:text-gray-400 transition'}
                      />
                    </div>
                  </WalletDropdownListItem>
                </div>
              </div>
            </DefaultTransition>
          </>
        )}
      </div>
    </div>
  );
}
