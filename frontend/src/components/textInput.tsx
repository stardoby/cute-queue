import { FormEvent, useState, useRef, useEffect } from "react";

type TextInputProps = {
    id: string,
    label: string,
    numRows: number,
    placeholder: string,
    defaultValue?: string,
    minLength?: number,
}

export default function TextInput({ id, label, numRows, defaultValue, placeholder, minLength = 50}: TextInputProps) {
    const textRef = useRef<HTMLTextAreaElement | null>(null);
    const [characterCount, setCharacterCount] = useState(0);

    useEffect(() => {
        if (textRef.current) {
            const length = textRef.current.value.length;
            setCharacterCount(length);
        }
    }, []);

    const setErrorMessage = (e: FormEvent) => {
        const input = e.target as HTMLInputElement;
        if (input.validity.tooShort || input.validity.valueMissing) {
            input.setCustomValidity(`Please enter at least ${minLength} characters.`);
        }
    }

    const onChange = (e: FormEvent) => {
        const input = e.target as HTMLInputElement;
        setCharacterCount(input.value.length)
        if (input.validity.tooShort || input.validity.valueMissing) {
            // don't keep showing error message while user types
            input.setCustomValidity(' ');
        } else {
            input.setCustomValidity('');
        }
    }

    return (
        <>
            <label className="after:content-['*'] after:ml-0.5 after:text-red-500 text-lg text-queuegreen font-medium" htmlFor={id}>{label} </label>
            <textarea ref={textRef} id={id} rows={numRows} className="block p-2 text-md text-slate-900 bg-slate-100 rounded-md focus:outline-none" defaultValue={defaultValue || undefined} placeholder={placeholder} minLength={minLength} required onInvalid={setErrorMessage} onChange={onChange}></textarea>
            <p className={`w-full flex justify-end ${characterCount < minLength ? 'text-red-500' : 'text-slate-400'}`}>{characterCount} / {minLength}</p>
        </>
    );
}