import { FormEvent, useState, useRef, useEffect } from "react";

type AlreadyTriedProps = {
    isReadOnly: boolean,
    selectedOptions?: string[],
    otherOption?: string,
}

export default function AlreadyTried({ isReadOnly, selectedOptions, otherOption }: AlreadyTriedProps) {
    const [otherInputVisible, setOtherInputVisible] = useState(otherOption !== undefined);
    const [numChecked, setNumChecked] = useState(0);
    const checkboxRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (checkboxRef.current.length === 5) {
            let count = 0;
            for (let i = 0; i < 5; i += 1) {
                if (checkboxRef.current[i]?.checked) {
                    count += 1;
                }
            }
            setNumChecked(count);
        }
    }, []);

    const handleOtherClick = () => {
        setOtherInputVisible(!otherInputVisible);
    };

    const onInvalid = (e: FormEvent) => {
        const input = e.target as HTMLInputElement;
        if (input.required && input.validity.valueMissing) {
            input.setCustomValidity('Please select at least one option.');
        } else {
            input.setCustomValidity('');
        }
    }

    const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        let updatedNumChecked = numChecked;
        if (input.checked) {
            updatedNumChecked += 1;
        } else {
            updatedNumChecked -= 1;
        }
        setNumChecked(updatedNumChecked);

        for (let i = 0; i < 5; i += 1) {
            if (checkboxRef.current[i]) {
                if (updatedNumChecked === 0 && !checkboxRef.current[i]?.checked) {
                    checkboxRef.current[i]?.setCustomValidity('Please select at least one option.');
                } else {
                    checkboxRef.current[i]?.setCustomValidity('');
                }
            }
        }
    }

    if (isReadOnly) {
        return (
            <>
                <div className="flex flex-row h-min space-x-4">
                    <div className="flex flex-col h-min space">
                        <label className="flex items-center text-lg" htmlFor="discussionForum">
                            <input ref={el => checkboxRef.current[0] = el} className="w-4 h-4 mr-2 accent-queuegreen" type="checkbox" id="discussionForum" name="alreadyTried" value="Ed discussion forum" disabled checked={selectedOptions?.includes("Ed discussion forum")} />
                            Ed discussion forum
                        </label>
                        <label className="flex items-center text-lg" htmlFor="sketchingDiagrams">
                            <input ref={el => checkboxRef.current[1] = el} className="w-4 h-4 mr-2 accent-queuegreen" type="checkbox" id="sketchingDiagrams" name="alreadyTried" value="Sketching out diagrams" disabled checked={selectedOptions?.includes("Sketching out diagrams")} />
                            Sketching out diagrams
                        </label>
                    </div>
                    <div className="flex flex-col h-min">
                        <label className="flex items-center text-lg" htmlFor="usingDebugger">
                            <input ref={el => checkboxRef.current[2] = el} className="w-4 h-4 mr-2 accent-queuegreen" type="checkbox" id="usingDebugger" name="alreadyTried" value="Using the debugger" disabled checked={selectedOptions?.includes("Using the debugger")} />
                            Using the debugger
                        </label>
                        <label className="flex items-center text-lg" htmlFor="readingHandout">
                            <input ref={el => checkboxRef.current[3] = el} className="w-4 h-4 mr-2 accent-queuegreen" type="checkbox" id="readingHandout" name="alreadyTried" value="Re-reading the handout" disabled checked={selectedOptions?.includes("Re-reading the handout")} />
                            Re-reading the handout
                        </label>
                    </div>
                </div>
                <div className="flex flex-row">
                    <label className="flex mr-2 items-center text-lg" htmlFor="other">
                        <input ref={el => checkboxRef.current[4] = el} className="w-4 h-4 mr-2 accent-queuegreen" onClick={handleOtherClick} type="checkbox" id="other" name="alreadyTried" value="Other..." disabled checked={otherOption !== undefined} />
                        Other...
                    </label>
                    { otherOption !== undefined ?
                        <input className="w-9/12 px-2 text-md text-slate-900 bg-slate-100 rounded-md focus:outline-none" type="text" id="otherAlreadyTried" disabled value={otherOption} />
                        : null
                    }
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex flex-row h-min space-x-4">
                <div className="flex flex-col h-min space">
                    <label className="flex items-center text-lg" htmlFor="discussionForum">
                        <input ref={el => checkboxRef.current[0] = el} className="w-4 h-4 mr-2 accent-queuegreen" type="checkbox" id="discussionForum" name="alreadyTried" value="Ed discussion forum" disabled={isReadOnly} checked={isReadOnly ? selectedOptions?.includes("Ed discussion forum") : undefined} defaultChecked={selectedOptions?.includes("Ed discussion forum")} required={numChecked === 0} onChange={handleCheckbox} onInvalid={onInvalid}/>
                        Ed discussion forum
                    </label>
                    <label className="flex items-center text-lg" htmlFor="sketchingDiagrams">
                        <input ref={el => checkboxRef.current[1] = el} className="w-4 h-4 mr-2 accent-queuegreen" type="checkbox" id="sketchingDiagrams" name="alreadyTried" value="Sketching out diagrams" disabled={isReadOnly} checked={isReadOnly ? selectedOptions?.includes("Sketching out diagrams") : undefined} defaultChecked={selectedOptions?.includes("Sketching out diagrams")} required={numChecked === 0} onChange={handleCheckbox} onInvalid={onInvalid}/>
                        Sketching out diagrams
                    </label>
                </div>
                <div className="flex flex-col h-min">
                    <label className="flex items-center text-lg" htmlFor="usingDebugger">
                        <input ref={el => checkboxRef.current[2] = el} className="w-4 h-4 mr-2 accent-queuegreen" type="checkbox" id="usingDebugger" name="alreadyTried" value="Using the debugger" disabled={isReadOnly} checked={isReadOnly ? selectedOptions?.includes("Using the debugger") : undefined} defaultChecked={selectedOptions?.includes("Using the debugger")} required={numChecked === 0} onChange={handleCheckbox} onInvalid={onInvalid}/>
                        Using the debugger
                    </label>
                    <label className="flex items-center text-lg" htmlFor="readingHandout">
                        <input ref={el => checkboxRef.current[3] = el} className="w-4 h-4 mr-2 accent-queuegreen" type="checkbox" id="readingHandout" name="alreadyTried" value="Re-reading the handout" disabled={isReadOnly} checked={isReadOnly ? selectedOptions?.includes("Re-reading the handout") : undefined} defaultChecked={selectedOptions?.includes("Re-reading the handout")} required={numChecked === 0} onChange={handleCheckbox} onInvalid={onInvalid}/>
                        Re-reading the handout
                    </label>
                </div>
            </div>
            <div className="flex flex-row">
                <label className="flex mr-2 items-center text-lg" htmlFor="other">
                    <input ref={el => checkboxRef.current[4] = el} className="w-4 h-4 mr-2 accent-queuegreen" onClick={handleOtherClick} type="checkbox" id="other" name="alreadyTried" value="Other..." disabled={isReadOnly} checked={isReadOnly ? otherOption !== undefined : undefined} defaultChecked={otherOption !== undefined} required={numChecked === 0} onChange={handleCheckbox} onInvalid={onInvalid}/>
                    Other...
                </label>
                { otherInputVisible ?
                    <input className="w-9/12 px-2 text-md text-slate-900 bg-slate-100 rounded-md focus:outline-none" type="text" id="otherAlreadyTried" disabled={isReadOnly} value={isReadOnly ? otherOption : undefined} defaultValue={otherOption} required />
                    : null
                }
            </div>
        </>
    );
}