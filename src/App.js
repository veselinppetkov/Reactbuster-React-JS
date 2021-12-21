import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import useLocalStorage from "./hooks/useLocalStorage";

import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./components/Home";
import Catalog from "./components/Catalog";
import Login from "./components/Login";
import Register from "./components/Register";
import Details from "./components/Details";
import Error from "./components/Error";
import Create from "./components/Create";
import Edit from "./components/Edit/Edit";
import OwnerCatalog from "./components/OwnerCatalog/OwnerCatalog";

const initialData = {
  accessToken: "",
  email: "",
  _id: "",
};

function App() {
  const [userInfo, setUserInfo] = useLocalStorage("userData", initialData);

  const login = (authData) => {
    setUserInfo(authData);
  };

  return (
    <Router>
      <div id="box">
        <Header email={userInfo.email} />
        <main id="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route
              path="/my-movies"
              element={<OwnerCatalog userId={userInfo._id} />}
            />
            <Route
              path="/add-movie"
              element={<Create token={userInfo.accessToken} />}
            />
            <Route path="/login" element={<Login login={login} />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/details/:movieId"
              element={
                <Details userId={userInfo._id} token={userInfo.accessToken} />
              }
            />
            <Route
              path="/edit/:movieId"
              element={<Edit token={userInfo.accessToken} />}
            />
            <Route path="*" element={<Error />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
