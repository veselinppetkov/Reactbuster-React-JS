import { Link, useNavigate } from "react-router-dom";

import { registerRequest } from "../../services/authServices";

const Register = () => {
  const navigate = useNavigate();

  const registerHandler = (e) => {
    e.preventDefault();

    const { email, password, repass } = Object.fromEntries(
      new FormData(e.currentTarget)
    );

    if (password !== repass) {
      alert(`Passwords don't match!`);
      return;
    }

    registerRequest(email, password);
    navigate(`/login`);
  };

  const privacyHandler = (e) => {
    let isChecked = e.target.checked;

    if (!isChecked) {
      alert(`You must read and agree to our Privacy Policy first!`);
    }
  };

  return (
    <div
      className="sign section--full-bg"
      style={{
        backgroundImage: "url(img/bg.jpg)",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="sign__content">
              <form onSubmit={registerHandler} className="sign__form">
                <Link to="/login" className="sign__logo">
                  <img src="img/logo.png" alt="" />
                </Link>
                <div className="sign__group">
                  <input
                    type="text"
                    name="email"
                    className="sign__input"
                    placeholder="Email"
                    pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[a-z])(?=.*[a-z]).*$"
                  />
                </div>
                <div className="sign__group">
                  <input
                    type="password"
                    name="password"
                    className="sign__input"
                    placeholder="Password"
                    pattern="(/(?=^.{5,}$)((?=.*\d)|(?=.*\W+))(?![.\n]).*$/"
                    required
                  />
                </div>
                <div className="sign__group">
                  <input
                    type="password"
                    name="repass"
                    className="sign__input"
                    placeholder="Repeat your password"
                    pattern="(/(?=^.{5,}$)((?=.*\d)|(?=.*\W+))(?![.\n]).*$/"
                    required
                  />
                </div>
                <div className="sign__group sign__group--checkbox">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked
                    onChange={privacyHandler}
                  />
                  <label htmlFor="remember">
                    I agree to the <Link to="/privacy">Privacy Policy</Link>
                  </label>
                </div>
                <button className="sign__btn" type="submit">
                  Sign up
                </button>
                <span className="sign__delimiter">or</span>
                <span className="sign__text">
                  Already have an account? <Link to="/login">Sign in!</Link>
                </span>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
