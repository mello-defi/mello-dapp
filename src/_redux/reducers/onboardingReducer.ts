import { OnboardingActionTypes, OnboardingState, OnboardingStep, SET_STEP } from '_redux/types/onboardingTypes';
import { NavTab } from '_redux/types/uiTypes';
import Swap from '_pages/swap/Swap';
import Fund from '_pages/Fund';
import { AaveSection } from '_enums/aave';
import AaveReserve from '_components/aave/AaveReserve';
import { polygonMainnetTokens } from '_enums/tokens';
import { CryptoCurrencySymbol } from '_enums/currency';

export const stepMintNft: OnboardingStep = {
  number: 7,
  title: 'Mint NFT',
  nextStep: null
};
export const stepBorrowAave: OnboardingStep = {
  number: 6,
  title: 'Borrow Aave',
  nextStep: stepMintNft,
  actionTab: NavTab.BORROW
};
export const stepDepositAave: OnboardingStep = {
  number: 5,
  title: 'Deposit Aave',
  nextStep: stepBorrowAave,
  actionTab: NavTab.DEPOSIT,
  // component: AaveReserve({
  //   token: polygonMainnetTokens[CryptoCurrencySymbol.MATIC],
  //   aaveSection: AaveSection.Deposit,
  //   reserveSymbol: CryptoCurrencySymbol.MATIC,
  // });
};
export const stepPerformSwap: OnboardingStep = {
  number: 4,
  title: 'Swap gas token for USDC',
  nextStep: stepDepositAave,
  actionTab: NavTab.SWAP,
  component: Swap,
};
export const stepAddGasToWallet: OnboardingStep = {
  number: 3,
  title: 'Add gas to Wallet',
  nextStep: stepPerformSwap,
  actionTab: NavTab.FUND,
  component: Fund,
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
    default:
      return state;
  }
};
