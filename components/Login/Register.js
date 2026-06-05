import Link from "next/link";
import React from "react";

const Register = () => {
  return (
    <>
      <div className="col-lg-6">
        <div className="rbt-contact-form contact-form-style-1 max-width-auto">
          <h3 className="title">Register</h3>
          <form className="max-width-auto">
            <div className="form-group">
              <input
                name="register-email"
                type="email"
                placeholder="Email address *"
              />
              <span className="focus-border"></span>
            </div>

            <div className="form-group">
              <input
                name="register_user"
                type="text"
                placeholder="Username *"
              />
              <span className="focus-border"></span>
            </div>

            <div className="form-group">
              <input
                name="register_password"
                type="password"
                placeholder="Password *"
              />
              <span className="focus-border"></span>
            </div>

            <div className="form-group">
              <input
                name="register_conpassword"
                type="password"
                placeholder="Confirm Password *"
              />
              <span className="focus-border"></span>
            </div>

            <div className="form-submit-group">
              <button
                type="submit"
                className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100"
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">Register</span>
                  <span className="btn-icon">
                    <i className="feather-arrow-right"></i>
                  </span>
                  <span className="btn-icon">
                    <i className="feather-arrow-right"></i>
                  </span>
                </span>
              </button>
            </div>
            
            <div className="mt--20 text-center">
              <p>Already have an account? <Link href="/login" className="color-primary">Login here</Link></p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
