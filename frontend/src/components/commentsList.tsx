import { useData } from "@/hooks/useData"
import { parseDate } from "./queueWaiting"
import { GetRequestAPIResponse } from "@/types/apiResponses"
import Spinner from "@/icons/spinner.svg";
import AddComment from "./addComment";

type CommentsListProps = {
    appendable?: boolean,
    comments: {createdAt: string,
               text: string}[] | undefined
}


export default function CommentsList({appendable = false, comments} : CommentsListProps) {
    const box = 'rounded bg-neutral-100 w-full h-fit border-1 py-1 px-2'
    const text = 'text-lg font-thin text-left whitespace-normal'

    console.log(appendable)
    // If not in request view and we don't have comments.
    // if (!inRequestView && comments !== undefined) {
    //     const commentTime = comments[CommentsList.length - 1].createdAt
    //     return (
    //         <div className={`${box} ${text}`}>
    //             <span className="font-semibold">{parseDate(commentTime)}:</span>
    //         </div>
    //     )
    // } else
    
    
    // if (typeof comments !== 'undefined') {  // If we're in the request, display all comments.
        return (
            <>
                {comments?.map((c, i) => {
                    return (
                        <div style={{wordWrap: "anywhere"} as any} key={i} className={`${box} ${text}`}>
                            <span className="font-semibold">{parseDate(c.createdAt)}: </span>
                            {c.text}
                        </div>
                    )
                })}
                { appendable && <AddComment/> }
            </>
        )
    // } else {
    //     return null
    // }
}