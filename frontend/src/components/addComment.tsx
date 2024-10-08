import { useAuth } from "@/contexts/authContext";
import { useCallback, useState } from "react";
import * as api from "@/api"
import { useCourseId } from "@/hooks/useCourseId";
import { useRequestId } from "@/hooks/useRequestId";
import Logo from "@/icons/comment-send.svg"
import Button from "./button";
import { useQueue } from "@/hooks/useQueue";
import { GetRequestAPIResponse, GetRequestHistoryAPIResponse } from "@/types/apiResponses";
import { mutate } from "swr";



export default function AddComment({}) {
    const auth = useAuth();
    const courseId = useCourseId() as string
    const { activeRequest } = useQueue();
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);

    const box = ' rounded  w-full h-fit flex gap-1'
    const text = 'text-lg font-thin text-left'

    const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }, []);

    const formSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => e.preventDefault(), []); 

    const handleSubmit = useCallback(async () => {
        setLoading(true);

        try {
            if (!activeRequest) throw "Somehow you don't have an active request!";
            const token = await auth.getToken();
            const res = await api.addComment(token, courseId, activeRequest, value)
            const newComment = {text: value, createdAt: new Date().toISOString()}

            setLoading(false);
            setValue("");

            await mutate<GetRequestAPIResponse>(`/courses/${courseId}/requests/${activeRequest}`, async data => {
                if (data) {
                    return {...data, comments: [...(data.comments ?? []), newComment]}
                }
                return data;
            });

            await mutate<GetRequestHistoryAPIResponse>(`/courses/${courseId}/history`, async data => {
                const res = data?.requests.map((x) => x.requestId === activeRequest ? {...x, comments: [...(x.comments ?? []), newComment]} : x);
                if (!res) return { requests: [] };
                return { requests: res };
            });
        } catch (e: unknown){  
            console.error(e);
        } finally {
            setLoading(false);
            setValue("");
        }
    }, [value, courseId, activeRequest]);


    return (
        <div className={`${box} ${text}`}>
            <form onSubmit={formSubmit}  className="w-full">
                <input onChange={handleInput} value={value} id="addComment" type="text" placeholder="Add a new comment..." className="bg-neutral-100 rounded w-full p-2"></input>
            </form>
            <Button className="px-2" type="image" onClick={handleSubmit} disabled={loading || value === ""} loading={loading}><Logo className={value === "" ? "fill-neutral-300" : "fill-queuegreen"}/></Button>
        </div>
    )
}
