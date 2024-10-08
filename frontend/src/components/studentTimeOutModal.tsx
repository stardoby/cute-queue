import React, { Fragment, useState, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";

import noop from "@/utils/noop";
import { useAuth } from "@/contexts/authContext";
import Button from "@/components/button";
import { useQueue } from "@/hooks/useQueue";
import { useCourseId } from "@/hooks/useCourseId";
import { roboto } from "@/utils/fonts";
import { sanchez } from "@/utils/fonts";
import * as api from "@/api";

type StudentTimeOutModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function StudentTimeOutModal({
  open,
  onClose,
}: StudentTimeOutModalProps) {
  const { activeRequest } = useQueue(); 
  const auth = useAuth();
  const courseId = useCourseId() as string;
  const [loading, setLoading] = useState("");

  const changeRequestStatus = useCallback(async (newStatus: string) => {
    setLoading(newStatus);
    try {
      if (!activeRequest) throw "Missing request."
      const token = await auth.getToken();
      await api.updateRequestStatus(token, courseId, activeRequest, newStatus);
    } catch (e) {
      alert("That didn't work!"); 
    } finally {
      setLoading("");
      close();
    }
  }, [activeRequest]);

  const close = useCallback(() => {
    setLoading("");

    onClose();
  }, [onClose]);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={noop} className="relative z-50">
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
              className={`mx-auto min-w-lg rounded-lg bg-white flex flex-col items-center ${roboto.className}`}
            >
              <div className="bg-red-800/20 flex flex-col items-center rounded-t-lg p-2 px-10 text-red-800 w-full">
                Your request will be held for 7 minutes after TA accepts
              </div>
              <Dialog.Title className="text-red-800 font-medium mb-4 pt-8 flex flex-col items-center">
                <div className="text-2xl">Please re-join the queue</div>
                <div className="text-2xl">{"Staff couldn't find you :("}</div>
              </Dialog.Title>
              <div className="text-lg text-black/70 w-3/4 text-center pb-3">
                Re-join the queue with the same request or close your request.
              </div>
              <div className="flex flex-row justify-items-center gap-8 py-8">
                <Button loading={loading === "CLOSED"} disabled={loading === "PENDING"} onClick={() => changeRequestStatus("CLOSED")} label="Close" type="critical" />
                <Button loading={loading === "PENDING"} disabled={loading === "CLOSED"}  onClick={() => changeRequestStatus("PENDING")} label="Join Queue" />
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
