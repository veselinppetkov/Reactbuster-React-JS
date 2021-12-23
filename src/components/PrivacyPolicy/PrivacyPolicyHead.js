import { Link } from "react-router-dom";
const PrivacyPolicyHead = () => {
  return (
    <section className="section section--head section--head-fixed">
      <div className="container">
        <div className="row">
          <div className="col-12 col-xl-6">
            <h1 className="section__title section__title--head">
              Privacy policy
            </h1>
          </div>

          <div className="col-12 col-xl-6">
            <ul className="breadcrumb">
              <li className="breadcrumb__item">
                <Link to="/">Home</Link>
              </li>
              <li className="breadcrumb__item">
                <Link to="/register">Sign Up</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
export default PrivacyPolicyHead;
