import { useSWRConfig } from 'swr';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown';
import TextInput from '@/components/textInput';
import QuestionType from '@/components/questionType';
import AlreadyTried from '@/components/alreadyTried';
import { roboto } from '@/utils/fonts';

import { useAuth } from "@/contexts/authContext";
import * as api from "@/api";

import User from '@/icons/user.svg';
import Spinner from "@/icons/spinner.svg";
import { FormEvent, useCallback, useState, useEffect, createRef } from 'react';
import { useRouter } from "next/router";
import { GetRequestAPIResponse, GetRequestHistoryAPIResponse } from '@/types/apiResponses';
import { RequestSummary } from '@/types/requestSummary';

const LOCATION_OPTIONS = ["Durand 303", "Durand 353", "Durand 411", "Durand 418"];
const ASSIGNMENT_OPTIONS = ["Assignment 1: Getting Your C++ Legs", "Assignment 2: Fun with Collections", "Assignment 3: Recursion Etudes", "Assignment 4: Backtracking", "Assignment 5: Priority Queue", "Assignment 6: Linked Lists", "Assignment 7: Huffman Coding"];
const PROBLEM_OPTIONS: { [key: string] : string[] } = {
    "": [], // default setup
    "Assignment 1: Getting Your C++ Legs": ["Perfect Numbers", "Soundex Search"],
    "Assignment 2: Fun with Collections": ["Warmup", "Maze", "Search Engine", "Beyond Algorithmic Analysis"],
    "Assignment 3: Recursion Etudes": ["Warmup", "Ballot Counting", "Balanced", "Sierpinski Fractal", "Merging Sorted Sequences"],
    "Assignment 4: Backtracking": ["Warmup", "Banzhaf Power Index", "Tile Matching"],
    "Assignment 5: Priority Queue": ["Warmup", "PQArray", "PQueue Client and Data Science Demos", "PQHeap", "Ethics of Prioritization and Ranking"],
    "Assignment 6: Linked Lists": ["The Labyrinth", "Doubly Linked List Warmup", "Particle System"],
    "Assignment 7: Huffman Coding": ["Warmup", "Huffman"]
};
const HOW_TO_HELP_OPTIONS = ["Tracing through another example", "Helping me debug my code", "Answering a clarifying question"];
const STUCK_TIME_OPTIONS = ["Less than 30 minutes", "30 to 60 minutes", "60 to 90 minutes", "More than 90 minutes"];

interface EditRequestDebuggingFormControls extends HTMLFormControlsCollection {
    location: HTMLInputElement,
    assignment: HTMLInputElement,
    problem: HTMLInputElement,
    questionType: HTMLInputElement,
    shortDescription: HTMLInputElement,
    alreadyTried: RadioNodeList,
    otherAlreadyTried?: HTMLInputElement,
    bestGuess: HTMLInputElement,
    howToHelp: HTMLInputElement,
    stuckTime: HTMLInputElement,
}

interface EditRequestConceptualFormControls extends HTMLFormControlsCollection {
    location: HTMLInputElement,
    assignment: HTMLInputElement,
    problem: HTMLInputElement,
    questionType: HTMLInputElement,
    shortDescriptionConceptual: HTMLInputElement,
    bestGuessConceptual: HTMLInputElement,
}

interface EditRequestFormElement extends HTMLFormElement {
    readonly elements: EditRequestDebuggingFormControls | EditRequestConceptualFormControls
}

export type EditRequestFormProps = {
    location: string,
    assignment: string,
    problem: string,
    questionType: string,
    shortDescription: string,
    alreadyTried?: string[],
    otherAlreadyTried?: string,
    bestGuess: string,
    howToHelp?: string,
    stuckTime?: string,
}

