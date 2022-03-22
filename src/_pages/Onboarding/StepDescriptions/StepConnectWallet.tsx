import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepConnectWallet() {
  const whatIsRequired = (
    <>
      Connect your non-custodial wallet to mello
      <br />
      Don&apos;t have a wallet? No problem, follow the links to one of our how-to guides:
      <br />
      <ul>
        <li>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://docs.mellodefi.com/resources/how-to-guides/wallet-setup-and-use-social-login"
          >
            Social Login - How to sign up
          </a>
        </li>
        <li>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://docs.mellodefi.com/resources/how-to-guides/wallet-setup-and-use-metamask"
          >
            Metamask - How to sign up
          </a>
        </li>
        <li>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://docs.mellodefi.com/resources/how-to-guides/wallet-use-walletconnect"
          >
            WalletConnect - How to sign up
          </a>
        </li>
      </ul>
    </>
  );

  const whyIsRequired = (
    <>A wallet is required to interact with the blockchain and access your assets</>
  );

  const notes = (
    <>Store seed phrases and passwords securely, mello will never be able to access them!</>
  );

  return (
    <OnboardingStepDescription
      whatIsRequired={whatIsRequired}
      whyIsRequired={whyIsRequired}
      notes={notes}
    />
  );
}
