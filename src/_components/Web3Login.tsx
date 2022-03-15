import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connect } from '_redux/effects/web3Effects';
import { AppState } from '_redux/store';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { setAddress } from '_redux/effects/walletEffects';
import { setStep } from '_redux/effects/onboardingEffects';
import { stepSignMessage } from '_redux/reducers/onboardingReducer';

function App() {
  const dispatch = useDispatch();
  const network = useSelector((state: AppState) => state.web3.network);
  const isConnected = useSelector((state: AppState) => state.web3.isConnected);
  const address = useSelector((state: AppState) => state.wallet.address);
  const signer = useSelector((state: AppState) => state.web3.signer);
  useEffect(() => {
    if (isConnected && signer && !address) {
      signer.getAddress().then((address) => {
        dispatch(setAddress(address));
      });
      dispatch(setStep(stepSignMessage));
    }
  }, [isConnected, network, dispatch]);

  const login = async () => {
    dispatch(connect());
  };

  return (
    <div>
      <Button
        className={'sm:hidden'}
        size={ButtonSize.MEDIUM}
        variant={ButtonVariant.PRIMARY}
        onClick={() => login()}
      >
        Connect
      </Button>
      <Button
        className={'hidden sm:block'}
        size={ButtonSize.MEDIUM}
        variant={ButtonVariant.PRIMARY}
        onClick={() => login()}
      >
        Connect Wallet
      </Button>
    </div>
  );
}

export default App;
