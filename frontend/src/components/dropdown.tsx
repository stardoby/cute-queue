import { FormEvent, useRef, useEffect, ForwardedRef, forwardRef } from "react";

type DropdownProps = {
    id: string,
    label: string,
    options: string[],
    onUpdate?: (select: HTMLInputElement) => void,
    defaultValue?: string,
    placeholder?: string,
}

const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(function Dropdown({ id, label, options, onUpdate = undefined, defaultValue = undefined, placeholder = "Select an option..." }: DropdownProps, ref) {
    const selectRef = useRef<HTMLSelectElement | null>(null);
    
    // if the user hasn't selected anything yet, the response should be invalid
    useEffect(() => {
        if (selectRef && selectRef.current) {
            const select = selectRef.current as HTMLSelectElement;
            if (select.value == placeholder) {
                select.setCustomValidity('Please select an option.');
            } else {
                select.setCustomValidity('');
            }
        }
    }, []);

    const checkValidity = (select: HTMLInputElement) => {
        if (select.value === placeholder) {
            select.setCustomValidity('Please select an option.');
        } else {
            select.setCustomValidity('');
        }
    }

    const onChange = (e: FormEvent) => {
        const select = e.target as HTMLInputElement;
        if (onUpdate) {
            onUpdate(select);
        }
        checkValidity(select);
    }

    const setRefs = (el: HTMLSelectElement) => {
        selectRef.current = el;
        if (typeof ref !== "function" && ref) { // check if not a ref callback
            ref.current = el;
        }
    }

    return (
        <>
            <label className="after:content-['*'] after:ml-0.5 after:text-red-500 text-lg text-queuegreen font-medium" htmlFor={id}>{label} </label>
            <select className="bg-slate-100 text-lg px-2 py-1 rounded" id={id} name={id} defaultValue={defaultValue ? defaultValue : placeholder} required onChange={onChange} ref={setRefs}>
                <option value={placeholder} disabled>{placeholder}</option>
                { options.map((option, i) => <option value={option} key={i}>{option}</option>) }
            </select>
        </>
    );
});

export default Dropdown;