import { PoolToken } from '_interfaces/balancer';

export default function PoolTokenSymbols({ tokens }: { tokens: PoolToken[] }) {
  return (
    <div className={'space-x-1'}>
      {tokens.map((t: PoolToken) => {
        return (
          <span key={t.address} className={'rounded-xl text-body-smaller relative text-body-smaller bg-gray-200 px-2 py-1'}>
            {t.symbol}
            <span className="absolute bg-green-400 h-3 w-3 rounded-full -top-1 -right-1" />
          </span>
        );
      })}
    </div>
  );
}
