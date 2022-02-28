import { Transition } from '@headlessui/react';
import { Fragment } from 'react';

export function DefaultTransition({ children, isOpen }: { children: any; isOpen: boolean }) {
  return (
    <Transition
      show={isOpen}
      as={Fragment}
      // enter="transition ease-out duration-100"
      // enterFrom="transform opacity-0 scale-95"
      // enterTo="transform opacity-100 scale-100"
      // leave="transition ease-in duration-75"
      // leaveFrom="transform opacity-100 scale-100"
      // leaveTo="transform opacity-0 scale-95"
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-1"
    >
      {children}
    </Transition>
  );
}
