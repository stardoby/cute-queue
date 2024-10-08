export async function partialRequestUpdate(token: string, courseId: string, requestId: string, updates: Record<string, string | string[]>) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/courses/${courseId}/requests/${requestId}`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
    });

    if (!res.ok) throw "Something went badly!";
}