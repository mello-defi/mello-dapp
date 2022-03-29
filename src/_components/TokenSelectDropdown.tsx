import { EvmTokenDefinition } from '_enums/tokens';
import React, { useEffect, useState } from 'react';
import { DefaultTransition } from '_components/core/Transition';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { Check, ExpandLess, ExpandMore } from '@mui/icons-material';

export default function TokenSelectDropdown({
  selectedToken,
  onSelectToken,
  disabled,
  tokenFilter,
}: {
  selectedToken?: EvmTokenDefinition;
  onSelectToken: (token: EvmTokenDefinition) => void;
  disabled: boolean;
  tokenFilter?: (token: EvmTokenDefinition) => boolean;
}) {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tokenList, setTokenList] = useState<EvmTokenDefinition[]>();
  useEffect(() => {
    if (tokenSet) {
      const list = Object.values(tokenSet);
      if (tokenFilter) {
        setTokenList(list.filter(tokenFilter));
      } else {
        setTokenList(list);
      }
    }
  }, [tokenSet, tokenFilter]);
  return (
    <div className="w-full my-2 sm:my-1">
      <div className="mt-1 relative">
        <button
          type="button"
          onClick={() => {
            !disabled && setDropdownOpen(!dropdownOpen);
          }}
          className="cursor-pointer w-full bg-white rounded-2xl shadow-sm pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
        >
          {selectedToken ? (
            <span className="flex items-center">
              <img
                src={selectedToken.image}
                alt="person"
                className="flex-shrink-0 h-6 w-6 rounded-full"
              />
              <span className="ml-3 block truncate">{selectedToken.symbol}</span>
            </span>
          ) : (
            <div>Select token</div>
          )}
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            {dropdownOpen ? (
              <ExpandLess className="-mr-1 ml-2 h-5 w-5" />
            ) : (
              <ExpandMore className="-mr-1 ml-2 h-5 w-5" />
            )}
          </span>
        </button>
        <DefaultTransition isOpen={dropdownOpen}>
          <div className="absolute mt-1 w-full z-10 rounded-2xl bg-white shadow-lg">
            <ul
              tabIndex={-1}
              role="listbox"
              aria-labelledby="listbox-label"
              aria-activedescendant="listbox-item-3"
              className="max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            >
              {tokenList && tokenList.map((token: EvmTokenDefinition) => {
                return (
                  <li
                    key={token.symbol}
                    onClick={() => {
                      onSelectToken(token);
                      setDropdownOpen(false);
                    }}
                    role="option"
                    className="text-gray-900 cursor-pointer hover:bg-gray-300 hover:text-white select-none relative py-3 pl-3 pr-4"
                  >
                    <div className="flex flex-col">
                      <div className={'flex-row-center justify-between w-full'}>
                        <div className={'flex-row-center'}>
                          <img
                            src={token.image}
                            alt={token.name}
                            className="flex-shrink-0 h-8 w-8 rounded-full"
                          />
                          <div className={'flex flex-col ml-3 block font-normal truncate'}>
                            <span className="">{token.symbol}</span>
                            <span className={'text-color-light text-xs'}>{token.name}</span>
                          </div>
                        </div>
                        {token.address === selectedToken?.address && <Check className="h-5 w-5" />}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </DefaultTransition>
      </div>
    </div>
  );
}
