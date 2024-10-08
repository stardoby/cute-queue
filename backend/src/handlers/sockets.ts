import type { Socket } from "../types" 

import * as courseService from "../services/courseService";
import * as requestService from "../services/requestService";
import { socketProcessToken } from "../middleware/requireAuth";

export const handleHandshake = (socket: Socket) => async (token: string, courseId: string) => {
    const userId = await socketProcessToken(token);
    if (!userId) return;

    try {
        socket.join(courseId);
        socket.join(userId);

        const [courseOrder, requestStatuses, activeRequest] = await Promise.all([
            courseService.getCourseQueueOrder(courseId),
            courseService.getRequestStatuses(courseId),
            requestService.getActiveRequestIdForUser(userId, courseId)
        ]);

        if (!courseOrder) return;
        socket.emit("orderUpdate", courseOrder.order);
        socket.emit("statusUpdate", requestStatuses);
        socket.emit("activeRequest", activeRequest?.requestId);
    } catch (e) {
        console.error(e);
    }
}

export default function handleConnection(socket: Socket) {
    socket.on("authenticate", handleHandshake(socket));
}
