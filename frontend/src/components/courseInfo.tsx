import { sanchez } from "@/utils/fonts";
import { roboto } from "@/utils/fonts";
import { Schedule } from "@/types/schedule";
import { Link } from "@/types/link";

type CourseInfoProps = {
  queueTitle?: string;
  location?: string;
  schedule?: Schedule;
  links?: Link[];
};

export default function CourseInfo({
  queueTitle,
  schedule,
  location,
  links,
}: CourseInfoProps) {
  // Function creates links dynamically based on link array
  const createLinks = () => {
    return links?.map((link) => {
      const linkStyle = `${roboto.className} text-xl text-queuegreen underline`;
      return (
        <div key={link.url}>
          <span className="text-lg">🔗 </span>
          <a className={linkStyle} href={link.url}>
            {link.text}
          </a>
        </div>
      );
    });
  };

  // Function extracts open and close time from schedule
  const createTime = () => {
    const DAYS = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    let dateTime = new Date();
    // let index = dateTime.getDay();
    let index = 0; // hardcoded FOR NOW
    let currDay = DAYS[index];
    let result = schedule?.find((obj) => {
      return obj.dayOfWeek === currDay;
    });
    return `${result?.opensAt} to ${result?.closesAt}`;
  };

  return (
    <div className="flex flex-col items-start gap-6 max-w-xs p-8">
      <div className={`${sanchez.className} text-4xl`}>{queueTitle}</div>
      <div className={`${roboto.className} italic text-xl flex flex-col`}>
        <div>
          <span className="not-italic">⏰</span> Accepting requests from
        </div>
        <div>{createTime()}</div>
        <div>
          <span className="not-italic">📍</span>
          {location}
        </div>
      </div>
      <div className="flex flex-col">{createLinks()}</div>
    </div>
  );
}
