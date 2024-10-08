import RequestHistoryItem from "./requestHistoryItem";
import { useData } from "@/hooks/useData";
import { useQueue } from "@/hooks/useQueue";
import { useCourseId } from "@/hooks/useCourseId";
import { sanchez } from "@/utils/fonts";
import { GetRequestHistoryAPIResponse } from "@/types/apiResponses";


export default function CurrentRequestSummary() {
    const courseId = useCourseId();
    const { activeRequest } = useQueue();

    const {data, error, isLoading} = useData<GetRequestHistoryAPIResponse>(`/courses/${courseId}/history`);
    if (!data || error || isLoading) {
        return null; // Don't need two spinners
    }

    const currentRequest = data.requests.filter((request) => request.requestId === activeRequest);
    if (currentRequest.length !== 1) {
        return null;
    }


    return (
        <div className="w-3/4">
            <h1 className={`self-start px-2 ${sanchez.className} text-3xl font-medium`}>Current Request</h1>
            <div className="">
            <RequestHistoryItem assignment={currentRequest[0].assignment}
                                problem={currentRequest[0].problem}
                                requestTitle={currentRequest[0].shortDescription}
                                requestURL={`/courses/${courseId}/request/${currentRequest[0].requestId}/view/student`}
                                requestId={currentRequest[0].requestId}
                                showComments
                                comments={currentRequest[0].comments}
                                key={currentRequest[0].requestId}/>
            </div>
        </div>
       
    )

    
}