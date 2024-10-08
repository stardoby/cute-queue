import CloudInJail from "@/icons/cloud-in-jail.svg"
import React, { useCallback } from "react";
import Button from "@/components/button";

import { useRouter } from "next/router";
import { useQueue } from "@/hooks/useQueue";
import { useCourseId } from "@/hooks/useCourseId";

export default function QueueJail() {
    const queueVis = "h-24 w-full"
    const flex = "flex flex-col gap-3"
    const queueStatusFont = "text-xl font-medium text-gray-500 text-center"
    const smallFont = "text-medium font-regular text-gray-500 text-center"
    const { activeRequest } = useQueue();
    const router = useRouter();
    const courseId = useCourseId() as string; 

    const handleEditClick = useCallback(() => {
        if (activeRequest) {
          router.push(`/courses/${courseId}/request/${activeRequest}/view/student`);
        }
    }, [router, activeRequest, courseId]);

    return (
        <div className={`${flex}`}>
            <div className={`${queueVis} flex items-center justify-center`}>
                <CloudInJail alt="Cloud behind bars" height={"72"} />
            </div>
            <div className="flex-end">
                <div className={`${queueStatusFont}`}>
                    Your request needs to be updated.
                </div>
                <div className={`${smallFont}`}>
                    You will be added to the top of the queue once you're done.
                </div>
            </div>
            <div className="flex order-3 items-center justify-center">
                <Button onClick={handleEditClick} label="Update Request" type="warning" />
            </div>
        </div>
    )
}