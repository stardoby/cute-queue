import type { PostNextRequestAPIResponse } from "@/types/apiResponses";

export async function assignNextRequest(token: string, courseId: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/courses/${courseId}/requests/next`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });

    if (!res.ok) throw "Something didn't work!";

    const { requestId } = await res.json() as PostNextRequestAPIResponse;
    return requestId;
};