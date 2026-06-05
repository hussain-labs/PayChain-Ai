import Link from "next/link";

import User from "../Offcanvas/User";

const HeaderTopMidThree = ({ flexDirection }) => {
  return (
    <>
      <div className="container">
        <div className={`rbt-header-sec align-items-center ${flexDirection}`}>
          <div className="rbt-header-sec-col rbt-header-left">
            <div className="rbt-header-content">
              <ul className="social-icon social-default icon-naked">
                <li>
                  <Link href="https://www.facebook.com/">
                    <i className="feather-facebook"></i>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.twitter.com/">
                    <i className="feather-twitter"></i>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.linkedin.com/">
                    <i className="feather-linkedin"></i>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.instagram.com/">
                    <i className="feather-instagram"></i>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.youtube.com/">
                    <i className="feather-youtube"></i>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="rbt-header-sec-col rbt-header-center d-none d-md-block">
            <div className="rbt-header-content">
              <div className="header-info">
                <div className="rbt-search-field">
                  <div className="search-field">
                    <input type="text" placeholder="Search Course" />
                    <button className="rbt-round-btn serach-btn" type="submit">
                      <i className="feather-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rbt-header-sec-col rbt-header-right">
            <div className="rbt-header-content">
              <div className="header-info">
                <ul className="quick-access">
                  <li className="account-access rbt-user-wrapper right-align-dropdown d-none d-xl-block">
                    <Link href="#">
                      <i className="feather-user"></i>Admin
                    </Link>
                    <User />
                  </li>

                  <li className="access-icon rbt-user-wrapper right-align-dropdown d-block d-xl-none">
                    <Link className="rbt-round-btn" href="#">
                      <i className="feather-user"></i>
                    </Link>
                    <User />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderTopMidThree;
