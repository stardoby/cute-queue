import RequestHistoryItem from "./requestHistoryItem";
import {useData} from "@/hooks/useData";
import { useCourseId } from "@/hooks/useCourseId";
import { sanchez } from "@/utils/fonts";
import { GetRequestAPIResponse, GetRequestHistoryAPIResponse } from "@/types/apiResponses";
import Spinner from "@/icons/spinner.svg";
import { useQueue } from "@/hooks/useQueue";
import CommentsList from "./commentsList";
import { useRequestId } from "@/hooks/useRequestId";


export default function RequestHistoryItemList() {
    const courseId = useCourseId()
    const { activeRequest } = useQueue()
    const {data, error, isLoading} = useData<GetRequestHistoryAPIResponse>(`/courses/${courseId}/history`);

    if (!data || error || isLoading) {
        return (
            <Spinner className="animate-spin h-8 w-8 text-queuegreen"></Spinner>
        )
    }

    const pastRequests = data.requests.filter((request) => request.requestId !== activeRequest);
    return (
        <div className="w-3/4">
            <h1 className={`self-start px-2 ${sanchez.className} text-3xl font-medium`}>Past Requests</h1>
            <div className="">
            {pastRequests.map((r) => {
                return (
                    <RequestHistoryItem assignment={r.assignment} 
                                        problem={r.problem} 
                                        requestTitle={r.shortDescription}
                                        requestDescription={r.resolution}
                                        requestURL={`/courses/${courseId}/request/${r.requestId}/view/student`}
                                        requestId={r.requestId}
                                        key={r.requestId}/>
                )
                })}
            {
                data.requests.length === 0 ? <h2 className="p-2 text-neutral-700 italic" >Join the queue to see your current and past requests here</h2> : null
            }
            </div>
        </div>
       
    )

    
}