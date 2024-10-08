import { roboto } from "@/utils/fonts";
import Image from "next/image";
//import Profile from "@/icons/profile-pic.svg"; used later
import Open from "@/icons/open-icon.svg";
import Closed from "@/icons/closed-icon.svg";

type HelperListItemProps = {
  name?: string;
  profile?: string;
  isOnline?: boolean;
};

export default function HelperListItem({
  name,
  profile,
  isOnline,
}: HelperListItemProps) {
  // Online Icon is set according to state
  const Icon = isOnline ? Open : Closed;

  return (
    <div className="flex flex-row items-center pb-3">
      <div className={`${roboto.className} text-xl`}>{name}</div>
      <div className="flex grow flex-row pl-4">
        <Icon alt="online status" transform="scale(0.65)" />
      </div>
    </div>
  );
}
