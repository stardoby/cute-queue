import { OidcClient, SigninResponse, UserProfile } from "oidc-client-ts";

// this singleton stores basic auth data for the oidc-client-ts library 
const client = new OidcClient({
  authority: process.env.NEXT_PUBLIC_AUTH_DOMAIN || '',
  client_id: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || '',
  client_secret: process.env.NEXT_PUBLIC_AUTH_CLIENT_SECRET,
  redirect_uri: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI || '',
  scope: 'email openid',
  metadataUrl: process.env.NEXT_PUBLIC_AUTH_METADATA_URL,
});

/**
* Generates a URL that we can redirect to and kick off the auth flow
* This is async because it queries the authority for some metadata
* And does some crypto to for code verification / PKCE
* 
* @returns the `oauth2/authorize` URL for the AuthCode + PKCE flow
*/
const generateAuthUrl = async () => {
  return (await client.createSigninRequest({})).url;
}

/**
* We've received a new authorization, so save this to local storage
* @param res The signin response from processSigninResponse or useRefreshToken
*/
const commitToLocalStorage = (res: SigninResponse) => {
  globalThis.localStorage.setItem("isAuthenticated", "true");
  globalThis.localStorage.setItem("user", JSON.stringify({
    userId: res.profile.sub,
    username: res.profile["cognito:username"] as string,
    email: res.profile.email
  }));
  globalThis.localStorage.setItem("_profile", JSON.stringify(res.profile));
  globalThis.localStorage.setItem("_tokens", JSON.stringify({
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
    idToken: res.id_token,
    expiry: res.expires_at
  }));
}

/**
* Redirects directly to a sign in page.
* Sets `window.location.href` so this function never technically terminates
*/
export const redirectToSignin = async () => {
  const url = await generateAuthUrl();
  window.location.href = url.replaceAll("oauth2/authorize", "login");
}

/**
* Redirects directly to a registration page.
* Sets `window.location.href` so this function never technically terminates
*/
export const redirectToRegister = async () => {
  const url = await generateAuthUrl();
  window.location.href = url.replaceAll("oauth2/authorize", "signup")
}

/**
* When the auth flow kicks us back to our app, exchange the authorization
* code for tokens and user profile info.
*  
* @returns the sign in response, to be consumed by the AuthContext and
* committed to localStorage with commitToLocalStorage
*/
export const processSigninResponse = async (original: URL) => {
  const res = await client.processSigninResponse(original.toString());
  commitToLocalStorage(res);
  return res;
}

/**
* Retrieve auth info from local storage. 
* @returns basically, the data fields of an IAuthContext so the AuthContext
* can pick up in the case of a hard refresh.
*/
export const hydrateAuthStatus = () => {
  return {
    isAuthenticated: globalThis.localStorage.getItem("isAuthenticated") ? true : false,
    user: JSON.parse(globalThis.localStorage.getItem("user") ?? "{}"),
    _tokens: JSON.parse(globalThis.localStorage.getItem("_tokens") ?? "{}"),
    _profile: JSON.parse(globalThis.localStorage.getItem("_profile") ?? "{}")
  }
}

/**
* Attempt exchanging a refresh token for new access/id tokens if they are 
* expired. 
*  
* @param refreshToken
* @param idToken 
* @param profile 
* @returns sign in response, commited to local storage. Needs to be consumed
* by the AuthContext to establish this session
*/
export const tryRefresh = async (refreshToken: string, idToken: string, profile: UserProfile) => {
  const res = await client.useRefreshToken({
    state: {
      refresh_token: refreshToken,
      id_token: idToken,
      profile,
      data: undefined,
      session_state: null,
    }
  });
  res.refresh_token = refreshToken;
  commitToLocalStorage(res);
  return res;
}
