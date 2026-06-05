"use client";

import { Provider } from "react-redux";
import Store from "@/redux/store";
import Context from "@/context/Context";

import MobileMenu from "@/components/Header/MobileMenu";

import HeaderStyleNine from "@/components/Header/HeaderStyle-Nine";
import Separator from "@/components/Common/Separator";
import FooterOne from "@/components/Footer/Footer-One";
import ClassicLms from "@/components/05-classic-lms/05-ClassicLms";

const ClassicLmsPage = ({ getAllBlogs }) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />

          <HeaderStyleNine headerType="" />
          <ClassicLms blogdata={getAllBlogs} />

          <Separator />
          <FooterOne />
        </Context>
      </Provider>
    </>
  );
};

export default ClassicLmsPage;
