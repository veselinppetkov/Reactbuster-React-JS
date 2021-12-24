import { Link, useNavigate } from "react-router-dom";

import { useAuthContext } from "../../contexts/AuthContext";

import { loginRequest } from "../../services/authServices";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const loginHandler = (e) => {
    e.preventDefault();

    const { email, password } = Object.fromEntries(new FormData(e.target));

    loginRequest(email, password)
      .then((authData) => {
        login(authData);
        navigate(`/catalog`);
      })
      .catch((err) => alert(err.message));
  };

  const rememberMeHandler = (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      console.log(`It is checked!`);
    } else {
      console.log(`It is not checked!`);
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
              <form className="sign__form" onSubmit={loginHandler}>
                <Link to="/logo" className="sign__logo">
                  <img src="img/logo.png" alt="" />
                </Link>

                <div className="sign__group">
                  <input
                    type="text"
                    name="email"
                    className="sign__input"
                    placeholder="Email"
                    required
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="password"
                    name="password"
                    className="sign__input"
                    placeholder="Password"
                    required
                  />
                </div>

                <div className="sign__group sign__group--checkbox">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    onChange={rememberMeHandler}
                    // checked="checked"
                  />
                  <label htmlFor="remember">Remember Me</label>
                </div>
                <button className="sign__btn" type="submit">
                  Sign in
                </button>
                <span className="sign__delimiter">or</span>
                <span className="sign__text">
                  Don't have an account? <Link to="/register">Sign up!</Link>
                </span>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
