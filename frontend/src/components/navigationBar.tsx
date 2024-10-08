import Logo from "@/icons/logo.svg";
import { sanchez } from "@/utils/fonts";
import { useAuth } from "@/contexts/authContext";
import Link from "next/link";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";

export default function NavigationBar() {
  const auth = useAuth();

  return (
    <div className="flex p-4 items-center space-x-4 w-screen h-20 drop-shadow-md border-b-1 border-slate-200 bg-slate-50">
      <Link href="/dashboard">
        <div className="flex items-center space-x-4">
          <Logo alt="Cutequeue logo" height={"40"} fill="white" color="black" />
          <h1 className={`${sanchez.className} text-2xl`}>CuteQueue</h1>
        </div>
      </Link>
      <div className="grow">{/* spacer */}</div>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="text-lg h-full">{auth.user.username}</Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-36 py-2 hover:bg-slate-50 bg-slate-100 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              <button className="w-full">Log out</button>
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
