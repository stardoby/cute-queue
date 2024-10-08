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

type HelperNSModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function HelperNSModal({
  open,
  onClose,
  onSuccess = noop,
}: HelperNSModalProps) {
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

  const closeRequest = useCallback(async () => {
    try {
      setLoading("close");
      const token = await auth.getToken();
      await api.updateRequestStatus(token, courseId, requestId, "LEFT");

      if (data) mutate({ ...data, status: "CLOSED" });
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
              <div className="bg-red-800/20 flex flex-col items-center rounded-t-lg p-2 px-10 text-red-800 w-full">
                You will not be assigned to this request
              </div>
              <Dialog.Title className="text-red-800 text-center w-3/4 font-medium mb-4 pt-8 flex flex-col items-center">
                <div className="text-2xl">Are you sure you want to close the student's request?</div>
              </Dialog.Title>
              <div className="text-lg text-black/70 w-3/4 text-center pb-4">
              Student will be asked to re-join the queue.
              </div>
              <div className="flex flex-row justify-items-center gap-8 py-8">
                <Button label="Cancel" type="secondary" onClick={close} />
                <Button label="Close Request" type="critical" onClick={closeRequest}/>
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
