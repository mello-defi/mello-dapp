import React from 'react';
import './App.css';
import { useSelector } from 'react-redux';
import Deposit from '_pages/Deposit/Deposit';
import Footer from '_components/Footer';
import Header from '_components/header/Header';
import Swap from '_pages/Swap/Swap';
import Borrow from '_pages/Borrow/Borrow';
import { NavLinkDefinition, NavTab } from '_redux/types/uiTypes';
import { AppState } from '_redux/store';
import Wallet from '_pages/Wallet/Wallet';
import Fund from '_pages/Fund/Fund';
import Sidebar from '_components/Sidebar';
import Dashboard from '_pages/Dashboard';
import Onboarding from '_pages/Onboarding/Onboarding';
import Invest from '_pages/Invest/Invest';
import Container from '_components/Container';
// import { Container } from '@mui/material';

// TODO general
// NFT minting
// FIx onboarding
// (if time) fix aave chevrom
// add native assets to aave balancer
// Fix native asset send option
// add secondary debounces to swap inputs
// retry failed requests with expontential backoff
// standardise viewing/granting token allowances
// constants for URLs (aave etc)
// Env vars for environment based config (alchemy)

function App() {
  const sidebarOpen = useSelector((state: AppState) => state.ui.sidebarOpen);
  return (
    <div id={'app'}>
      <Sidebar />
      <div
        className={`font-sans bg-white-700 ${
          sidebarOpen ? 'transition opacity-50' : ''
        } flex flex-col min-h-screen bg-gray-50`}
      >
        <Header />
        <Container />
        <Footer />
      </div>
    </div>
  );
}

export default App;
