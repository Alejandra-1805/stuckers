'use client';
import {PrivyProvider} from '@privy-io/react-auth';

export default function Providers({children}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        loginMethods: ['twitter'],
        appearance: {
          theme: 'dark',
          accentColor: '#ff8a00',
          logo: '/stuckers-logo.png',
          showWalletLoginFirst: false
        },
        embeddedWallets: {createOnLogin: 'off'}
      }}
    >{children}</PrivyProvider>
  );
}
