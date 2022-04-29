import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connect } from '_redux/effects/web3Effects';
import { AppState } from '_redux/store';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { setAddress } from '_redux/effects/walletEffects';
import { setStep } from '_redux/effects/onboardingEffects';
import { stepConnectWallet } from '_pages/Onboarding/OnboardingSteps';
import LogRocket from 'logrocket';

function App() {
  const dispatch = useDispatch();
  const { complete, ongoing, currentStep } = useSelector((state: AppState) => state.onboarding);

  const network = useSelector((state: AppState) => state.web3.network);
  const isConnected = useSelector((state: AppState) => state.web3.isConnected);
  const address = useSelector((state: AppState) => state.wallet.address);
  const signer = useSelector((state: AppState) => state.web3.signer);
  useEffect(() => {
    if (isConnected && signer && !address) {
      signer.getAddress().then((address) => {
        LogRocket.identify(address, {});
        dispatch(setAddress(address));
      });
      // TODO decouple
      // TODO change to incrementStep() no number
      if (!complete && ongoing && currentStep === stepConnectWallet.number) {
        dispatch(setStep(stepConnectWallet.number + 1));
      }
    }
  }, [isConnected, network, dispatch]);

  const login = () => {
    try {
      dispatch(connect());
    } catch (e) {
      console.log(e);
    }
  };

  // dispatch(autoConnect());

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
        Connect
      </Button>
    </div>
  );
}

export default App;
