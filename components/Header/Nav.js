"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { useState } from "react";

import MenuData from "../../data/MegaMenu.json";

import CourseLayout from "./NavProps/CourseLayout";
import PageLayout from "./NavProps/PageLayout";
import ElementsLayout from "./NavProps/ElementsLayout";

import addImage from "../../public/images/service/mobile-cat.jpg";

const Nav = () => {
  const [activeMenuItem, setActiveMenuItem] = useState(null);

  const pathname = usePathname();

  const isActive = (href) => pathname.startsWith(href);

  const toggleMenuItem = (item) => {
    setActiveMenuItem(activeMenuItem === item ? null : item);
  };

  return (
    <nav className="mainmenu-nav">
      <ul className="mainmenu">
        <li>
          <Link
            className={pathname === "/" ? "active" : ""}
            href="/"
          >
            Home
          </Link>
        </li>


        <li className="has-dropdown has-menu-child-item">
          <Link
            className={`${activeMenuItem === "dashboard" ? "open" : ""}`}
            href="#"
            onClick={() => toggleMenuItem("dashboard")}
          >
            Dashboard
            <i className="feather-chevron-down"></i>
          </Link>
          <ul
            className={`submenu ${
              activeMenuItem === "dashboard" ? "active d-block" : ""
            }`}
          >
            {MenuData &&
              MenuData.menuData.map((data, index) => {
                if (data.menuType === "default-dropdown") {
                  const elements = data.menuItems?.map((value, innerIndex) => (
                    <li className="has-dropdown" key={innerIndex}>
                      <Link href="#">{value.title}</Link>
                      <ul className="submenu">
                        {value.submenuItems?.map(
                          (submenuItem, submenuItemIndex) => (
                            <li key={submenuItemIndex}>
                              <Link
                                className={
                                  isActive(submenuItem.link) ? "active" : ""
                                }
                                href={submenuItem.link}
                              >
                                {submenuItem.title}
                              </Link>
                            </li>
                          )
                        )}
                      </ul>
                    </li>
                  ));
                  return elements;
                }
                return null;
              })}
          </ul>
        </li>
        <li>
          <Link
            className={pathname === "/contact" ? "active" : ""}
            href="/contact"
          >
            Contact Us
          </Link>
        </li>
        <li>
          <Link
            className={pathname === "/about" ? "active" : ""}
            href="/about"
          >
            About
          </Link>
        </li>

      </ul>
    </nav>
  );
};
export default Nav;
