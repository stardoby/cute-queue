import assert from "node:assert";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import type { Request, Response, NextFunction } from "express";

assert(typeof process.env.COGNITO_USER_POOL_ID !== "undefined");
assert(typeof process.env.COGNITO_CLIENT_ID !== "undefined");

const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.COGNITO_CLIENT_ID,
});

/**
 * Strips the "Bearer " text from the authorization header 
 * @param header Full authorization header
 * @returns access token in authorization header, or empty string
 */
const stripBearer = (header: string) => header.replaceAll(/Bearer /gi, "");

export interface AuthorizedRequest extends Request {
    userId: string;
    username: string;
}

export const authMiddleware = async (expressReq: Request, res: Response, next: NextFunction) => {
    try {
        // Authorization header format is Authorization: Bearer <accessToken>
        const token = stripBearer(expressReq.header("authorization") || "");
        const decoded = await jwtVerifier.verify(token);
       
        // Some typescript shenangians so userId is strongly typed
        const authorizedReq = expressReq as AuthorizedRequest;
        authorizedReq.userId = decoded.sub;
        authorizedReq.username = decoded.username;
        next();
    } catch (e) {
        // Authentication failure: send empty 401 response
        res.statusCode = 401;
        res.send();
    }
}

export const socketProcessToken = async (token: string): Promise<string | null> =>  {
    try {
        const decoded = await jwtVerifier.verify(token);
        return decoded.sub;
    } catch (e) {
        return null;
    }
}

/**
 * "Decorate" authenticated api handlers with this wrapper
 * So req.userId is strongly typed in handlers
 *  
 * @example app.get('/authed', withAuth((req, res) => { res.send(req.userId); }));
 * 
 * @param handler Route handler with authentication
 * @returns Route handler with a weaker `req` type, for TS reasons
 */
export const withAuth = (handler: (authReq: AuthorizedRequest, res: Response) => void | Promise<void>) => {
    return (req: Request, res: Response) => handler(req as AuthorizedRequest, res);
}
