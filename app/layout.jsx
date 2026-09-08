import './globals.css';
import './upgrade.css';
import Providers from './providers';

export const metadata = {
  title: 'Stuckers — Buy high. Sell low. Together.',
  description: 'The social network for legendary bad trades and professional bagholders.'
};

export default function RootLayout({children}) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
