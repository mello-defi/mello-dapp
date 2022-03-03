import { Twitter } from '@mui/icons-material';

export default function Footer() {
  return (
    <footer className={'border-t-2 border-gray-100 bg-white'}>
      <div className={'flex-row-center justify-between max-w-5xl mx-auto py-4 px-2'}>
        <div className={'flex flex-row text-color-light'}>
          <span className={'mr-2'}>© {new Date().getFullYear()} Mello. All rights reserved.</span>
          <Twitter className={"h-5"} />
        </div>
      </div>
    </footer>
  );
}
