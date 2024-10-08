import ResolvedIcon from "@/icons/icon-resolved.svg";

export default function() {
    return (
        <div className="flex items-center justify-center flex-col gap-3">
            <ResolvedIcon height={72}/>
            <p className="text-xl font-medium text-queuegreen">Your request was just resolved!</p>
        </div>
    )
}
