import { sanchez } from "@/utils/fonts";
import HelperListItem from "./helperListItem";

/**
 * <HelperList people="" />
 * Helper List for Home Page
 *
 * Hardcoded the names for ease
 * Waiting for backend integration
 */

type HelperListProps = {
  people?: string; // will change according to data fetched
  isOpen?: boolean;
};

export default function HelperList({ isOpen, people }: HelperListProps) {
  // Hardcoded list of helpers
  const createList = () => {
    const names = ["Test Helper"];
    return names.map((name) => {
      return (
        <HelperListItem key={name} name={name} profile="" isOnline={true} />
      );
    });
  };

  // Message when queue is closed
  const createMessage = () => {
    return <div className="text-gray-300 text-xl">Queue is closed</div>;
  };

  return (
    <div className="flex flex-col items-stretch max-w-xs p-8">
      <div className={`${sanchez.className} text-3xl pb-9`}>
        Helpers On Shift
      </div>
      <div>{isOpen ? createList() : createMessage()}</div>
    </div>
  );
}
