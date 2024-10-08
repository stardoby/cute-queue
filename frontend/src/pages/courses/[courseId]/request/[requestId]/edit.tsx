import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import EditRequestForm from "@/components/editRequestForm";
import Exit from '@/icons/exit.svg';

import { useCourseId } from "@/hooks/useCourseId";

// TODO: make options props rather than hard-coded lists
export default function EditRequest() {
    const router = useRouter();
    const courseId = useCourseId();

    return (
        <>
            <Head><title>Edit Request</title></Head>
            <main className="flex flex-col min-h-screen justify-center items-center bg-white w-full mt-8">
                { router.query.required !== 'true' && <div className="flex justify-end items-center w-3/5 cursor-pointer">
                    <Link href={`/courses/${courseId}/student`}>
                        <Exit height={32} />
                    </Link>
                </div> }
                <EditRequestForm />
            </main>
        </> 
    )
}

// Attach the Navigation bar and require auth
EditRequest.appLayout = true;