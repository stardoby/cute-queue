import noop from "@/utils/noop";
import Image from "next/image";
import Plus from "@/icons/plus.svg";

/**
  <AddCourse
    type="primary"
    className=""
    href=""
  />
  Add Course Item component for dashboard
 */

type AddCourseProps = {
  type?: "primary";
  className?: string;
  onClick?: () => void;
};

export default function AddCourse({
  className: extraClassName = "",
  type = "primary",
  onClick = noop,
}: AddCourseProps) {
  const colors = {
    primary: "bg-white focus:ring-queuegreen focus:ring-offset-white",
  };

  const box = `rounded-lg m-3 border-dotted border-queuegreen border-2 w-80 h-56 px-8 py-6 relative`;
  const hover = `hover:bg-neutral-100`;
  const flex = `flex flex-col justify-center items-center gap-4`;
  const ring = `focus:outline-none focus:ring-2 focus:ring-offset-2`;
  const className = `${box} ${hover} ${flex} ${ring} ${colors[type]}`;

  return (
    <button onClick={onClick} className={className}>
      <Plus />
      <div className="font-medium text-xl text-queuegreen text-center">
        Add Course
      </div>
    </button>
  );
}
