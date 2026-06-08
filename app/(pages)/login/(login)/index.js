"use client";

import Link from "next/link";
import Login from "@/components/Login/Login";
import Context from "@/context/Context";
import Store from "@/redux/store";
import React from "react";
import { Provider } from "react-redux";

const LoginPage = () => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <div className="login-page-wrapper d-flex align-items-center justify-content-center min-vh-100">
            <Link href="/" className="login-back-home-btn">
              <i className="feather-arrow-left"></i> Back to Home
            </Link>
            <div className="container py-5">
              <Login />
            </div>
          </div>
        </Context>
      </Provider>
    </>
  );
};

export default LoginPage;