// TODO: make options props rather than hard-coded lists
export default function EditRequestForm() {
    const { mutate } = useSWRConfig();
    const auth = useAuth();
    const router = useRouter();
    const isUpdating = router.query.update;
    const updateRequired = router.query.required === 'true';
    const [loading, setLoading] = useState(true);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [requestDetails, setRequestDetails] = useState<EditRequestFormProps | undefined>(undefined);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [selectedQuestionType, setSelectedQuestionType] = useState('');
    const problemDropdownRef = createRef<HTMLSelectElement>();

    useEffect(() => {
        // TODO: type shenanigans?? unsure if there's a better way to do this without using the extra update variable
        const isUpdating = router.query.update;
        if (isUpdating === 'true') {
            const previousRequestDetails = router.query as EditRequestFormProps;
            setRequestDetails(previousRequestDetails);
            setSelectedAssignment(previousRequestDetails.assignment);
            setSelectedQuestionType(previousRequestDetails.questionType);
        } 
        setLoading(false);
    }, []);

    const updateAssignment = (select: HTMLInputElement) => {
        setSelectedAssignment(select.value);
        if (problemDropdownRef.current) {
            // reset to default state when switching to a new assignment
            problemDropdownRef.current.value = "Select problem...";
            problemDropdownRef.current.setCustomValidity('Please select an option.');
        }
    };

    const updateQuestionType = (e: FormEvent) => {
        const radio = e.target as HTMLInputElement;
        if (radio && radio.checked) {
            setSelectedQuestionType(radio.value);
        }
    }

    const parseRequestDetails = (input: EditRequestDebuggingFormControls | EditRequestConceptualFormControls) => {
        if (input.questionType.value === 'debugging') {
            return parseDebuggingRequestDetails(input as EditRequestDebuggingFormControls);
        }
        return parseConceptualRequestDetails(input as EditRequestConceptualFormControls);
    }
    
    const parseConceptualRequestDetails = (input: EditRequestConceptualFormControls) => {
        return {
            // TODO: make this not borked and add error handling
            creatorName: auth.user.username || '',
            location: input.location.value,
            assignment: input.assignment.value,
            problem: input.problem.value,
            questionType: input.questionType.value,
            shortDescription: input.shortDescriptionConceptual.value,
            alreadyTried: [],
            bestGuess: input.bestGuessConceptual.value,
            howToHelp: '',
            stuckTime: '',
        };
    };

    const parseDebuggingRequestDetails = (input: EditRequestDebuggingFormControls) => {
        let approaches: string[] = [];
        input.alreadyTried.forEach((approach) => {
            let checkbox = approach as HTMLInputElement;
            if (checkbox.checked) {
                approaches.push(checkbox.value);
            }
        });
        if (approaches.includes("Other...") && input.otherAlreadyTried) {
            approaches = approaches.filter((approach) => approach !== "Other...");
            approaches.push(input.otherAlreadyTried.value);
        }

        return {
            // TODO: make this not borked and add error handling
            creatorName: auth.user.username || '',
            location: input.location.value,
            assignment: input.assignment.value,
            problem: input.problem.value,
            questionType: input.questionType.value,
            shortDescription: input.shortDescription.value,
            alreadyTried: approaches,
            bestGuess: input.bestGuess.value,
            howToHelp: input.howToHelp.value,
            stuckTime: input.stuckTime.value,
        };
    };

    const handleSubmit = useCallback(async (e: FormEvent<EditRequestFormElement>) => {
        setButtonLoading(true);
        e.preventDefault();
        const req = parseRequestDetails(e.currentTarget.elements);
        const courseId = router.query.courseId as string;
        const requestId = router.query.requestId as string;

        try {
            const token = await auth.getToken();
            await api.createOrEditRequest(token, courseId, requestId, req);
            if (isUpdating !== "true") {
                await api.updateRequestStatus(token, courseId, requestId, "PENDING");
            } else if (updateRequired) {
                await api.updateRequestStatus(token, courseId, requestId, "UPDATED");
            }

            // Update the cache with the new data
            // First, cache the new updated fields for the "GetRequestById" endpoint, if there is
            // a cache entry already. If not; force a revalidation
            await mutate<GetRequestAPIResponse>(`/courses/${courseId}/requests/${requestId}`, async (data) => {
                let newData: GetRequestAPIResponse;
                if (data) {
                    newData = {...data, ...req}
                } else {
                    // Approximate some extra fields that'll get replaced later when the real data comes in
                    const now = new Date().toISOString();
                    newData = { 
                        ...req, 
                        requestId,
                        courseId,
                        status: "PENDING",
                        creatorId: auth.user.userId || "",
                        createdAt: now,
                        updatedAt: now
                    };
                }

                return newData; 
            });
            
            // Then upsert the GetRequestHistory endpoint with the new info
            const newSummaryItem: RequestSummary = {
                requestId,
                assignment: req.assignment,
                problem: req.problem,
                shortDescription: req.shortDescription,
            };
            await mutate<GetRequestHistoryAPIResponse>(`/courses/${courseId}/history`, async (data) => {
                const res = data?.requests.map((x) => x.requestId === requestId ? newSummaryItem : x);
                if (!res) return { requests: [ newSummaryItem ] };
                return { requests: res };
            }, { revalidate: false });

        } catch (e: unknown) {
            console.error(e);
        } finally {
            setButtonLoading(false);
            router.push(`/courses/${courseId}/student`);
        }
    }, [router]);

    const debuggingQuestions = () => {
        return (
            <>
                <div className="flex flex-row h-min mt-8 w-full">
                    <div className="flex flex-col h-min w-full">
                        <TextInput key="shortDescription" id="shortDescription" label="In one sentence, the issue I'm having is..." numRows={3} defaultValue={requestDetails && requestDetails.questionType === 'debugging' ? requestDetails.shortDescription : undefined} placeholder="I'm failing the stress test for TileMatch and I can't figure out why it's timing out" />
                    </div>
                    <div className="flex flex-grow w-full max-w-[128px]"/>
                    <div className="flex flex-col h-min w-full">
                        <label className="after:content-['*'] after:ml-0.5 after:text-red-500 text-lg text-queuegreen font-medium" htmlFor="alreadyTried">So far, I&apos;ve already tried... </label>
                        <AlreadyTried isReadOnly={false} selectedOptions={requestDetails ? requestDetails.alreadyTried : undefined} otherOption={requestDetails && requestDetails.otherAlreadyTried ? requestDetails.otherAlreadyTried : undefined } />
                    </div>
                </div>

                <div className="flex flex-col h-min mt-8 w-full">
                    <TextInput id="bestGuess" label="My best guess for what is happening is..." numRows={2} defaultValue={requestDetails && requestDetails.questionType === 'debugging' ? requestDetails.bestGuess : undefined} placeholder="My code isn't efficient enough because I have too many for loops" />
                </div>

                <div className="flex flex-row h-min mt-8 w-full">
                    <div className="flex flex-col h-min w-full">
                        <Dropdown id="howToHelp" label="I want my helper to help me by..." defaultValue={requestDetails ? requestDetails.howToHelp : undefined} options={HOW_TO_HELP_OPTIONS} />
                    </div>
                    <div className="flex flex-grow w-full max-w-[128px]"/>
                    <div className="flex flex-col h-min w-full">
                        <Dropdown id="stuckTime" label="I've been working on this issue for..." defaultValue={requestDetails ? requestDetails.stuckTime : undefined} options={STUCK_TIME_OPTIONS} />
                    </div>
                </div>
            </>
        );
    }

    const conceptualQuestions = () => {
        return (
            <>
                <div className="flex flex-row h-min mt-8 w-full">
                    <div className="flex flex-col h-min w-full">
                        <TextInput key="shortDescriptionConceptual" id="shortDescriptionConceptual" label="In one sentence, I'm confused about..." numRows={2} defaultValue={requestDetails && requestDetails.questionType === 'conceptual' ? requestDetails.shortDescription : undefined} placeholder="I don't understand what the requirements are for a binary search tree" />
                    </div>
                    <div className="flex flex-grow w-full max-w-[128px]"/>
                    <div className="flex flex-col h-min w-full">
                        <TextInput id="bestGuessConceptual" label="So far, I've already looked at..." minLength={25} numRows={2} defaultValue={requestDetails && requestDetails.questionType === 'conceptual' ? requestDetails.bestGuess : undefined} placeholder="Lecture 7 slides, textbook chapter 10" /> 
                    </div>
                </div>
            </>
        );
    }

    const defaultQuestions = () => {
        return (
            <div className="flex flex-row justify-center h-min mt-8 w-full">
                <p className="text-slate-500"><em>Please select a question type to see the full form.</em></p>
            </div>
        )
    }

    if (loading) {
        return (
            <main className="flex flex-col h-min justify-center items-center bg-white w-full mt-8">
                <Spinner className="animate-spin h-8 w-8 text-queuegreen"></Spinner>
            </main>
        )
    }

    return (
        <>
            <main className="flex min-h-screen justify-center items-start bg-white w-full">
                <div className="flex flex-col h-min w-3/5">
                    <h1 className={`text-black text-4xl font-bold ${roboto.className}`}>{isUpdating === "true" ? "Update request" : "Join the queue"}</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-row h-min mt-8">
                            <div className="flex flex-col h-min space-y-8">
                                <div className="flex flex-row h-min">
                                    <User className="mr-4" alt="User" height={28}/>
                                    <p className="text-lg">{auth.user.username}</p>
                                </div>
                                <div className="flex-initial">
                                    <div className="flex flex-col h-min">
                                        <Dropdown id="assignment" label="Assignment" onUpdate={updateAssignment} options={ASSIGNMENT_OPTIONS} defaultValue={requestDetails ? requestDetails.assignment : undefined} placeholder={"Select assignment..."}/>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-grow w-full max-w-[128px]"/>
                            <div className="flex flex-col h-min space-y-8">
                                <div className="flex flex-row h-min space-x-2 items-center">
                                    <Dropdown id="location" label="Location" options={LOCATION_OPTIONS} defaultValue={requestDetails ? requestDetails.location : undefined} placeholder={"Select your location..."}/>
                                </div>

                                <div className="flex-initial">
                                    <div className="flex flex-col h-min">
                                        <Dropdown id="problem" label="Problem" ref={problemDropdownRef} options={selectedAssignment == '' && requestDetails ? PROBLEM_OPTIONS[requestDetails.assignment] : PROBLEM_OPTIONS[selectedAssignment]} defaultValue={requestDetails ? requestDetails.problem : undefined} placeholder={"Select problem..."}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col h-min mt-8">
                            <QuestionType onChange={updateQuestionType} isReadOnly={false} selectedOption={requestDetails ? requestDetails.questionType : undefined} />
                        </div>


                        <h1 className={`text-black text-xl font-medium mt-8 ${roboto.className}`}>We want to help you as best we can! Please provide details about your request below.</h1>
                        <div className="bg-paleyellow mt-2 py-2 px-4 rounded-md">
                            <p className="text-darkyellow">Please fill out these questions to the best of your ability. If you provide only cursory responses, <b>you may be asked to update your request with a more complete description before you are served.</b> Thank you for helping us help you!</p>
                        </div>

                        {
                        selectedQuestionType !== '' ? 
                            (selectedQuestionType === 'debugging' ?
                                debuggingQuestions() : conceptualQuestions()
                            ) : defaultQuestions()
                        }

                        <div className="flex justify-center mb-8">
                            <Button label={isUpdating === "true" ? "Update request" : "Join the queue"} type="primary" loading={buttonLoading} isSubmit={true} className="mt-8"  />
                        </div>
                    </form>
                </div>
            </main>
        </>
    )
}