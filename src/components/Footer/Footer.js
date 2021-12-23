import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-8 col-md-6 col-lg-4 col-xl-3 order-4 order-md-1 order-lg-4 order-xl-1"></div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="footer__content">
              <small className="footer__copyright">
                This template is being used for educational purposes by{" "}
                <Link to="#">Veselin Petkov &copy;</Link>
              </small>
              <small className="footer__copyright">
                Created by <Link to="#">Dmitry Volkov &copy;</Link>
              </small>
              <p className="footer__tagline">
                &copy; Reactbuster
                <br /> SoftUni's ReactJS Retake Exam 2021
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
