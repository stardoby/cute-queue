import CloudLightning from "@/icons/cloud-lightning-bolt.svg"

export default function QueueNextUp() {
    const queueVis = "h-24 w-full"
    const flex = "flex flex-col gap-3"
    const queueStatusFont = "text-xl font-medium text-queuegreen text-center"

    return (
        <div className={`${flex}`}>
            <div className={`${queueVis} flex order-1 items-center justify-center`}>
            <CloudLightning alt="Cloud with lightning bolt" height={"72"} />
            </div>
            <div className="order-2 flex-end">
                <div className={`${queueStatusFont}`}>
                    You&apos;re next in line!
                </div>
            </div>
            
        </div>
    )
}