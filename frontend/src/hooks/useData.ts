import useSWR from "swr";

import { IAuthContext, useAuth } from "@/contexts/authContext";

/**
 * Tricky. In order to make a request to the backend, we need an auth token.
 * The auth token comes from the AuthContext: the `getToken` member. We don't
 * want to pass un-necessary parameters into the `path` parameter of useSWR,
 * so we need some way to access `getToken` inside the function body.
 *  
 * The SWR fetcher is an async function that returns the data, so this function
 * accepts a `getToken` function and returns a fetcher; this is called
 * "currying" https://javascript.info/currying-partials 
 * 
 * @param getTokenFunc 
 * @returns a fetcher that accepts a path to request data for
 */
export const makeFetcher = (getTokenFunc: IAuthContext["getToken"]) => async (path: string) => {
    // Get the token from the closure
    const token = await getTokenFunc();

    // Launch the request
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${path}`, {
        headers: {
            "Authorization": `Bearer ${token}` // attach the access token
        }
    });

    // res.ok is false if the status code in the response is not in the 200-299 range
    if (!res.ok) {
        throw new Error();
    }

    // All responses are json after this
    return res.json();
}

/**
 * Fetch data from the backend API at the specificed path 
 * @param path The HTTP endpoint to GET
 * @returns 
 */
export const useData = <T>(path: string | null) => {
    const auth = useAuth();
    
    // Also tricky: the auth system hydrates asynchronously;  we can only
    // fetch data from authenticated API endpoints if the system is "ready"
    // This is a conditional fetch: https://swr.vercel.app/docs/conditional-fetching
    // The `useSWR` hook calls this function repeatedly, and only invokes the
    // fetcher with the return value if it is "truthy" (i.e. not the empty string)
    const waitForAuthReady = () => {
        if (!auth.ready) return "";
        return path;
    }
   
    // Go get the data!
    return useSWR<T>(waitForAuthReady, makeFetcher(auth.getToken))
}
