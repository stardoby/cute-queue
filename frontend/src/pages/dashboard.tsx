import Head from "next/head";
import { useState } from "react";

import AddCourseModal from "@/components/addCourseModal";
import CourseItem from "@/components/courseItem";
import AddCourse from "@/components/addCourse";
import { scheduleIsOpen } from "@/utils/scheduleIsOpen";
import { useData } from "@/hooks/useData";
import type { GetCoursesAPIResponse } from "@/types/apiResponses";
import type { CourseSummary } from "@/types/courseSummary";

function CourseItemLoading() {
    const box = "animate-pulse w-80 h-54 rounded-lg px-8 py-6 m-3"
    const border = "border-2 border-neutral-200"
    const flex = "flex flex-col items-start gap-3";

    return (
        <div role="status" className={`${flex} ${box} ${border}`}>
            <div className="h-8 bg-neutral-200 rounded-full mb-3 w-40"></div>
            <div className="h-5 bg-neutral-200 rounded-full mb-10 w-48"></div>
            <div className="text-right h-8 bg-neutral-200 rounded-full w-20 self-end"></div>
        </div>
    )
}

export default function Dashboard() {
    const { data, error, isLoading } = useData<GetCoursesAPIResponse>("/courses");
    const [ dialogOpen, setDialogOpen ] = useState(false);

    const renderCourses = (data: GetCoursesAPIResponse) => data.courses.map(c => {
        const isOpen = scheduleIsOpen(c.schedule);
        const description = isOpen ? "Accepting requests" : "Not accepting requests";

        return <CourseItem href={`/courses/${c.courseId}/${c.role.toLowerCase()}`} label={c.name} description={description} isOpen={isOpen} key={c.courseId} />
    });

    const onSuccess = (newCourse: CourseSummary) => {
        // only add a course to the list if it is different than any existing courses
        if (data?.courses.filter((c) => c.courseId === newCourse.courseId).length === 0) {
            data?.courses.push(newCourse);
        }
    }

    return (
        <>
            <Head><title>Dashboard</title></Head>
            <div className="py-8 max-w-[80%] mx-auto">
                <h1 className="font-medium text-2xl mb-4 ml-3" >Your queues:</h1>
                <div className="flex flex-row flex-wrap">
                    {
                        (isLoading || error || !data) ?
                            <CourseItemLoading/> :
                            <>
                                { renderCourses(data) }
                                <AddCourse onClick={() => setDialogOpen(true)}/>
                            </>
                    }
                </div>
            </div>
            <AddCourseModal onSuccess={onSuccess} open={dialogOpen} onClose={() => setDialogOpen(false)}/>
        </>
    );
}

// Attach the Navigation bar and require auth
Dashboard.appLayout = true;
