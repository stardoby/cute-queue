import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { useSWRConfig } from "swr";

import RequestListItem from "./requestListItem";
import Button from "./button";

import * as api from "@/api";

import { roboto } from "@/utils/fonts";
import { useQueue } from "@/hooks/useQueue";
import { useData } from "@/hooks/useData";
import { useCourseId } from "@/hooks/useCourseId";
import { useAuth } from "@/contexts/authContext";

import { formatDateAsTime } from "@/utils/formatDateAsTime";

import type { GetRequestAPIResponse} from "@/types/apiResponses";
import { Tab } from "@headlessui/react";

type RequestListProps = {
  isOpen?: boolean; // if queue is open or closed, hardcoded
};

function RequestListItemContainer({ requestId, status }: { requestId: string, status: string }) {
  // Get data from request based on requestId and courseId to populate ListItem
  const courseId = useCourseId();
  const { data, error, isLoading } = useData<GetRequestAPIResponse>(
    `/courses/${courseId}/requests/${requestId}`
  );

  // Loading component
  if (!data || error || isLoading)
    return (
      <div className="flex flex-row text-lg py-3 border-b-2 border-gray-100">
        <div className="pl-6 w-1/6">
          {" "}
          <div className="animate-pulse w-1/2 h-8 bg-gray-200" />{" "}
        </div>
        <div className="w-1/4">
          {" "}
          <div className="animate-pulse w-2/3 h-8 bg-gray-200" />{" "}
        </div>
        <div className="pl-3 w-1/5">
          {" "}
          <div className="animate-pulse w-1/3 h-8 bg-gray-200" />{" "}
        </div>
        <div className="pl-3 pr-20 w-48">
          {" "}
          <div className="animate-pulse w-1/2 h-8 bg-gray-200" />{" "}
        </div>
        <div className="grow">
          {" "}
          <div className="animate-pulse w-1/2 h-8 bg-gray-200" />{" "}
        </div>
      </div>
    );

  return (
    <RequestListItem
      href={`/courses/${courseId}/request/${requestId}/view/helper`}
      creatorName={data.creatorName}
      assignment={data.assignment}
      problem={data.problem}
      type={data.questionType}
      time={formatDateAsTime(data.createdAt)}
      helpedBy={data.helperName || ""}
      status={status}
    />
  );
}

export default function RequestList({ isOpen }: RequestListProps) {
  const queue = useQueue(); // initiate queue component
  const auth = useAuth();
  const router = useRouter();
  const courseId = useCourseId();
  const { mutate } = useSWRConfig();

  const [nextRequestLoading, setNextRequestLoading] = useState(false);

  // map items from queue onto request list items
  const requestListItems = (queue.order ?? []).map((requestId) => {
    return <RequestListItemContainer key={requestId} requestId={requestId} status={queue.status[requestId]} />;
  });

  const activelyServedItems = Object
    .entries(queue.status)
    .filter(([_, status]) => status === "SERVING")
    .map(([id, _]) => id)
    .map(id => (
      <RequestListItemContainer key={id} requestId={id} status={"SERVING"}/>
    ))

  // if queue is NOT open, NO drop shadow
  function changeDropShadow() {
    return !isOpen ? "drop-shadow" : "";
  }

  const nextRequestClick = useCallback(async () => {
    setNextRequestLoading(true);
    const token = await auth.getToken();
    const nextRequest = await api.assignNextRequest(token, courseId as string); 
    
    // Optimistically change the status to "IN_REVIEW" so we don't have to fetch again
    await mutate<GetRequestAPIResponse>(
      `/courses/${courseId}/requests/${nextRequest}`, 
      async (data) => { if (data) { return { ...data, status: "IN_REVIEW"} } },
      { revalidate: false });

    router.push(`/courses/${courseId}/request/${nextRequest}/view/helper`);
  }, [router, courseId]);

  return (
    <Tab.Group>
      <div className={`flex flex-col ${roboto.className}`}>
          <div className="flex flex-row">
            <Tab.List>
              <div className="flex items-start flex-row font-normal text-xl gap-12 pb-10">
                <Tab className="px-4 ui-selected:font-bold ui-selected:text-queuegreen ui-selected:border-b-4 ui-selected:border-queuegreen">Course Queue</Tab>
                <Tab className="px-4 ui-selected:font-bold ui-selected:text-queuegreen ui-selected:border-b-4 ui-selected:border-queuegreen">Being Helped</Tab>
              </div>
            </Tab.List>
            <div className="grow"></div>
            <Button loading={nextRequestLoading} onClick={nextRequestClick} className="self-begin max-h-10 grow-0" label="Next Request" type="primary"/>
          </div>
        <div className={changeDropShadow()}>
          <Tab.Panels>
            <Tab.Panel>
              <div className="flex flex-row font-medium text-white text-xl bg-transGreen rounded-t py-2">
                <div className="pl-6 w-1/6">Name</div>
                <div className="w-1/4">Assignment</div>
                <div className="pl-3 w-1/5">Problem</div>
                <div className="pl-3 pr-20 w-48">Type</div>
                <div className="grow">Signed Up</div>
              </div>

              <div>
                {requestListItems.length > 0 ? (
                  requestListItems
                ) : (
                  <div className="text-gray-300 pt-4 text-lg">
                    Waiting for student requests...
                  </div>
                )}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="flex flex-row font-medium text-white text-xl bg-transGreen rounded-t py-2">
                <div className="pl-6 w-1/6">Name</div>
                <div className="w-1/4">Assignment</div>
                <div className="pl-3 w-1/5">Problem</div>
                <div className="pl-3 pr-20 w-48">Type</div>
                <div className="grow">Helped By</div>
              </div>

              <div>
                {activelyServedItems.length > 0 ? (
                  activelyServedItems
                ) : (
                  <div className="text-gray-300 pt-4 text-lg">
                    No one is currently being served.
                  </div>
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </div>
    </Tab.Group>
  );
}
