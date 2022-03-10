import {
  OnboardingActionTypes,
  OnboardingState,
  OnboardingStep,
  SET_IS_COMPLETE,
  SET_IS_ONGOING,
  SET_STEP
} from '_redux/types/onboardingTypes';
import { AaveSection } from '_enums/aave';
import Swap from '_pages/swap/Swap';
import AaveReserve from '_components/aave/AaveReserve';
import { CryptoCurrencySymbol } from '_enums/currency';
import FiatOnboarding from '_pages/fund/FiatOnboarding';

export const stepMintNft: OnboardingStep = {
  number: 7,
  title: 'Mint NFT',
  nextStep: null,
};
export const stepBorrowAave: OnboardingStep = {
  number: 6,
  title: 'Borrow Aave',
  nextStep: stepMintNft,
  component: AaveReserve,
  componentProps: {
    aaveSection: AaveSection.Borrow,
    reserveSymbol: CryptoCurrencySymbol.USDC,
  }
};

export const stepDepositAave: OnboardingStep = {
  number: 5,
  title: 'Deposit Aave',
  nextStep: stepBorrowAave,
  component: AaveReserve,
  componentProps: {
    aaveSection: AaveSection.Deposit,
    reserveSymbol: CryptoCurrencySymbol.WBTC,
  }
};

export const stepPerformSwap: OnboardingStep = {
  number: 4,
  title: 'Swap gas token for WBTC',
  nextStep: stepDepositAave,
  component: Swap,
  componentProps: {
    initialSourceTokenSymbol: CryptoCurrencySymbol.MATIC,
    initialDestinationTokenSymbol: CryptoCurrencySymbol.WBTC
  }
};
export const stepAddGasToWallet: OnboardingStep = {
  number: 3,
  title: 'Add gas to Wallet',
  nextStep: stepPerformSwap,
  component: FiatOnboarding
};
export const stepConnectWallet: OnboardingStep = {
  number: 2,
  title: 'Connect Wallet',
  nextStep: stepAddGasToWallet
};
export const stepTermsAndConditions: OnboardingStep = {
  number: 1,
  title: 'Accept Terms and Conditions',
  nextStep: stepConnectWallet
};

const steps: OnboardingStep[] = [
  {
    ...stepTermsAndConditions,
    nextStep: stepConnectWallet
  },
  {
    ...stepConnectWallet,
    nextStep: stepAddGasToWallet
  },
  {
    ...stepAddGasToWallet,
    nextStep: stepPerformSwap
  },
  {
    ...stepPerformSwap,
    nextStep: stepDepositAave
  },
  {
    ...stepDepositAave,
    nextStep: stepBorrowAave
  },
  {
    ...stepBorrowAave,
    nextStep: stepMintNft
  },
  {
    ...stepMintNft
  }
];
const initialState: OnboardingState = {
  steps,
  complete: false,
  ongoing: false,
  currentStep: stepConnectWallet
};

export const getOnboardingReducer = (
  state: OnboardingState = initialState,
  action: OnboardingActionTypes
): OnboardingState => {
  switch (action.type) {
    case SET_STEP:
      return {
        ...state,
        currentStep: action.payload.step
      };
    case SET_IS_COMPLETE:
      return {
        ...state,
        complete: action.payload.complete
      };
    case SET_IS_ONGOING:
      return {
        ...state,
        ongoing: action.payload.ongoing
      };
    default:
      return state;
  }
};
