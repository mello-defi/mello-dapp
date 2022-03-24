import { TokenDefinition } from '_enums/tokens';
import { PoolToken } from '_interfaces/balancer';
import { findTokenByAddress } from '_utils/index';
import { AppState } from '_redux/store';
import { useSelector } from 'react-redux';

export default function PoolTokenIcons({ tokens }: { tokens: PoolToken[] }) {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  return (
    <div className={'flex-row-center md:-space-x-3 -space-x-4'}>
      {tokens.map((t: PoolToken) => {
        return (
          <span
            key={t.address}
            className={'relative z-30 inline object-cover rounded-full border-white border-2'}
          >
            <img
              className={'h-6 w-6'}
              alt={t.address}
              src={findTokenByAddress(tokenSet, t.address).image}
            />
          </span>
        );
      })}
    </div>
  );
}
