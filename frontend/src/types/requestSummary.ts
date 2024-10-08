import type { Comment } from "@/types/comment"

export interface RequestSummary {
    requestId: string,
    assignment: string,
    problem: string,
    shortDescription: string,
    resolution?: string,
    comments?: Comment[],
}