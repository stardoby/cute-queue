import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SigninResponse, UserProfile } from "oidc-client-ts";

import { hydrateAuthStatus, redirectToSignin, tryRefresh } from "@/utils/auth";

export interface IAuthContext {
  /**
  * @remark isAuthenticated returns true if we have an access token. If the
  * refresh token, the user is not _actually_ authenticated, but we won't know
  * that until we try to use it to get a new access token. Thus isAuthenticated
  * will erronously return true if the refresh token is expired. This won't
  * happen very frequently, but when it does, authenticated API requests will
  * fail and the user will be kicked back to the '/' landing page. 
  */
  isAuthenticated: boolean;
 
  /**
   * Set high when the AuthContext has fully hydrated.
   */
  ready: boolean;
  
  /**
  * @remark This is async because we'll usually need to exchange our refresh
  * token for fresh tokens.
  * 
  * @returns {Promise<string>} an access token to provide to the CQ API
  */
  getToken: () => Promise<string>;
  

  /**
  * @remark Only trust profile data if isAuthenticate returns true.
  */
  user: { userId?: string, username?: string, email?: string}

  /**
   * @remark Process an authenticate result.
   */
  receiveAuthResult: (authResult: SigninResponse) => void; 

  /**
  * @remark Don't access tokens directly here. Use getToken instead.
  * @remark expiry refers to the expiration time of the accessToken
  */
  _tokens: { accessToken?: string, refreshToken?: string, idToken?: string, expiry?: number}
  
  /**
   * @remark Don't access user profile data here. Use user instead.
   */
  _profile?: UserProfile
}

const AuthContext = createContext<IAuthContext>({
  isAuthenticated: false,
  _tokens: {},
  ready: false,
  user: {},
  async getToken() { return ""; },
  receiveAuthResult(_) {}
});

export default function AuthProvider({ children } : {children: React.ReactElement}) {
  const [isAuthenticated, setAuthenticated] = useState(false); 
  const [tokens, setTokens] = useState<IAuthContext["_tokens"]>({})
  const [user, setUser] = useState<IAuthContext["user"]>({})
  const [profile, setProfile] = useState<IAuthContext["_profile"]>();
  const [ready, setReady] = useState<IAuthContext["ready"]>(false);

  // Load auth state from local sotrage.
  useEffect(() => {
    const hydration = hydrateAuthStatus();

    setAuthenticated(hydration.isAuthenticated);
    setTokens(hydration._tokens);
    setProfile(hydration._profile);
    setUser(hydration.user);

    setReady(true);
  }, [])

  // Should be called on the auth redirect page to hydrate auth status
  // from the sign-in response
  const receiveAuthResult = useCallback((res: SigninResponse) => {
    setTokens({
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      idToken: res.id_token,
      expiry: res.expires_at // expiration time of access token
    });

    setUser({
      userId: res.profile.sub,
      username: res.profile["cognito:username"] as string,
      email: res.profile.email
    });

    setProfile(res.profile);

    setAuthenticated(true);
  }, []);

  // Called in data fetchers to retrieve an access token to call the API with
  const getToken = useCallback(async () => {
    // We don't have enough information to request a new access token or we're unauthed
    if (!isAuthenticated || !tokens.expiry || !tokens.accessToken || !tokens.refreshToken || !tokens.idToken || !profile ) {
      await redirectToSignin();
      return "unreachable"; // for the TS typechecker and testing
    }

    // The access token has expired. Try exchanging for a new one.
    if (Date.now() > tokens.expiry) {
      try {
        const authResult = await tryRefresh(tokens.refreshToken, tokens.idToken, profile);
        receiveAuthResult(authResult);
        
        return authResult.access_token;
      } catch (e) { // That didn't work - need to sign in from scratch.
        await redirectToSignin();
        return "unreachable"; // for the TS typechecker and testing
      }
    }

    // Otherwise, use the accessToken preserved in context
    return tokens.accessToken;
  }, [isAuthenticated, tokens, profile, user])

  const ctxValue: IAuthContext = {
    isAuthenticated,
    user,
    ready,
    _tokens: tokens,
    _profile: profile,
    receiveAuthResult,
    getToken,
  }

  return (
    <AuthContext.Provider value={ctxValue}>
      { children }
    </AuthContext.Provider>
  )
} 

// Wrap the context in a special hook for ease of use
export const useAuth = () => {
  return useContext(AuthContext);
}
