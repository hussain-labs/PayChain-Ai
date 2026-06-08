import BackToTop from "@/app/backToTop";
import LoginPage from "./(login)";

export const metadata = {
  title: "Login & Register - PayChain AI | Next-Gen AI Payments",
  description: "Sign in or register to access PayChain AI, the next generation AI-powered payment platform.",
};

const LoginLayout = () => {
  return (
    <>
      <LoginPage />
      <BackToTop />
    </>
  );
};

export default LoginLayout;
