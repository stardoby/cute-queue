import React, { Fragment, useState, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";

import noop from "@/utils/noop";
import CloudsGroup from "@/icons/clouds-group.svg";
import { useAuth } from "@/contexts/authContext";
import { useQueue } from "@/hooks/useQueue";
import { useCourseId } from "@/hooks/useCourseId";
import { roboto } from "@/utils/fonts";
import { sanchez } from "@/utils/fonts";
import * as api from "@/api";

type StudentEnterModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function StudentEnterModal({
  open,
  onClose,
  onSuccess = noop,
}: StudentEnterModalProps) {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);

  // Get Course ID:
  const courseId = useCourseId();

  // Get queue position
  const queue = useQueue();
  let queuePosition = -1;
  if (typeof queue.order !== "undefined") {
    queuePosition = queue.order.indexOf(
      queue.activeRequest.requestId || "NONE"
    );
  }

  // Get location
  // Get queue closing time
  // Get time entered queue

  const close = useCallback(() => {
    setLoading(false);

    onClose();
  }, [onClose]);

  const setNumber = (number: string) => {
    let lastNum = number.slice(-1);
    let lastTwo = "-1"
    if (number.length > 1) {
      lastTwo = number.slice(-2);
    }
    if (lastNum == "1") {
      return "st";
    } else if (lastNum == "2") {
      return "nd";
    } else if (lastNum == "3" && lastTwo != "13") {
      return "rd";
    }
    return "th";
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={close} className="relative z-50">
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
            <Dialog.Panel className={`mx-auto min-w-lg rounded-lg bg-white flex flex-col items-center pt-4 ${roboto.className}`}>
              <Dialog.Title className="text-queuegreen font-medium mb-4 flex flex-col items-center">
                <CloudsGroup className="mb-2" />
                <div className="font-normal mb-2">You are <span className="text-3xl">{3}</span>{setNumber("3")} in line</div>
                <div className="text-2xl">Thank You!</div>
                <div className="text-2xl"> Your request is on its way</div>
              </Dialog.Title>
              <div className="text-lg text-black/70">Location: Huang Basement</div>
              <div className="text-lg text-black/70">Demo Queue closes at 6 PM</div>
              <div className="text-lg pb-3 text-black/70">Entered: 12:08 AM</div>
              <div className="bg-paleyellow/60 rounded-b-lg p-2 mt-4 px-10 text-darkyellow w-full">
                Your request will be held for 7 minutes after TA accepts.
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
