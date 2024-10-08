/**
 * PUT a POST request to /courses/[:courseId]/requests/[:requestId]/status
 * 
 * @param token auth token retrieved from the auth context 
 * @returns a successful API response, or it throws on any non-success response 
 */
export async function updateRequestStatus(token: string, courseId: string, requestId: string, nextStatus: string): Promise<void> {    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/courses/${courseId}/requests/${requestId}/status`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nextStatus
        })
    });

    if (!res.ok) {
        throw "API request was not ok!"
    }
}
