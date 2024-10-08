import { useCallback } from 'react';
import Head from 'next/head';

import Button from '@/components/button';
import { sanchez } from '@/utils/fonts';
import { redirectToRegister, redirectToSignin } from '@/utils/auth';

import Logo from '@/icons/logo-outline.svg';

export default function Home() {
  const signInClick = useCallback(() => { redirectToSignin(); }, [])
  const registerClick = useCallback(() => { redirectToRegister(); }, []);

  return (
    <>
      <Head><title>CuteQueue</title></Head>
      <main className={`flex min-h-screen justify-center items-center bg-gradient-to-b from-queuegreen to-emerald-400`}>
        <div className="flex h-min">
          <Logo className="mx-7" alt="cutequeue clouds logo" height={130} color="white" />
          <div>
            <h1 className={`text-white text-6xl m-4 ${sanchez.className}`}>CuteQueue</h1>
            <div className={`${sanchez.className} mx-7 text-white/80 tracking-wide font-normal`}>Enhancing Visual Design | Scaffolding Requests | Improving Student Self-Efficacy</div>
            <div className={`flex flex-row gap-4 m-6`}>
              <Button onClick={signInClick} label='Sign in' type="primaryOutlined" />
              <Button onClick={registerClick} label='Register' type="secondaryOutlined" />
            </div>
          </div>
        </div>
      </main>
      <div className='flex flex-row gap-5 absolute bottom-5 left-5 text-queuegreen/90 text-lg'>
      <a href="https://docs.google.com/presentation/d/1wWnUe7pxTzZl18-CxBpTbUG8WDGjDiqc8m2u-uESp8k/edit?usp=sharing">About Us</a>
      </div>
      
    </>
  )
}
