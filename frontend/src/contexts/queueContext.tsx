import React, { useState, createContext, useEffect } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/contexts/authContext";
import { socket } from "@/api/socket";
import noop from "@/utils/noop";

interface IQueueContext {
    isConnected: boolean;
    ready: boolean;
    order?: string[];
    activeRequest: string | null;
    status: Record<string, string>; 
    position: number;
}

export const QueueContext = createContext<IQueueContext>({
    isConnected: false,
    ready: false,
    activeRequest: null,
    status: {},
    position: -1,
});

export default function QueueProvider({ children }: { children: React.ReactElement }) {
    const [order, setOrder] = useState<IQueueContext["order"]>();
    const [isConnected, setConnected] = useState<IQueueContext["isConnected"]>(false);
    const [activeRequest, setActiveRequest] = useState<IQueueContext["activeRequest"]>(null);
    const [ready, setReady] = useState<IQueueContext["ready"]>(false);
    const [position, setPosition] = useState<IQueueContext["position"]>(-1);
    const [status, setStatus] = useState<IQueueContext["status"]>({});
    const [token, setToken] = useState<string | null>(null);

    const router = useRouter();
    const auth = useAuth();

    const courseId = router.query.courseId;

    useEffect(() => {
        socket.connect();

        return () => {
            socket.disconnect();
        }
    }, [])

    // Fetch the auth token
    useEffect(() => {
        if (!auth.ready) return noop;

        auth.getToken().then(setToken);
    }, [auth.ready]) 

    // Recompute position when new order status comes in
    useEffect(() => {
        if (activeRequest) {
            if (status[activeRequest] === "PENDING") {
                const pendingRequests = order?.filter(x => status[x] === "PENDING" || status[x] === "IN_REVIEW") ?? [];
                const index = pendingRequests.indexOf(activeRequest);
                setPosition(index);
            } else if (status[activeRequest] === "IN_REVIEW") {
                setPosition(0); // next-in
            } else if (status[activeRequest] === "LEFT") {
                setPosition(-1);
            } else if (status[activeRequest] === "UPDATED") {
                setPosition(0); // next-in
            }
        } else {
            setPosition(-1);
        }
    }, [ order, activeRequest, status ]);

    // Wire-up event handlers
    useEffect(() => {
        const onConnect = () => { setConnected(true); };
        const onDisconnect = () => { setConnected(false); };
        const onOrderUpdate = (order: string[]) => { setOrder(order); };
        const onStatusUpdate = (newStatus: Record<string, string>) => { 
            setStatus((oldStatus) => {
                Object.entries(newStatus).forEach(([id, status]) => {
                    oldStatus[id] = status;
                });
                return oldStatus;
            });
        }
        const onActiveRequest = (requestId: string) => { setReady(true); setActiveRequest(requestId === "" ? null : requestId); };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("orderUpdate", onOrderUpdate);
        socket.on("statusUpdate", onStatusUpdate);
        socket.on("activeRequest", onActiveRequest);
        
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("orderUpdate", onOrderUpdate);
            socket.off("statusUpdate", onStatusUpdate);
            socket.off("activeRequest", onActiveRequest);
        }
    }, []);

    // When we switch course pages, we need to clear out current state
    useEffect(() => {
        setActiveRequest(null);
        setStatus({});
        setReady(false);
        setOrder(undefined);
    }, [ courseId ])

    // Send handshake message when connected and inside a course
    useEffect(() => {
        if (isConnected && token && typeof courseId === 'string') {
            socket.emit("authenticate", token, courseId);
        }
    }, [isConnected, token, courseId]);


    const value: IQueueContext = {
        isConnected,
        ready,
        order,
        activeRequest,
        position,
        status,
    };

    return <QueueContext.Provider value={value}>
        { children }
    </QueueContext.Provider>
};
