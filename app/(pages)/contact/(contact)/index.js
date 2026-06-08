"use client";

import { Provider } from "react-redux";
import Store from "@/redux/store";
import Context from "@/context/Context";

import Contact from "@/components/Contacts/Contact";
import ContactForm from "@/components/Contacts/Contact-Form";
import HeaderStyleTen from "@/components/Header/HeaderStyle-Ten";
import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import FooterOne from "@/components/Footer/Footer-One";
import Link from "next/link";
import CourseLessonProp from "@/components/11-single-course/CourseLessonProp";
import SingleCourseData from "@/data/pages/11-singleCourse.json";
import courseImg from "@/public/images/course/course-content.jpg";

const ContactPage = () => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <HeaderStyleTen headerSticky="rbt-sticky" headerType="" />
          <MobileMenu />
          <Cart />

          <div className="rbt-conatct-area bg-gradient-11 rbt-section-gap">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="section-title text-center mb--60">
                    <span className="subtitle bg-secondary-opacity">
                      Contact Us
                    </span>
                    <h2 className="title">
                      Histudy Course Contact <br /> can join with us.
                    </h2>
                  </div>
                </div>
              </div>
              <Contact />
            </div>
          </div>

          <ContactForm gap="rbt-section-gap" />

          <div
            className="rbt-course-content rbt-section-gap bg-color-extra2"
            id="faq"
          >
            <div className="container">
              <div className="row align-items-end mb--60">
                <div className="col-lg-6 col-md-6">
                  <div className="section-title text-start">
                    <h2 className="title">Frequently Asked Questions</h2>
                    <p className="description has-small-font-size mt--10">
                      Find answers to all your queries here.
                    </p>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="expend-button text-start text-md-end">
                    <Link className="rbt-btn-link w-700" href="#">
                      Expand all FAQ<i className="feather-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="row gy-5 row--30">
                <CourseLessonProp
                  courseImg={courseImg}
                  courseContent={SingleCourseData.courseContent}
                />
              </div>
            </div>
          </div>

          <div className="rbt-google-map bg-color-white rbt-section-gapTop">
            <iframe
              className="w-100"
              src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d2965.0824050173574!2d-93.63905729999999!3d41.998507000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sWebFilings%2C+University+Boulevard%2C+Ames%2C+IA!5e0!3m2!1sen!2sus!4v1390839289319"
              height="600"
              style={{ border: "0" }}
            ></iframe>
          </div>

          <FooterOne />
        </Context>
      </Provider>
    </>
  );
};

export default ContactPage;
