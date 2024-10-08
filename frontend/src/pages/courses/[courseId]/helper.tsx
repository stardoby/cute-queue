import { useState } from "react";
import Head from "next/head";
import { roboto } from "@/utils/fonts";
import CourseInfo from "@/components/courseInfo";
import RequestList from "@/components/requestList";
import HelperList from "@/components/helperList";
import useTokenEffect from "@/hooks/useToken";
import QueueVisual from "@/components/queueVisual";
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

export default function StaffHome() {
  const [didReceiveAccessToken, receivedAccessToken] = useState(false);
  useTokenEffect((token) => {
    receivedAccessToken(true);
  }, []);

  const courseId = useCourseId() as string;
  const { data, error, isLoading } = useData<GetCourseMetaDataAPIResponse>(
    `/courses/${courseId}/`
  );

  return (
    <>
      <Head>
        <title>Staff Home</title>
      </Head>
      <div className="flex flex-row">
        <div>
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
        <div className="flex-col flex py-8 grow gap-14">
          {  /* <div
            className={`${roboto.className} text-xl bg-notifYellow text-darkyellow font-bold p-2 rounded-lg w-3/4 flex items-center`}
          >
            <span className="text-3xl pl-2 pr-4">⚠️</span> From CS106B staff: OH
            closing in 1 hour
            </div> */ }

          <QueueVisual isHelper/>

          <div className="pr-8">
            <RequestList isOpen={true} />
          </div>
        </div>
      </div>
    </>
  );
}

// Attach the Navigation bar and require auth
StaffHome.appLayout = true;
