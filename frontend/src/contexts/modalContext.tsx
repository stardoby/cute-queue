import React, { createContext, useState, useCallback, useEffect } from "react"; 

import noop from "@/utils/noop";
import { useQueue } from "@/hooks/useQueue";
import PostReflectModal from "@/components/postReflectModal";
import StudentBeforeRUModal from "@/components/studentBeforeRUModal";
import StudentTimeOutModal from "@/components/studentTimeOutModal";

export enum MODAL_TYPES {
    NONE, // do not use to close
    REFLECTION_FORM,
    LEFT,
    NEEDS_UPDATE,
    UPDATED,
    ADDED_TO_QUEUE,
};

export interface IModalContext {
    show(modal: MODAL_TYPES): void;
    close(): void;
};

export const ModalContext = createContext<IModalContext>({
    show: noop,
    close: noop,
});

export default function ModalProvider({ children }: { children: React.ReactElement}) {
    const [currentlyVisible, setCurrentlyVisible] = useState<MODAL_TYPES>(MODAL_TYPES.NONE);
    const queue = useQueue();

    const showFunc = useCallback((modal: MODAL_TYPES) => setCurrentlyVisible(modal), []);
    const closeFunc = useCallback(() => setCurrentlyVisible(MODAL_TYPES.NONE), []);

    useEffect(() => {
        if (queue.activeRequest && queue.status[queue.activeRequest] === "RESOLVED") {
            setCurrentlyVisible(MODAL_TYPES.REFLECTION_FORM);
        } else if (queue.activeRequest && queue.status[queue.activeRequest] === "LEFT") {
            setCurrentlyVisible(MODAL_TYPES.LEFT);
        } else if (queue.activeRequest && queue.status[queue.activeRequest] === "NEEDS_UPDATE") {
            setCurrentlyVisible(MODAL_TYPES.NEEDS_UPDATE);
        } else if (!queue.activeRequest) { // activeRequest is cleared when the request is CLOSED
            setCurrentlyVisible(MODAL_TYPES.NONE);
        }
    }, [queue.activeRequest, queue.status[queue.activeRequest || ""]]);


    const ctxValue = {
        show: showFunc,
        close: closeFunc
    };

    return (
        <ModalContext.Provider value={ctxValue}>
            <PostReflectModal open={currentlyVisible === MODAL_TYPES.REFLECTION_FORM} />
            <StudentTimeOutModal onClose={closeFunc} open={currentlyVisible === MODAL_TYPES.LEFT} />
            <StudentBeforeRUModal open={currentlyVisible === MODAL_TYPES.NEEDS_UPDATE} />
            {children}
        </ModalContext.Provider>
    )
};

