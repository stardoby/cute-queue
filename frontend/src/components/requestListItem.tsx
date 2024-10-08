import { roboto } from "@/utils/fonts";
import Link from "next/link";

type RequestListItemProps = {
  creatorName: string; // name of student
  assignment: string;
  problem: string;
  type: string; // conceptual OR debugging
  time: string; // time request entered queue
  status: string;
  href: string; // link to request view
  helpedBy: string;
};

export default function RequestListItem({
  creatorName,
  assignment,
  problem,
  type,
  time,
  status,
  helpedBy,
  href,
}: RequestListItemProps) {
  // Defines styling for the RequestListItem container
  let boxClass = `${roboto.className} flex flex-row text-lg py-3 border-b-2 border-gray-100 hover:cursor-pointer hover:bg-neutral-100`;

  if (status === "UPDATED") boxClass += " bg-amber-100";
  else if (status === "NEEDS_UPDATE") boxClass += " bg-red-100"

  // Defines styling for each field in RequestListItem
  let fieldClass = "flex shrink-0 whitespace-nowrap truncate";

  // Defines styling for the label inside each field
  let textClass = "bg-labelGreen text-sm rounded-lg py-1 px-3 truncate";

  return (
    <Link href={href} legacyBehavior>
      <div className={boxClass}>
        <div className="pl-6 w-1/6 whitespace-nowrap">{creatorName}</div>
        <div className={`${fieldClass} w-1/4`}>
          <span className={`${textClass}`}>{assignment}</span>
        </div>
        <div className={`${fieldClass} pl-3 w-1/5`}>
          <span className={`${textClass}`}>{problem}</span>
        </div>
        <div className={`${fieldClass} pl-3 pr-20 w-48`}>
          <span className={`${textClass}`}>{type}</span>
        </div>
        { status === "SERVING" ? <div className="grow">{helpedBy}</div> : <div className="grow">{time}</div> }
      </div>
    </Link>
  );
}
