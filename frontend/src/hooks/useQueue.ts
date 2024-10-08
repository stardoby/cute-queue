import { useContext } from "react"

import { QueueContext } from "@/contexts/queueContext";

export const useQueue = () => {
    return useContext(QueueContext);
};
