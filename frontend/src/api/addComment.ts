export async function addComment(token: string, courseId: string, requestId: string, comment: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/courses/${courseId}/requests/${requestId}/comment`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({comment})
    });

    if (!res.ok) throw "Something went badly!";
}