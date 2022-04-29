import React from 'react';
import './App.css';
import { useSelector } from 'react-redux';
import Footer from '_components/Footer';
import Header from '_components/header/Header';
import { AppState } from '_redux/store';
import Sidebar from '_components/Sidebar';
import Container from '_components/Container';
// import { Container } from '@mui/material';

// TODO general
// NFT minting
// add native assets to aave balancer
// Fix native asset send option
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
