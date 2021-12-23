import { Link } from "react-router-dom";
const PrivacyPolicyPartners = () => {
  return (
    <div className="section">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="partners owl-carousel">
              <Link to="#" className="partners__img">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/76/Logo_Software_University_%28SoftUni%29_-_blue.png"
                  alt=""
                />
              </Link>
              <Link to="#" className="partners__img">
                <img
                  src="https://i.ibb.co/xJ9Grgw/430-4309307-react-js-transparent-logo-hd-png-download-removebg-preview.png"
                  alt=""
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PrivacyPolicyPartners;
