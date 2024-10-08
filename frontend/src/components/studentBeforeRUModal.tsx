import React, { Fragment, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";

import Button from "@/components/button";
import noop from "@/utils/noop";

import { useQueue } from "@/hooks/useQueue";
import { useModals } from "@/hooks/useModals";
import { useCourseId } from "@/hooks/useCourseId";
import { roboto } from "@/utils/fonts";

type StudentBeforeRUModalProps = {
  open: boolean;
};

export default function StudentBeforeRUModal({
  open,
}: StudentBeforeRUModalProps) {
  const { activeRequest } = useQueue();
  const router = useRouter();
  const courseId = useCourseId() as string; 
  const modals = useModals();

  const handleEditClick = useCallback(() => {
    if (activeRequest) {
      router.push(`/courses/${courseId}/request/${activeRequest}/view/student`);
      modals.close();
    }
  }, [router, modals, activeRequest, courseId]);

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
              className={`mx-auto max-w-lg rounded-lg bg-white flex flex-col items-center pt-8 ${roboto.className}`}
            >
              <Dialog.Title className="text-darkyellow font-medium mb-4 flex flex-col items-center">
                <div className="text-2xl">Whoops!</div>
                <div className="text-2xl w-3/4 text-center">
                  We don't have enough information in your request.
                </div>
              </Dialog.Title>
              <div className="text-lg text-black/70 w-3/4 text-center">
                Please add more detail in your responses so that we can help in
                a timely manner. You will be added to the top of the queue once
                you're done.
              </div>
              <Button onClick={handleEditClick} label="Update Request" type="warning" className="mt-8 mb-6"/>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
