import QueueDisconnected from "@/components/queueDisconnected";
import QueueWaiting from "@/components/queueWaiting";
import QueueOpen from "./queueOpen";
import QueueJail from "./queueJail";
import QueueNextUp from "./queueNextUp";
import QueueServing from "./queueServing";
import QueueLeft from "./queueLeft";

import { useCourseId } from "@/hooks/useCourseId";
import { useQueue } from "@/hooks/useQueue";
import QueueResolved from "./queueResolved";


export default function QueueVisual({ isHelper = false } : {isHelper?: boolean}) {
    // Get Course ID:
    const courseId = useCourseId();

    // Get Queue and Current Request info:
    const queue = useQueue();

    const requestId = queue.activeRequest;
    const status = requestId ? queue.status[requestId] : null;

    // Get length and position
    const queueLength = queue.order?.length ?? 0;
    const queuePosition = queue.position;
    
    if (!queue.ready) {
        return <div className="flex items-center justify-center w-fit h-full m-auto"><QueueDisconnected/></div>
    };
    
    // Request is actively being served
    if (requestId && status === "SERVING") {
        return <div><QueueServing /></div>;
    }

    if (requestId && status === "NEEDS_UPDATE") {
        return <div><QueueJail /></div>
    }

    if (requestId && status === "LEFT") {
        return <div><QueueLeft/></div>
    }

    if (requestId && status === "RESOLVED") {
        return <div><QueueResolved/></div>
    }

    // Next in (either solely by positioning or because request was updated)
    if (requestId && (queuePosition == 0 || status === "UPDATED")) {
        return <div><QueueNextUp /></div>
    }

    // Request is pending
    if (requestId && (status === "PENDING" || status === "IN_REVIEW")) {
        return <div><QueueWaiting position={1 + queuePosition} requestId={requestId} timeEntered={"12:30PM"}/></div>;
    }
    
    // No current request
    if (queueLength >= 0 && !requestId) {
        return <div><QueueOpen isHelper={isHelper} length={queueLength} courseID={courseId}/></div>;
    }

    // Fallback disconnected state
    return <div className="flex items-center justify-center w-fit h-full m-auto"><QueueDisconnected/></div>;
}