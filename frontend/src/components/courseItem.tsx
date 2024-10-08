import Link from "next/link";
import noop from "@/utils/noop";

type CourseItemProps = {
  label: string;
  description: string;
  isOpen: boolean;
  type?: "secondaryOutlined" | "primaryOutlined" | "primary" | "secondary";
  className?: string;
  href?: string;
  onClick?: () => void;
};

export default function CourseItem({
  label,
  description,
  isOpen,
  href,
  className: extraClassName = "",
  type = "primary",
  onClick = noop,
}: CourseItemProps) {
  const colors = {
    primaryOutlined:
      "bg-white hover:bg-slate-100 focus:ring-white focus:ring-offset-queuegreen",
    secondaryOutlined:
      "bg-white hover:bg-slate-100 text-slate-700 focus:ring-white focus:ring-offset-queuegreen",
    primary:
      "bg-white text-queuegreen focus:ring-queuegreen focus:ring-offset-white",
    secondary:
      "bg-slate-700 text-white focus:ring-slate-700 focus:ring-offset-white",
  };

  // Defines styling for the CourseItem container
  const box = `rounded-lg m-3 border-queuegreen border-2 w-80 h-56 px-8 py-6`;
  const hover = `hover:bg-neutral-100`;
  const flex = `flex flex-col items-start gap-3`;
  const ring = `focus:outline-none focus:ring-2 focus:ring-offset-2`;
  const className = `${box} ${hover} ${ring} ${colors[type]} ${flex}`;


  // Defines styling for the course title
  const titleFont = `font-medium text-2xl text-black text-left`;
  const titleOrder = `order-1`;
  const flexItem = `flex-none self-stretch grow-0`;
  const titleClass = `${titleFont} ${flexItem} ${titleOrder}`;

  // Defines styling for the course description
  const descriptionFont = `text-lg font-thin text-neutral-500 text-left h-16`;
  const descriptionOrder = `order-2`;
  const descriptionClass = `${descriptionFont} ${flexItem} ${descriptionOrder}`;

  // Defines styling for the "Open" or "Closed" text
  const isOpenFont = isOpen
    ? `font-bold text-xl text-queuegreen text-right`
    : `font-bold text-xl text-closed text-right`;
  const isOpenOrder = `order-3`;
  const isOpenClass = `${isOpenFont} ${flexItem} ${isOpenOrder}`;

  return href ? (
    <Link href={href} className={`${className} inline-block`}>
      <div className={titleClass}>{label}</div>
      <div className={descriptionClass}>{description}</div>
      <div className={isOpenClass}>{isOpen ? "Open" : "Closed"}</div>
    </Link>
  ) : (
    <button onClick={onClick} className={className}>
      <div className={titleClass}>{label}</div>
      <div className={descriptionClass}>{description}</div>
      <div className={isOpenClass}>{isOpen ? "Open" : "Closed"}</div>
    </button>
  );
}
