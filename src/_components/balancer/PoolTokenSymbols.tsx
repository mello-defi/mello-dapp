import { PoolToken } from '_interfaces/balancer';
import useWalletBalances from '_hooks/useWalletBalances';
import { CryptoCurrencySymbol } from '_enums/currency';

export default function PoolTokenSymbols({ tokens }: { tokens: PoolToken[] }) {
  const walletBalances = useWalletBalances();

  const userBalanceIsNotZero = (token: PoolToken) => {
    const balance = walletBalances[token.symbol as CryptoCurrencySymbol];
    return balance && balance.balance.gt(0);
  };
  return (
    <div className={'space-x-1'}>
      {tokens.map((t: PoolToken) => {
        return (
          <span
            key={t.address}
            className={
              'rounded-xl text-body-smaller relative text-body-smaller bg-gray-200 px-2 py-1'
            }
          >
            {t.symbol}
            {userBalanceIsNotZero(t) && (
              <span className="absolute bg-green-400 h-3 w-3 rounded-full -top-1 -right-1" />
            )}
          </span>
        );
      })}
    </div>
  );
}
