import type { Server as SocketIOServer, Socket as SocketIO } from "socket.io";
import { REQUEST_STATUS } from "./constants";

export interface ServerToClientEvents {
    orderUpdate: (order: string[]) => void;
    activeRequest: (requestId?: string) => void;
    statusUpdate: (statuses: Record<string, REQUEST_STATUS>) => void;
};

export interface SocketData { };

export interface ClientToServerEvents {
    authenticate: (token: string, userId: string) => void;
};

export interface ServerToServerEvents {};

export type Socket = SocketIO<ClientToServerEvents, ServerToClientEvents, ServerToServerEvents, SocketData>;
export type Server = SocketIOServer<ClientToServerEvents, ServerToClientEvents, ServerToServerEvents, SocketData>;
