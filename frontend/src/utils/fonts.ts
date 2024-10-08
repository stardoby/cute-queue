import { Sanchez } from "next/font/google";
import { Roboto } from "next/font/google";

const sanchez = Sanchez({ subsets: ["latin"], weight: "400" });
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

export { sanchez, roboto };
