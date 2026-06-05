import BackToTop from "@/app/backToTop";
import RegisterPage from "./(register)";

export const metadata = {
  title: "Register - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const RegisterLayout = () => {
  return (
    <>
      <RegisterPage />
      <BackToTop />
    </>
  );
};

export default RegisterLayout;
