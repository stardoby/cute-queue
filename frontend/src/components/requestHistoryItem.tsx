import { useCourseId } from "@/hooks/useCourseId"
import { useRequestId } from "@/hooks/useRequestId"
import Link from "next/link"
import CommentsList from "./commentsList"
import AddComment from "./addComment"


type requestHistoryItemProps = {
    assignment: string
    problem: string
    requestTitle: string
    requestDescription?: string
    requestURL: string
    requestId: string
    showComments?: boolean
    comments?: {createdAt: string,
                   text: string}[] | undefined 
}

export default function RequestHistoryItem ({assignment, problem, 
                                            requestTitle, requestDescription, requestURL, requestId, showComments = false, comments = []} : requestHistoryItemProps) {

    // Defines requestHistoryItem's box.
    const box = 'rounded-lg m-3 h-fit w-full border-queuegreen border-2 p-4';
    const hover = 'hover:bg-neutral-100';
    const flex = 'flex flex-col items-start gap-3';
    const ring = 'focus:outline-none focus:ring-2 focus:ring-offset-2';
    const boxOptions = `${box} ${flex} ${ring}`;
    
    // Defines assignment and problem boxes.
    const tagBox = 'rounded-lg bg-zinc-300 w-fit h-hit p-1 mr-2';
    const tagFont = 'text-sm text-center text-black';
    const tagOptions = `${tagBox} ${tagFont}`;

    // Defines the fonts within the box.
    const titleFont = 'font-medium text-2xl text-black text-left'
    const descriptionFont = 'text-lg font-thin text-neutral-500 text-left line-clamp-2 text-ellipsis'

    // Defines the details tab
    const details = `self-end font-bold text-xl text-queuegreen`

    return (
        <div className={`${boxOptions} inline-block`}>
            <div className="flex order-1">
                <div className={tagOptions}>{assignment}</div>
                <div className={tagOptions}>{problem}</div>
            </div>
            <div className={`${titleFont} order-2`}>{requestTitle}</div>
            <div className={`${descriptionFont} order-3`}>{requestDescription}</div>
            <Link href={requestURL} className={`${details} order-4`}>Details </Link>
            { showComments && (
                <div className={`order-5 flex flex-col gap-2 w-full`}>
                    <CommentsList appendable={true} comments={comments}/>
                </div> 
            )
            }

        </div>
    )


    
}