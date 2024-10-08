import Head from "next/head";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";

import * as api from "@/api";
import Exit from "@/icons/exit.svg";
import Button from "@/components/button";
import Spinner from "@/icons/spinner.svg";
import HelperRUModal from "@/components/helperRUModal";
import HelperNSModal from "@/components/helperNSModal";
import { CurrentRequestView } from "@/components/currentRequestView";
import { useRequestId } from "@/hooks/useRequestId";
import { useCourseId } from "@/hooks/useCourseId";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/contexts/authContext";

import type { GetRequestAPIResponse } from "@/types/apiResponses";
import { parseRequestDetails } from "./student";
import { useQueue } from "@/hooks/useQueue";
import CommentsList from "@/components/commentsList";

export default function CurrentRequestStaff() {
  const requestId = useRequestId() as string;
  const courseId = useCourseId() as string;
  const { status } = useQueue();
  const auth = useAuth();
  const router = useRouter();
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const { data, error, isLoading, mutate } = useData<GetRequestAPIResponse>(
    `/courses/${courseId}/requests/${requestId}`
  );

  const [loading, setLoading] = useState("");

  const resolveRequest = useCallback(async () => {
    try {
      setLoading("resolve");
      const token = await auth.getToken();
      await api.updateRequestStatus(token, courseId, requestId, "RESOLVED");

      if (data) mutate({ ...data, status: "RESOLVED" });
    } catch (e) {
      alert("that didn't work!");
    } finally {
      setLoading("");
      router.push(`/courses/${courseId}/helper`);
    }
  }, [data]);

  const acceptRequest = useCallback(async () => {
    try {
      setLoading("accept");
      const token = await auth.getToken();
      await api.updateRequestStatus(token, courseId, requestId, "SERVING");

      if (data) mutate({ ...data, status: "SERVING" });
    } catch (e) {
      alert("that didn't work!");
    } finally {
      setLoading("");
    }
  }, [data]);

  const assignRequest = useCallback(async () => {
    try {
      setLoading("accept");
      const token = await auth.getToken();
      await api.updateRequestStatus(token, courseId, requestId, "IN_REVIEW");

      if (data) mutate({ ...data, status: "IN_REVIEW" });
    } catch (e) {
      alert("that didn't work!");
    } finally {
      setLoading("");
    }
  }, [data]);

  if (!data || error || isLoading) {
    return (
      <main className="flex flex-col h-min justify-center items-center bg-white w-full mt-8">
        <Spinner className="animate-spin h-8 w-8 text-queuegreen"></Spinner>
      </main>
    );
  }

  const requestControlsWhenPending = () => (
    <>
      <Button
        loading={loading === "assign"}
        label="Assign To Me"
        type="primary"
        className="mt-4 mb-8"
        onClick={assignRequest}
      />
    </>
  );

  const requestControlsWhenReviewing = () => (
    <>
      <Button
        loading={loading === "postpone"}
        label="Ask to Update"
        type="warning"
        className="mt-4 mb-8"
        onClick={() => setUpdateOpen(true)}
      />
      <Button
        loading={loading === "accept"}
        disabled={loading === "postpone"}
        label="Accept"
        type="primary"
        className="mt-4 mb-8"
        onClick={acceptRequest}
      />
    </>
  );

  const requestControlsWhenServing = () => (
    <>
      <Button
        loading={loading === "close"}
        disabled={loading === "resolve"}
        label="No Show"
        type="critical"
        className="mt-4 mb-8"
        onClick={() => setNoShowOpen(true)}
      />
      <Button
        loading={loading === "resolve"}
        disabled={loading === "close"}
        label="Resolved"
        type="primary"
        className="mt-4 mb-8"
        onClick={resolveRequest}
      />
    </>
  );

  const renderControls = () => {
    if (status[requestId] === "IN_REVIEW")
      return requestControlsWhenReviewing();
    if (status[requestId] === "PENDING" || status[requestId] === "UPDATED")
      return requestControlsWhenPending();
    if (status[requestId] === "SERVING") return requestControlsWhenServing();
    if (status[requestId] === "NEEDS_UPDATE")
      return (
        <p className="py-8">
          You or another staff member asked the student to update this request.
        </p>
      );
    return null;
  };

  const requestDetails = parseRequestDetails(data);

  return (
    <>
      <Head>
        <title>View Current Request</title>
      </Head>
      <main className="flex flex-col h-min justify-center items-center bg-white w-full mt-8">
        <div className="flex justify-end items-center w-3/5 space-x-8">
          <Link href={`/courses/${courseId}/helper`}>
            <Exit className="cursor-pointer" height={32} />
          </Link>
        </div>
        <CurrentRequestView {...requestDetails} />
        <div className='flex flex-col justify-center  w-3/5 h-fit gap-2 mb-10'>
            <h1 className="font-medium text-queuegreen text-lg">Comments</h1>
            <CommentsList comments={data.comments} />
        </div>
        <div className="flex flex-row justify-center items-center space-x-32 w-3/5 bg-white fixed drop-shadow w-full bottom-0">
          {renderControls()}
        </div>
        <div className=" w-full h-20 bg-white"> </div>
        <HelperNSModal open={noShowOpen} onClose={() => setNoShowOpen(false)} />
        <HelperRUModal open={updateOpen} onClose={() => setUpdateOpen(false)} />
      </main>
    </>
  );
}

// Attach the Navigation bar and require auth
CurrentRequestStaff.appLayout = true;
