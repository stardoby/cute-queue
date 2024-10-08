import React, { Fragment, useState, useCallback } from "react";
import { useSWRConfig } from "swr";
import { Dialog, RadioGroup, Transition } from "@headlessui/react";

import * as api from "@/api";

import { roboto } from '@/utils/fonts';
import { useAuth } from "@/contexts/authContext";
import { useQueue } from "@/hooks/useQueue";

import noop from "@/utils/noop";
import Button from "@/components/button";
import { useCourseId } from "@/hooks/useCourseId";

import { GetRequestAPIResponse, GetRequestHistoryAPIResponse } from "@/types/apiResponses";

type PostReflectModalProps = {
  open: boolean;
};

export default function PostReflectModal({
  open,
}: PostReflectModalProps) {
  const auth = useAuth();
  const queue = useQueue();
  const courseId = useCourseId();
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);
  const [ratingValue, setRatingValue] = useState(-1);
  const [reflectionValue, setReflectionValue] = useState("");

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReflectionValue(e.target.value);
  }, []);

  const formSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => e.preventDefault(), []); 
  
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    
    // Validate we have an active request 
    const requestId = queue.activeRequest;
    if (!requestId) {
      alert("Somehow you don't have an active request!")
      close();
      return;
    }

    try {
      const token = await auth.getToken();
      await api.partialRequestUpdate(token, courseId as string, requestId, { resolution: reflectionValue });
      await api.updateRequestStatus(token, courseId as string, requestId, "CLOSED");
      
      // Update cache entries: populate the resolution field for GetRequest endpoint
      await mutate<GetRequestAPIResponse>(`/courses/${courseId}/requests/${requestId}`, async data => {
        if (data) {
          return { ...data, resolution: reflectionValue }
        }
      }, {
        revalidate: false
      });

      // Update cache entries: populate the resolution field for GetRequestHistory endpoint
      await mutate<GetRequestHistoryAPIResponse>(`/courses/${courseId}/history`, async data => {
        const res = data?.requests.map((x) => x.requestId === requestId ? {...x, resolution: reflectionValue} : x);
        if (!res) return { requests: [] };
        return { requests: res };
      });
    } catch (e) {
      alert("that didn't work!");
    } finally {
      close();
    }

  }, [ratingValue, reflectionValue, queue, courseId]);

  const close = useCallback(() => {
    setReflectionValue("");
    setRatingValue(-1);
    setLoading(false);
  }, []); // Controlled forms are dismissed during state changes, and are not closable by clicking away

  function createOptions() {
    let radios = [];
    for (let i = 0; i < 7; i++) {
      radios.push(
        <div  className="flex flex-col items-center justify-items-center text-lg gap-1">
          <RadioGroup.Option key={`option${i}`} value={i + 1}>
            {({ checked }) => (
              <input
                className="w-4 h-4 accent-queuegreen"
                type="radio"
                name="rating"
                onChange={noop}
                checked={checked}
              />
            )}
          </RadioGroup.Option>
          <RadioGroup.Label key={`label${i}`}>
            <label>{i + 1}</label>
          </RadioGroup.Label>
        </div>
      );
    }

    return radios;
  }

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
            <Dialog.Panel className={`${roboto.className} mx-auto min-w-sm rounded bg-white flex flex-col items-center p-8`}>
              <Dialog.Title className="text-queuegreen font-medium text-3xl my-4 flex flex-col items-center">
                Wrapping Up
              </Dialog.Title>
              <p className="px-4 text-lg ">
                Write a quick summary so you can remember for later!
              </p>
              <form onSubmit={formSubmit} className={`${roboto.className} my-8 w-3/4 flex flex-col gap-8`}>
                <div className="flex flex-col">
                  <label
                    className="after:content-['*'] after:ml-0.5 after:text-red-500 text-lg text-queuegreen font-medium text-center"
                    htmlFor="summary"
                  >
                    What did you learn from this session?
                  </label>
                  <textarea
                    id="summary"
                    rows={3}
                    onChange={handleInput}
                    value={reflectionValue}
                    className=" p-2 mt-4 text-md text-slate-900 bg-slate-100 rounded-md  focus:outline-none w-full"
                    placeholder="I had an off-by-one error..."
                  ></textarea>
                </div>
                <div className="flex flex-col items-center">
                  <label
                    className="after:content-['*'] after:ml-0.5 after:text-red-500 text-lg text-queuegreen font-medium text-center"
                    htmlFor="survey"
                  >
                    How helpful was the queue in your office hours experience?
                  </label>
                    <RadioGroup value={ratingValue} onChange={setRatingValue} className="flex flex-row gap-5 pt-4 ">
                      {createOptions()}
                    </RadioGroup>
                  <div className="flex flex-row pt-4 justify-between w-full">
                    <div>very unhelpful</div>
                    <div>very helpful</div>
                  </div>
                </div>
              </form>
              <div className="self-end flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || reflectionValue === "" || ratingValue <= 0}
                  loading={loading}
                  label="Submit"
                  type="primary"
                ></Button>
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
