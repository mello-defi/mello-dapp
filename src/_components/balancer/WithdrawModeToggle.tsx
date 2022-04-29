import { Switch } from '@headlessui/react';
import React from 'react';
import { WithdrawMode } from '_enums/balancer';

export default function WithdrawModeToggle({
  withdrawMode,
  setWithdrawMode
}: {
  withdrawMode: WithdrawMode;
  setWithdrawMode: (withdrawMode: WithdrawMode) => void;
}) {
  return (
    <Switch.Group>
      <div className={'flex-row-center text-color-dark my-2 px-4 justify-end'}>
        <Switch.Label className="mr-4">Withdraw to single token</Switch.Label>
        <Switch
          checked={withdrawMode === WithdrawMode.OneToken}
          onChange={(checked) =>
            setWithdrawMode(checked ? WithdrawMode.OneToken : WithdrawMode.AllTokens)
          }
          className={`${
            withdrawMode === WithdrawMode.OneToken ? 'bg-gray-700' : 'bg-gray-200'
          } relative inline-flex transition items-center h-6 rounded-full w-11`}
        >
          <span className="sr-only">Enable notifications</span>
          <span
            className={`${
              withdrawMode === WithdrawMode.OneToken ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-white rounded-full`}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
}
