import React, { Fragment, useState, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";

import noop from "@/utils/noop";
import { useAuth } from "@/contexts/authContext";
import { useQueue } from "@/hooks/useQueue";
import { useCourseId } from "@/hooks/useCourseId";
import User from "@/icons/user.svg";
import { roboto } from "@/utils/fonts";
import { sanchez } from "@/utils/fonts";
import * as api from "@/api";

type StudentAcceptModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function StudentAcceptModal({
  open,
  onClose,
  onSuccess = noop,
}: StudentAcceptModalProps) {
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
    let lastTwo = "-1";
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
            <Dialog.Panel
              className={`mx-auto max-w-lg max-h-lg rounded-lg bg-white flex flex-col items-center ${roboto.className}`}
            >
              <div className="bg-paleyellow/60 rounded-t-lg p-2 px-10 text-darkyellow w-full font-normal ">
                Your request will be held for 7 minutes after TA accepts.
              </div>
              <Dialog.Title className="text-queuegreen font-medium mb-5 flex flex-col items-center ">
                <div className="flex flex-col gap-2 h-min pt-8 justify-items-center">
                  <User alt="User" height={24} />
                  <p className="text-2xl font-normal">Daniel Chao</p>
                </div>
                <div className="text-2xl ">is ready to help you!</div>
              </Dialog.Title>
              <div className="text-lg text-black/70 font-medium">
                Make your way to Huang Basement
              </div>
              <div className="pb-14">
                “I'm at the whiteboard near the window!”
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
