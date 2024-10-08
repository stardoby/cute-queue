import React, { Fragment, useState, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";

import noop from "@/utils/noop";
import { useAuth } from "@/contexts/authContext";
import Button from "@/components/button";
import { useQueue } from "@/hooks/useQueue";
import { useRequestId } from "@/hooks/useRequestId";
import { useCourseId } from "@/hooks/useCourseId";
import { useData } from "@/hooks/useData";
import { useRouter } from "next/router";
import type { GetRequestAPIResponse } from "@/types/apiResponses";

import { roboto } from "@/utils/fonts";
import { sanchez } from "@/utils/fonts";
import * as api from "@/api";

type HelperRUModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function HelperRUModal({
  open,
  onClose,
  onSuccess = noop,
}: HelperRUModalProps) {
  const auth = useAuth();
  const [loading, setLoading] = useState("");

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  const requestId = useRequestId() as string;
  const courseId = useCourseId() as string;
  const router = useRouter();

  const { data, error, isLoading, mutate } = useData<GetRequestAPIResponse>(
    `/courses/${courseId}/requests/${requestId}`
  );

  const postponeRequest = useCallback(async () => {
    try {
      setLoading("postpone");
      const token = await auth.getToken();
      await api.updateRequestStatus(token, courseId, requestId, "NEEDS_UPDATE");

      if (data) mutate({ ...data, status: "NEEDS_UPDATE" });
    } catch (e) {
      alert("that didn't work!");
    } finally {
      setLoading("");
      router.push(`/courses/${courseId}/helper`);
    }
  }, [data]);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={() => {}} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              className={`mx-auto max-w-lg rounded-lg bg-white flex flex-col items-center ${roboto.className}`}
            >
              <div className="bg-paleyellow flex flex-col items-center rounded-t-lg p-2 px-10 text-darkyellow w-full">
                You will still be assigned to this request
              </div>
              <Dialog.Title className="text-darkyellow text-center w-3/4 font-medium mb-4 pt-8 flex flex-col items-center">
                <div className="text-2xl">
                  Are you sure you want to ask for updated request?
                </div>
              </Dialog.Title>
              <div className="text-lg text-black/70 w-3/4 text-center pb-4">
                Student will have 5 minutes to update their request and be added
                back in the queue.
              </div>
              <div className="flex flex-row justify-items-center gap-8 py-8">
                <Button label="Cancel" type="secondary" onClick={close} />
                <Button
                  label="Update"
                  type="warning"
                  onClick={postponeRequest}
                />
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
