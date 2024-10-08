import { roboto } from "@/utils/fonts";

type NotificationProps = {
  type?: "Home" | "Form";
  queueTitle?: string;
  status?: string | "Closed" | "Warning" | "Error";
  text?: string;
};

export default function Notif({
  type,
  status,
  text,
  queueTitle,
}: NotificationProps) {
  let style = `w-3/4 flex flex-row items-center min-h-12 py-2 px-4 rounded-lg text-xl ${roboto.className} `;

  if (status === "Closed" || status === "Error") {
    style += "bg-closedBG ";
    if (type === "Home") {
      text = `${queueTitle} Closed`;
      style += "text-closedText font-bold ";
    }
  } else if (status === "Warning") {
    style += "bg-warningYellow ";
    if (type === "Home") {
      style += "text-warningText font-bold ";
      text = `From ${queueTitle} staff: ${text}`;
    }
  } else {
    style += "bg-labelGreen ";
    if (type === "Home") {
      style += "text-queuegreen font-medium ";
    }
  }

  function returnIcon() {
    if (status === "Closed" && type === "Home") {
      return <span className="text-3xl pr-4">🛑</span>;
    }
    if (status === "Warning" && type === "Home") {
      return <span className="text-3xl pr-4">⚠️</span>;
    }
  }

  return (
    <div className={style}>
      {returnIcon()}
      {text}
    </div>
  );
}
