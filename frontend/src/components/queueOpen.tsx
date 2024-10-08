import Button from "@/components/button"
import { ulid } from 'ulid'
import { NextRouter, useRouter } from "next/router";
import Logo from "@/icons/logo-outline.svg"


type queueOpenProps = {
    isHelper: boolean,
    length: number,
    courseID: string | string[] | undefined
}

function joinQueue(courseID : string | string[] | undefined, router : NextRouter) {
    const id = ulid();
    const requesthref = `/courses/${courseID}/request/${id}/edit`;
    router.push({
        pathname: requesthref,
        query: { update: false }
    }, requesthref);
}


export default function QueueOpen({isHelper, length, courseID} : queueOpenProps) {
    const queueVis = "h-24 w-full"
    const flex = "flex flex-col gap-3"
    const queueStatusFont = "text-xl font-medium text-black text-center"
    const router = useRouter();

    const getQueueText = (length: number) => {
        if (length === 0) {
            return "The queue is empty!"
        } else if (length === 1) {
            return "There is currently 1 student in the queue."
        } else {
            return `There are currently ${length} students in the queue.`
        }
    }

    return (
        <div className={`${flex}`}>
            <div className={`${queueVis} flex order-1 items-center justify-center`}>
                <Logo className="fill-slate-100" height={"72"} />
            </div>
            <div className="order-2">
                <div className={`${queueStatusFont}`}>
                    {getQueueText(length)}
                </div>
            </div>
            {!isHelper && <div className="flex order-3 items-center justify-center">
                    <Button label="Join Queue" onClick={() => joinQueue(courseID, router)} />
            </div> }
        </div>
    )
}