import type { JoinCourseAPIResponse } from "@/types/apiResponses";

/**
 * Issues a POST request to /courses/[:courseId]/join
 * 
 * @param token auth token retrieved from the auth context 
 * @returns a successful API response, or it throws on any non-success response 
 */
export async function joinCourse(token: string, courseId: string, role: string = "STUDENT"): Promise<JoinCourseAPIResponse> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/courses/${courseId}/join?role=${role}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw "API request was not ok!"
    }

    const json = await res.json() as JoinCourseAPIResponse; 
    return json;
}
