import { OnboardingActionTypes, OnboardingState, OnboardingStep, SET_STEP } from '_redux/types/onboardingTypes';


const stepTermsAndConditions: OnboardingStep = {
  number: 1,
  title: 'Terms and Conditions',
};
const stepConnectWallet: OnboardingStep = {
  number: 2,
  title: 'Connect Wallet',
};

const stepAddGasToWallet: OnboardingStep = {
  number: 3,
  title: 'Add gas to Wallet',
};

const stepPerformSwap: OnboardingStep = {
  number: 4,
  title: 'Perform Swap',
};

const stepDepositAave: OnboardingStep = {
  number: 5,
  title: 'Deposit Aave',
};

const stepBorrowAave: OnboardingStep = {
  number: 6,
  title: 'Borrow Aave',
};

const mintNft: OnboardingStep = {
  number: 7,
  title: 'Mint NFT',
};
const steps: OnboardingStep[] = [
  {
    ...stepTermsAndConditions,
    nextStep: stepConnectWallet,
  }, {
    ...stepConnectWallet,
    previousStep: stepTermsAndConditions,
    nextStep: stepAddGasToWallet,
  }, {
    ...stepAddGasToWallet,
    previousStep: stepConnectWallet,
    nextStep: stepPerformSwap,
  }, {
    ...stepPerformSwap,
    previousStep: stepAddGasToWallet,
    nextStep: stepDepositAave,
  }, {
    ...stepDepositAave,
    previousStep: stepPerformSwap,
    nextStep: stepBorrowAave,
  }, {
    ...stepBorrowAave,
    previousStep: stepDepositAave,
    nextStep: mintNft,
  }, {
    ...mintNft,
    previousStep: stepBorrowAave,
  }
];
const initialState: OnboardingState = {
  steps,
  complete: false,
};

export const getOnboardingReducer = (
  state: OnboardingState = initialState,
  action: OnboardingActionTypes
): OnboardingState => {
  switch (action.type) {
    case SET_STEP:
      return {
        ...state,
        currentStep: action.payload.step,
      };
    default:
      return state;
  }
};
