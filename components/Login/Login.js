"use client";

import Link from "next/link";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// A colored SVG Google Icon for premium OAuth design
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: "10px", display: "inline-block", verticalAlign: "middle" }}
  >
    <path
      d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z"
      fill="#4285F4"
    />
    <path
      d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
      fill="#34A853"
    />
    <path
      d="M3.96409 10.71C3.78409 10.17 3.68182 9.59727 3.68182 9C3.68182 8.40273 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
      fill="#EA4335"
    />
  </svg>
);

const LoginFormContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams ? searchParams.get("tab") : null;

  const [isRegister, setIsRegister] = useState(tab === "register");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkLogin = () => {
      const logged = localStorage.getItem("user-logged-in") === "true";
      setIsLoggedIn(logged);
    };
    checkLogin();
    window.addEventListener("user-login-status-change", checkLogin);
    return () => {
      window.removeEventListener("user-login-status-change", checkLogin);
    };
  }, []);

  useEffect(() => {
    if (tab === "register") {
      setIsRegister(true);
    } else if (tab === "login") {
      setIsRegister(false);
    }
  }, [tab]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get("con_name");
    const password = data.get("con_email");

    if (email === "admin@paychain.ai" && password === "admin123") {
      localStorage.setItem("user-logged-in", "true");
      window.dispatchEvent(new Event("user-login-status-change"));
      setError("");
      router.push("/instructor-dashboard");
    } else {
      setError("Invalid credentials. Try: admin@paychain.ai / admin123");
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // Simulate signup success and log in the user
    localStorage.setItem("user-logged-in", "true");
    window.dispatchEvent(new Event("user-login-status-change"));
    setError("");
    router.push("/instructor-dashboard");
  };

  const handleLogout = () => {
    localStorage.setItem("user-logged-in", "false");
    window.dispatchEvent(new Event("user-login-status-change"));
    setError("");
  };

  return (
    <div className={`login-card-container ${isRegister ? "register-mode" : ""}`}>
      <div className="row g-0">
        {/* Left Side Welcome Banner: Hidden on mobile/tablet to keep responsive focus on inputs */}
        <div className="col-lg-5 col-md-12 d-none d-lg-block p-0">
          <div className="login-left-banner">
            {/* 3D Floating Circles */}
            <div className="circle-shape circle-1"></div>
            <div className="circle-shape circle-2"></div>
            <div className="circle-shape circle-3"></div>

            <div className="banner-content">
              <span className="banner-tagline">Welcome to</span>
              <h2 className="banner-title">PayChain AI</h2>
              <p className="banner-desc">
                The next generation AI-powered payment platform. Secure, seamless, and intelligent payments for everyone, everywhere.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="col-lg-7 col-md-12 p-0">
          <div className="login-right-form">
            {isLoggedIn ? (
              // LOGGED IN VIEW
              <div className="fade-in-up" key="loggedin" style={{ padding: "40px 10px" }}>
                <div className="form-header">
                  <h3 className="form-title">Welcome Back</h3>
                  <p className="form-subtitle" style={{ fontSize: "16px", color: "var(--color-primary)", fontWeight: "600", marginTop: "10px" }}>
                    Logged in as admin@paychain.ai
                  </p>
                  <p className="form-subtitle" style={{ marginTop: "10px" }}>
                    You have successfully signed in. You can now access your customized dashboard features.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "30px" }}>
                  <Link
                    href="/instructor-dashboard"
                    className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100 justify-content-center align-items-center"
                    style={{ height: "54px", display: "flex" }}
                  >
                    <span className="btn-text">Go to Dashboard</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rbt-btn btn-border w-100 justify-content-center align-items-center"
                    style={{ height: "54px", display: "flex", border: "2px solid var(--color-border)" }}
                  >
                    <span className="btn-text">Log Out</span>
                  </button>
                </div>
              </div>
            ) : !isRegister ? (
              // SIGN IN PANEL
              <div className="fade-in-up" key="signin">
                <div className="form-header">
                  <h3 className="form-title">Sign in</h3>
                  <p className="form-subtitle">Welcome back! Please enter your credentials.</p>
                  <div
                    style={{
                      display: "inline-block",
                      marginTop: "10px",
                      padding: "6px 12px",
                      background: "rgba(47, 87, 239, 0.08)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--color-primary)"
                    }}
                  >
                    Demo Hint: admin@paychain.ai / admin123
                  </div>
                </div>

                {error && (
                  <div
                    style={{
                      color: "var(--color-danger)",
                      background: "rgba(255, 0, 3, 0.08)",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      marginBottom: "20px",
                      border: "1px solid rgba(255, 0, 3, 0.15)"
                    }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit}>
                  {/* Username/Email Input with Icon */}
                  <div className="form-group-with-icon">
                    <input
                      name="con_name"
                      type="text"
                      placeholder="Username or email *"
                      required
                    />
                    <i className="feather-user input-icon"></i>
                  </div>

                  {/* Password Input with Icon & Show Toggle */}
                  <div className="form-group-with-icon">
                    <input
                      name="con_email"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password *"
                      required
                    />
                    <i className="feather-lock input-icon"></i>
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* Actions Row: Remember Me & Forgot Password */}
                  <div className="form-actions-row">
                    <div className="rbt-checkbox">
                      <input type="checkbox" id="rememberme" name="rememberme" />
                      <label htmlFor="rememberme">Remember me</label>
                    </div>
                    <Link className="lost-password-link" href="#">
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <div className="submit-btn-group">
                    <button
                      type="submit"
                      className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Sign In</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </button>
                  </div>

                  <div className="divider-row">
                    <span>Or</span>
                  </div>

                  {/* OAuth Sign In */}
                  <div className="oauth-btn-group">
                    <button type="button" className="oauth-btn">
                      <span className="oauth-icon">
                        <GoogleIcon />
                      </span>
                      Sign in with Google
                    </button>
                  </div>

                  {/* Toggle Link */}
                  <p className="form-footer-toggle">
                    Don't have an account?
                    <span className="toggle-link" onClick={() => setIsRegister(true)}>
                      Sign Up
                    </span>
                  </p>
                </form>
              </div>
            ) : (
              // SIGN UP / REGISTER PANEL
              <div className="fade-in-up" key="signup">
                <div className="form-header">
                  <h3 className="form-title">Sign up</h3>
                  <p className="form-subtitle">Create your account to get started.</p>
                </div>

                <form onSubmit={handleRegisterSubmit}>
                  {/* Username Input with Icon */}
                  <div className="form-group-with-icon">
                    <input
                      name="register_user"
                      type="text"
                      placeholder="Username *"
                      required
                    />
                    <i className="feather-user input-icon"></i>
                  </div>

                  {/* Email Input with Icon */}
                  <div className="form-group-with-icon">
                    <input
                      name="register-email"
                      type="email"
                      placeholder="Email address *"
                      required
                    />
                    <i className="feather-mail input-icon"></i>
                  </div>

                  {/* Password Input with Icon & Show Toggle */}
                  <div className="form-group-with-icon">
                    <input
                      name="register_password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password *"
                      required
                    />
                    <i className="feather-lock input-icon"></i>
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* Confirm Password Input with Icon & Show Toggle */}
                  <div className="form-group-with-icon">
                    <input
                      name="register_conpassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password *"
                      required
                    />
                    <i className="feather-lock input-icon"></i>
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <div className="submit-btn-group">
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

                  <div className="divider-row">
                    <span>Or</span>
                  </div>

                  {/* OAuth Sign Up */}
                  <div className="oauth-btn-group">
                    <button type="button" className="oauth-btn">
                      <span className="oauth-icon">
                        <GoogleIcon />
                      </span>
                      Sign up with Google
                    </button>
                  </div>

                  {/* Toggle Link */}
                  <p className="form-footer-toggle">
                    Already have an account?
                    <span className="toggle-link" onClick={() => setIsRegister(false)}>
                      Sign In
                    </span>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading login form...</div>}>
      <LoginFormContent />
    </Suspense>
  );
};

export default Login;
