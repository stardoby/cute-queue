import React, { Fragment, useState, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";

import noop from "@/utils/noop";
import { useAuth } from "@/contexts/authContext";
import { roboto } from "@/utils/fonts";
import { sanchez } from "@/utils/fonts";
import * as api from "@/api";

type StudentAfterRUModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function StudentAfterRUModal({
  open,
  onClose,
  onSuccess = noop,
}: StudentAfterRUModalProps) {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);

  const close = useCallback(() => {
    setLoading(false);

    onClose();
  }, [onClose]);

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
              <div className="bg-paleyellow/60 rounded-t-lg p-2 px-10 text-darkyellow w-full">
                Your request will be held for 7 minutes after TA accepts.
              </div>
              <Dialog.Title className="text-queuegreen w-3/4 text-center text-2xl font-medium mb-6 mt-8 flex flex-col">
                <div>Thanks!</div>
                <div>Your TA will accept your request shortly</div>
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
