import Logo from "@/icons/logo-outline.svg"

export default function QueueServing() {
    const queueVis = "h-24 w-full"
    const flex = "flex flex-col gap-3"
    const queueStatusFont = "text-xl font-medium text-queuegreen text-center"

    return (
        <div className={`${flex}`}>
            <div className={`${queueVis} flex order-1 items-center justify-center`}>
            <Logo alt="Cutequeue logo" className="fill-queuegreen" height={"72"} fill="white" color="black" />
            </div>
            <div className="order-2 flex-end">
                <div className={`${queueStatusFont}`}>
                    You&apos;re up! Your TA will be at your location shortly.
                </div>
            </div>
            
        </div>
    )
}