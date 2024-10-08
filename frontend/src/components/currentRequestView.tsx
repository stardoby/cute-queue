import QuestionType from '@/components/questionType';
import AlreadyTried from '@/components/alreadyTried';
import { roboto } from '@/utils/fonts';

import User from '@/icons/user.svg';

export type CurrentRequestViewProps = {
    creatorName: string,
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
export function CurrentRequestView({ creatorName, location, assignment, problem, questionType, shortDescription, alreadyTried = undefined, otherAlreadyTried = undefined, bestGuess, howToHelp = undefined, stuckTime = undefined }: CurrentRequestViewProps) {
    const debuggingQuestions = () => {
        return (
            <>
                <div className="flex flex-row h-min mt-8 w-full">
                    <div className="flex flex-col h-min w-full">
                        <label className="text-lg text-queuegreen font-medium">In one sentence, the issue I&apos;m having is...</label>
                        <p className="text-lg">{shortDescription}</p>
                    </div>
                    <div className="flex flex-grow w-full max-w-[128px]"/>
                    <div className="flex flex-col h-min w-full">
                        <label className="text-lg text-queuegreen font-medium" htmlFor="alreadyTried">So far, I&apos;ve already tried... </label>
                        <AlreadyTried isReadOnly={true} selectedOptions={alreadyTried} otherOption={otherAlreadyTried} />
                    </div>
                </div>

                <div className="flex flex-col h-min mt-8 w-full">
                    <label className="text-lg text-queuegreen font-medium">My best guess for what is happening is...</label>
                    <p className="text-lg">{bestGuess}</p>
                </div>

                <div className="flex flex-row h-min mt-8 w-full">
                    <div className="flex flex-col h-min w-full">
                        <label className="text-lg text-queuegreen font-medium">I want my helper to help me by...</label>
                        <p className="text-lg">{howToHelp}</p>
                    </div>
                    <div className="flex flex-grow w-full max-w-[128px]"/>
                    <div className="flex flex-col h-min w-full">
                        <label className="text-lg text-queuegreen font-medium">I&apos;ve been working on this issue for...</label>
                        <p className="text-lg">{stuckTime}</p>
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
                        <label className="text-lg text-queuegreen font-medium">In one sentence, I&apos;m confused about...</label>
                        <p className="text-lg">{shortDescription}</p>
                    </div>
                    <div className="flex flex-grow w-full max-w-[128px]"/>
                    <div className="flex flex-col h-min w-full">
                        <label className="text-lg text-queuegreen font-medium" htmlFor="alreadyTried">So far, I&apos;ve already looked at... </label>
                        <p className="text-lg">{bestGuess}</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <main className="flex h-min justify-center items-start bg-white w-full mb-8">
                <div className="flex flex-col h-min w-3/5">
                    <h1 className={`text-black text-4xl font-bold ${roboto.className}`}>View request</h1>
                    <div className="flex flex-row h-min mt-8">
                        <div className="flex flex-col h-min space-y-8">
                            <div className="flex flex-row h-min">
                                <User className="mr-4" alt="User" height={28}/>
                                <p className="text-lg">{creatorName}</p>
                            </div>
                            <div className="flex-initial">
                                <label className="text-lg text-queuegreen font-medium">Assignment</label>
                                <p className="text-lg">{assignment}</p>
                            </div>
                        </div>
                        <div className="flex flex-grow w-full max-w-[128px]"/>
                        <div className="flex flex-col h-min space-y-8">
                            <div className="flex flex-row h-min space-x-2 items-center">
                                <label className="text-lg text-queuegreen font-medium">Location</label>
                                <p className="text-lg">{location}</p>
                            </div>

                            <div className="flex-initial">
                                <div className="flex flex-col h-min">
                                    <label className="text-lg text-queuegreen font-medium">Problem</label>
                                    <p className="text-lg">{problem}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-min mt-8">
                        <QuestionType isReadOnly={true} selectedOption={questionType} />
                    </div>

                    {questionType === 'debugging' ?
                        debuggingQuestions() : 
                        conceptualQuestions()
                    }
                </div>
            </main>
        </>
    )
}