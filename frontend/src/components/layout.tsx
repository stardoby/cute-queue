import React, { useEffect } from "react";
import { useRouter } from "next/router";

import NavigationBar from "@/components/navigationBar";
import QueueProvider from "@/contexts/queueContext";
import ModalProvider from "@/contexts/modalContext";
import { useAuth } from "@/contexts/authContext";

/**
 * This layout component requires authentication; if the user is unauthenticated
 * when the layout is rendered, we will automatically push them to the landing
 * page so they can sign in.
 * 
 * Otherwise, it renders the navigation bar, and places its content inside a
 * <main> tag. Thus, Pages should return fragments (<>) or divs and not <main>s
 */
export default function Layout({ children } : { children : React.ReactElement }) {
    const auth = useAuth();
    const router = useRouter();
   
    // Wait for the AuthContext to be fully hydrated before assessing auth status
    useEffect(() => {
        if (auth.ready && !auth.isAuthenticated) {
            router.push("/");        
        }
    }, [auth.ready, auth.isAuthenticated]);

    // If we're unauthenticated, don't render anything while we wait for the
    // event loop to push the navigation event.
    return auth.isAuthenticated ? (
        <>
            <NavigationBar/>
            <main>
                <QueueProvider>
                    <ModalProvider>
                        {children}
                    </ModalProvider>
                </QueueProvider>
            </main>
        </>
    ) : null;
}
