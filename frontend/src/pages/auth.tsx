import { useRouter } from "next/router";
import { useEffect } from "react"
import Head from "next/head";

import { useAuth } from "@/contexts/authContext";
import { processSigninResponse } from "@/utils/auth";

import Spinner from "@/icons/spinner.svg";

export default function AuthCallback() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    // These lines make sure we only process the code/state pairing exactly
    // once. Once this effect runs, we strip the data away so future exceutions
    // of this effect don't cause multiple token exchange requests
    const url = new URL(window.location.href);
    if (!url.searchParams.get("code")) {
      return;
    }

    const original = new URL(url);
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState({}, "", url);

    const processAuth = async () => {
      try {
        const user = await processSigninResponse(original);
        auth.receiveAuthResult(user);
      } catch {
        router.replace('/');
      } finally {
        // Redirect user to the dashboard, which is the first auth'ed screen
        // If the auth didn't work out, this'll just kick people back to the
        // lalnding page to restart the auth flow from the top
        router.replace('/dashboard');
      }
    }

    // processAuth is async but we don't await it because React
    processAuth();
  }, []);

  // Render a loader while we're waiting
  return (
    <>
      <Head><title>Logging you in...</title></Head>
      <main className="grid h-screen place-items-center">
        <Spinner height="40" width="40" className="animate-spin" alt="Loading"/>
      </main>
    </>
  );
}
