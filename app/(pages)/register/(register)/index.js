"use client";

import Register from "@/components/Login/Register";
import Context from "@/context/Context";
import Store from "@/redux/store";
import React from "react";
import { Provider } from "react-redux";

const RegisterPage = () => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <div className="rbt-elements-area bg-color-white rbt-section-gap">
            <div className="container">
              <div className="row gy-5 row--30">
                <div className="col-lg-6">
                  <div className="w-100 h-100 d-flex justify-content-center align-items-center p-4">
                    <img src="/images/paychain/paychain_register.png" alt="PayChain Register" className="w-100 shadow-lg" style={{ objectFit: 'cover', borderRadius: '40px', border: '8px solid white' }} />
                  </div>
                </div>
                <Register />
              </div>
            </div>
          </div>

          </Context>
      </Provider>
    </>
  );
};

export default RegisterPage;
