import { useDispatch } from 'react-redux';
import { EvmNetworkDefinition, evmNetworks } from '_enums/networks';
import { setNetwork } from '_redux/effects/web3Effects';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import React from 'react';

export default function PolygonMainnetGuard() {
  const dispatch = useDispatch();
  const changeNetwork = (networkTemp: EvmNetworkDefinition) => {
    dispatch(setNetwork(networkTemp));
  };
  return (
    <div className={'flex flex-col items-center justify-center'}>
      <div className={'flex flex-col items-center justify-center'}>
        <span className={'text-body'}>Please switch to Polygon mainnet</span>
        <Button
          onClick={() => changeNetwork(evmNetworks.polygonMainnet)}
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.LARGE}
        >
          Switch to Polygon
        </Button>
      </div>
    </div>
  );
}
