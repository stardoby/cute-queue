type CreateOrEditRequestProps = {
    creatorName: string,
    location: string,
    assignment: string,
    problem: string,
    questionType: string,
    shortDescription: string,
    alreadyTried: string[],
    bestGuess: string,
    howToHelp: string,
    stuckTime: string,
}

/**
 * PUT a PUT request to /courses/[:courseId]/requests/[:requestId]
 * 
 * @param token auth token retrieved from the auth context 
 * @returns a successful API response, or it throws on any non-success response 
 */
export async function createOrEditRequest(token: string, courseId: string, requestId: string, { creatorName, location, assignment, problem, questionType, shortDescription, alreadyTried, bestGuess, howToHelp, stuckTime }: CreateOrEditRequestProps): Promise<void> {    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/courses/${courseId}/requests/${requestId}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            creatorName,
            location,
            assignment,
            problem,
            questionType,
            shortDescription,
            alreadyTried,
            bestGuess,
            howToHelp,
            stuckTime
        })
    });

    if (!res.ok) {
        throw "API request was not ok!"
    }
}
