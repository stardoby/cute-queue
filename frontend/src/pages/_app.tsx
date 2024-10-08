import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import type { NextPage } from 'next'

import { roboto } from '@/utils/fonts'
import AuthProvider from '@/contexts/authContext'
import Layout from '@/components/layout'

// Some typescript shenanigans so App is strongly typed
// Now, pages can set `Page.appLayout` to be true to require auth + add layout
// See the dashboard page for an example 
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  appLayout?: boolean;
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${roboto.style.fontFamily}
        }
      `}</style>
      <AuthProvider>
        {
          /* If we're rendering the app layout, do it. */
          Component.appLayout ? 
            <Layout><Component {...pageProps}/></Layout> :
            <Component {...pageProps} />
        }
      </AuthProvider>
    </>
  )
}
