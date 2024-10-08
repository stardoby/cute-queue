import Head from "next/head";

import HelperList from "@/components/helperList";
import CourseInfo from "@/components/courseInfo";
import QueueVisual from "@/components/queueVisual";
import Notif from "@/components/notification";
import RequestHistoryItemList from "@/components/requestHistoryList";
import CurrentRequestSummary from "@/components/currentRequestSummary";

import { useData } from "@/hooks/useData";
import { useCourseId } from "@/hooks/useCourseId";

import type { GetCourseMetaDataAPIResponse } from "@/types/apiResponses";

function CourseInfoLoading() {
  const box = "animate-pulse max-w-xs h-96 p-8 rounded-lg";
  const flex = "flex flex-col items-start gap-6";

  return (
    <div role="status" className={`${flex} ${box}`}>
      <div className="w-64 h-10 bg-neutral-200 rounded-full"></div>
      <div className="w-72 h-20 bg-neutral-200 rounded-full"></div>
      <div className="w-full flex flex-col gap-2">
        <div className="w-32 h-7 bg-neutral-200 rounded-full"></div>
        <div className="w-30 h-7 bg-neutral-200 rounded-full"></div>
        <div className="w-24 h-7 bg-neutral-200 rounded-full"></div>
        <div className="w-32 h-7 bg-neutral-200 rounded-full"></div>
      </div>
    </div>
  );
}

export default function StudentHome() {
  // Get metadata about the course from API
  const courseId = useCourseId() as string;
  const { data, error, isLoading } = useData<GetCourseMetaDataAPIResponse>(
    `/courses/${courseId}/`
  );

  return (
    <>
      <Head>
        <title>Student Home</title>
      </Head>
      <div className="flex flex-row">
        <div className="shrink-0">
          {isLoading || error || !data ? (
            <CourseInfoLoading />
          ) : (
            <>
              <CourseInfo
                queueTitle={data.name}
                location={data.location}
                schedule={data.schedule}
                links={data.resources}
              />
            </>
          )}
          <HelperList people="" isOpen={true} />
        </div>
        <div className="flex-col flex p-8 grow items-center gap-14">
          <Notif type="Home" status="Warning" queueTitle={data?.name} text="Reminder that we won't have office hours next Sunday because school is over!" />
          <QueueVisual />
          <CurrentRequestSummary />
          <RequestHistoryItemList />
        </div>
      </div>
    </>
  );
}

// Attach the Navigation bar and require auth
StudentHome.appLayout = true;
