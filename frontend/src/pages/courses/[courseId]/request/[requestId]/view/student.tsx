import Head from "next/head";
import Link from 'next/link';
import { NextRouter, useRouter } from "next/router";

import { EditRequestFormProps } from "@/components/editRequestForm";
import { CurrentRequestView, CurrentRequestViewProps } from "@/components/currentRequestView";
import { useData } from "@/hooks/useData";
import { useCourseId } from "@/hooks/useCourseId";
import { useRequestId } from "@/hooks/useRequestId";
import { GetRequestAPIResponse } from "@/types/apiResponses";

import Spinner from "@/icons/spinner.svg";
import Exit from '@/icons/exit.svg';
import Pencil from '@/icons/pencil.svg';
import CommentsList from "@/components/commentsList";
import { useEffect } from "react";
import { useQueue } from "@/hooks/useQueue";

function editRequest(data: EditRequestFormProps, courseId: string | string[] | undefined,
                        requestId: string | string[] | undefined, router: NextRouter, required: boolean) {
    const requesthref = `/courses/${courseId}/request/${requestId}/edit`;
    router.push({
        pathname: requesthref,
        query: { ...data, update: true, required },
    }, requesthref);
}

export function parseRequestDetails(data: GetRequestAPIResponse): CurrentRequestViewProps {
    if (data.questionType === 'debugging') {
        let otherAlreadyTried = undefined;
        const defaultOptions = ["Ed discussion forum", "Using the debugger", "Sketching out diagrams", "Re-reading the handout"];
        const diff = data.alreadyTried.filter(option => !defaultOptions.includes(option));
        if (diff.length === 1) {
            otherAlreadyTried = diff[0];
        }

        return {
            creatorName: data.creatorName,
            location: data.location,
            assignment: data.assignment,
            problem: data.problem,
            questionType: data.questionType,
            shortDescription: data.shortDescription,
            bestGuess: data.bestGuess,
            alreadyTried: data.alreadyTried,
            otherAlreadyTried: otherAlreadyTried,
            howToHelp: data.howToHelp,
            stuckTime: data.stuckTime,
        }
    } else {
        return {
            creatorName: data.creatorName,
            location: data.location,
            assignment: data.assignment,
            problem: data.problem,
            questionType: data.questionType,
            shortDescription: data.shortDescription,
            bestGuess: data.bestGuess,
        }
    }
}

export default function CurrentRequestStudent() {
    const router = useRouter();
    const courseId = useCourseId();
    const requestId = useRequestId() as string;
    const queue = useQueue();
    const { data, error, isLoading, mutate } = useData<GetRequestAPIResponse>(`/courses/${courseId}/requests/${requestId}`);
    
    useEffect(() => {
        mutate(undefined); // trigger a revalidation when the router changes
    }, [router.query.slug]);

    if (!data || error || isLoading) {
        return (
            <main className="flex flex-col h-min justify-center items-center bg-white w-full mt-8">
                <Spinner className="animate-spin h-8 w-8 text-queuegreen"></Spinner>
            </main>
        )
    }

    const requestDetails = parseRequestDetails(data);

    return (
        <>
            <Head><title>View request</title></Head>
            <main className="flex flex-col h-min justify-center items-center bg-white w-full mt-8">
                <div className="flex justify-end items-center w-3/5 space-x-8">
                    { queue.activeRequest === requestId && (queue.status[queue.activeRequest] === "PENDING" || queue.status[queue.activeRequest] === "NEEDS_UPDATE" || queue.status[queue.activeRequest] === "UPDATED") ?
                        <Pencil
                            className="cursor-pointer"
                            onClick={() => editRequest(requestDetails, courseId, requestId, router, queue.status[queue.activeRequest ?? ""] === "NEEDS_UPDATE")}
                            height={32} /> :
                        null }
                    <Link href={`/courses/${courseId}/student`}>
                        <Exit className="cursor-pointer" height={32} />
                    </Link>
                </div>
                <CurrentRequestView {...requestDetails} />
                <div className='flex flex-col justify-center  w-3/5 h-fit gap-2 mb-10'>
                    <h1 className="font-medium text-queuegreen text-lg">Comments</h1>
                    <CommentsList comments={data.comments} appendable={!!queue.status[requestId]} />
                </div>
            </main>
        </> 
    )
}

// Attach the Navigation bar and require auth
CurrentRequestStudent.appLayout = true;