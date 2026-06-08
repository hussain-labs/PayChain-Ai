"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import HeaderTopEight from "./Header-Top/HeaderTop-Eight";
import HeaderTopBar from "./HeaderTopBar/HeaderTopBar";
import HeaderSeven from "./Headers/Header-Seven";
import DarkSwitch from "./dark-switch";
import { useAppContext } from "@/context/Context";

const HeaderStyleTen = ({ headerSticky }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLightTheme, toggleTheme } = useAppContext();

  const isDashboard = pathname && (pathname.startsWith("/instructor-") || pathname.startsWith("/student-"));
  if (isDashboard) {
    return null;
  }

  return (
    <>
      <DarkSwitch isLight={isLightTheme} switchTheme={toggleTheme} />
      <header className="rbt-header rbt-header-10">
        <HeaderSeven
          transparent={headerSticky || "header-not-transparent header-sticky"}
          gapSpaceBetween=""
          navigationEnd="rbt-navigation-end"
          btnClass="rbt-switch-btn btn-gradient btn-sm hover-transform-none"
          btnText="Join Now"
        />
      </header>
    </>
  );
};
export default HeaderStyleTen;

