import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";

import ArtificialGuard from "./components/Common/ArtificialGuard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./components/Home";
import Catalog from "./components/Catalog";
import Login from "./components/Login";
import Register from "./components/Register";
import Details from "./components/Details";
import Error from "./components/Error";
import Create from "./components/Create";
import Edit from "./components/Edit";
import OwnerCatalog from "./components/OwnerCatalog";
import MyProfile from "./components/MyProfile";
import PrivacyPolicy from "./components/PrivacyPolicy";

function App() {
  return (
    <AuthProvider>
      <Header />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<Error />} />
          <Route element={<ArtificialGuard />}>
            <Route path="/edit/:movieId" element={<Edit />} />
            <Route path="/my-movies" element={<OwnerCatalog />} />
            <Route path="/add-movie" element={<Create />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/details/:movieId" element={<Details />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}

export default App;
