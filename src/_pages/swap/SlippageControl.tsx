import { useState } from 'react';
import { DefaultTransition } from '_components/core/Transition';
import SettingsIcon from '@mui/icons-material/Settings';

export default function SlippageControl({slippage}: {slippage: number}){
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className={"w-full bg-gray-100 p-2 rounded-2xl my-2"}>
        <SettingsIcon className={"mr-2 text-color-light"}/>
      </div>
      <DefaultTransition isOpen={isOpen}>
        <div className={"w-full bg-gray-100 p-2 rounded-2xl my-2"}>
          {slippage}
        </div>
      </DefaultTransition>
    </>
  )

}
