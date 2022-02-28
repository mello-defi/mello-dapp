import { Widget } from '@maticnetwork/wallet-widget';
import { useEffect } from 'react';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import polygon from '_assets/images/logos/polygon.png';

const widget = new Widget({
  target: '#btnOpenWidget',
  appName: 'Mello',
  position: 'center',
  network: 'testnet'
});

export default function PolygonBridge() {
  // subscribe to event onLoad
  const load = () => {
    console.log('widget is loaded');
  };

  const close = () => {
    console.log('widget is closed');
  };

  useEffect(() => {
    widget.on('load', load);
    widget.on('close', close);
    widget.create();
  }, []);

  return (
    <div className={'bg-white rounded-2xl'}>
      <Button
        id="btnOpenWidget"
        className={'w-full'}
        variant={ButtonVariant.SECONDARY}
        size={ButtonSize.LARGE}
        onClick={() => {
          console.log('a');
        }}
      >
        <div className={'flex-row-center justify-center'}>
          <img src={polygon} alt={''} className={'mr-2'} height={30} width={30} />
          Begin Polygon transfer
        </div>
      </Button>
    </div>
  );
}
