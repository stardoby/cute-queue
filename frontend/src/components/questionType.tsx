import { FormEvent } from "react";

type QuestionTypeProps = {
    isReadOnly: boolean,
    selectedOption?: string,
    onChange?: (e: FormEvent) => void,
}

export default function QuestionType({ isReadOnly, selectedOption, onChange = undefined }: QuestionTypeProps) {
    if (isReadOnly) {
        return (
            <>
                <label className="text-lg text-queuegreen font-medium" htmlFor="questionType">My question is... </label>
                <label className="flex items-center text-lg">
                    <input className="w-4 h-4 mr-2 accent-queuegreen" type="radio" name="questionType" value="debugging" disabled checked={selectedOption === "debugging"} />
                    Debugging
                </label>
                <label className="flex items-center text-lg">
                    <input className="w-4 h-4 mr-2 accent-queuegreen" type="radio" name="questionType" value="conceptual" disabled checked={selectedOption === "conceptual"} />
                    Conceptual
                </label>
            </>
        );
    }

    return (
        <>
            <label className="after:content-['*'] after:ml-0.5 after:text-red-500 text-lg text-queuegreen font-medium" htmlFor="questionType">My question is... </label>
            <label className="flex items-center text-lg">
                <input className="w-4 h-4 mr-2 accent-queuegreen" onChange={onChange} type="radio" name="questionType" value="debugging" defaultChecked={selectedOption === "debugging"} required/>
                Debugging
            </label>
            <label className="flex items-center text-lg">
                <input className="w-4 h-4 mr-2 accent-queuegreen" onChange={onChange} type="radio" name="questionType" value="conceptual" defaultChecked={selectedOption === "conceptual"} />
                Conceptual
            </label>
        </>
    );
}