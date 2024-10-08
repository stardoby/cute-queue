import React, { Fragment, useState, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";

import noop from "@/utils/noop";
import Button from "@/components/button";
import CloudsGroup from "@/icons/clouds-group.svg";
import { useAuth } from "@/contexts/authContext";
import * as api from "@/api";

import type { CourseSummary } from "@/types/courseSummary";

type AddCourseModalProps = {
    open: boolean,
    onClose: () => void,
    onSuccess?: (newCourse: CourseSummary) => void;
}

export default function AddCourseModal({open, onClose, onSuccess = noop}: AddCourseModalProps) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState("");

    const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }, []);

    const formSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => e.preventDefault(), []); 

    const handleSubmit = useCallback(async () => {
        setLoading(true);

        try {
            const token = await auth.getToken();
            const res = await api.joinCourse(token, value);
            onSuccess(res.course);
        } catch  (e: unknown) {
            console.error(e);
        } finally {
            close();
        }
    }, [value]);

    const close = useCallback(() => {
        setValue("");
        setLoading(false);

        onClose();
    }, [onClose]);

    return (
        <Transition show={open} as={Fragment}>
            <Dialog onClose={close} className="relative z-50">
                <Transition.Child as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true"/>
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95">
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="mx-auto min-w-sm rounded-lg bg-white flex flex-col items-center p-8">
                            <Dialog.Title className="text-queuegreen font-medium text-xl my-4 flex flex-col items-center">
                                <CloudsGroup className="mb-4"/>
                                Add course using course ID 
                            </Dialog.Title>
                            <p className="bg-amber-100 py-1 px-4 rounded-sm text-yellow-950">Use instructor-provided course ID to enter the queue for a course.</p>
                            <form onSubmit={formSubmit} className="my-8">
                                <label htmlFor="courseId" className="font-medium text-queuegreen/80 mx-4">Course ID</label>
                                <input onChange={handleInput} id="courseId" type="text" placeholder="e.g., ABC1234567890" className="p-2 bg-neutral-100 rounded outline-queuegreen/50"></input>
                            </form>
                            <div className="self-end flex gap-2">
                                <Button onClick={close} label="Cancel" type="secondary"></Button>
                                <Button onClick={handleSubmit} disabled={loading || value === ""} loading={loading} label="Add Course" type="primary"></Button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}
