import { useRouter } from "next/router";

export function useCourseId() {
    const router = useRouter();
    return router.query.courseId;
}
