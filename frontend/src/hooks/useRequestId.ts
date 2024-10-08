import { useRouter } from "next/router";

export function useRequestId() {
    const router = useRouter();
    return router.query.requestId;
}
