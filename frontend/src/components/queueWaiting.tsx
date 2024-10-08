import Logo from "@/icons/logo-outline.svg"
import Button from "./button"
import { useAuth } from "@/contexts/authContext"
import * as api from "@/api";
import { useCourseId } from "@/hooks/useCourseId";
import { useData } from "@/hooks/useData";
import { GetRequestAPIResponse, GetRequestHistoryAPIResponse } from "@/types/apiResponses";
import Spinner from "@/icons/spinner.svg";
import parseISO from "date-fns/parseISO";
import format from "date-fns/format";
import { useSWRConfig } from "swr";


type queueWaitingProps = {
    position: number,
    requestId: string // I believe that requestID will not be null if the user has an active request
    timeEntered: string
}

export function parseDate(date: string) {
    // date comes in in this format: YYYY-MM-DDTHH:mm:ss.sssZ
    const dateEntered = parseISO(date);
    return format(dateEntered, "h:mm a")
}

export default function QueueWaiting({position, requestId, timeEntered} : queueWaitingProps) {
    const queueVis = "h-24 w-full"
    const flex = "flex flex-col gap-3"
    const queueStatusFont = "text-xl font-medium text-queuegreen text-center"
    const queueTimeEnteredFont = "text-lg font-thin text-black text-center"
    const reflectionValue = "Request closed by student."
    
    const courseId = useCourseId() as string;
    const auth = useAuth();
    const { mutate } = useSWRConfig();
    const {data, error, isLoading} = useData<GetRequestAPIResponse>(`/courses/${courseId}/requests/${requestId}`)

    if (!data || error || isLoading) {
        return (
            <Spinner className="animate-spin h-8 w-8 text-queuegreen"></Spinner>
        )
    }

    const leaveQueue = async () => {
        try {
            const token = await auth.getToken();
            await api.partialRequestUpdate(token, courseId, requestId, { resolution: reflectionValue });
            await api.updateRequestStatus(token, courseId, requestId, "CLOSED");
            await mutate<GetRequestAPIResponse>(`/courses/${courseId}/requests/${requestId}`, async data => {
                if (data) {
                  return { ...data, resolution: reflectionValue }
                }
              }, {
                revalidate: false
              });
        
              // Update cache entries: populate the resolution field for GetRequestHistory endpoint
              await mutate<GetRequestHistoryAPIResponse>(`/courses/${courseId}/history`, async data => {
                const res = data?.requests.map((x) => x.requestId === requestId ? {...x, resolution: reflectionValue} : x);
                if (!res) return { requests: [] };
                return { requests: res };
              });
        } catch (e: unknown) {
            console.error(e);
        }
    }

    return (
        <div className={`${flex}`}>
            <div className={`${queueVis} flex order-1 items-center justify-center`}>
                <Logo className="fill-black" alt="Cutequeue logo" height={"72"} />
            </div>
            <div className="order-2">
                <div className={`${queueStatusFont}`}>
                    You are at position <span className="text-3xl">{position}</span> in the Queue.
                </div>
                <div className={`${queueTimeEnteredFont}`}>
                    Entered: {`${(parseDate(data.createdAt))}`}
                </div>
            </div>
            <div className="order-3 flex items-center justify-center">
                    <Button type="critical" label="Leave Queue" onClick={() => leaveQueue()} />
                </div>
            
        </div>
    )
}