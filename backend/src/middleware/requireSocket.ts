import { NextFunction, Request, Response } from "express";
import { Server } from "../types";
import { AuthorizedRequest } from "./requireAuth";

export interface SocketAuthorizedRequest extends AuthorizedRequest {
    io: Server 
}

export const socketMiddleware = (io : Server) => (expressReq: Request, res: Response, next: NextFunction) => {
    const socketRequest = expressReq as SocketAuthorizedRequest;
    socketRequest.io = io;
    next();
}

export const withSocket = (handler: (req: SocketAuthorizedRequest, res: Response) => void | Promise<void>) => {
    return (expressReq: Request, res: Response) => handler(expressReq as SocketAuthorizedRequest, res);
}
