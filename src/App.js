import { AuthProvider } from "./contexts/AuthContext";
import { Routes, Route } from "react-router-dom";

import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./components/Home";
import Catalog from "./components/Catalog";
import Login from "./components/Login";
import Register from "./components/Register";
import Details from "./components/Details";
import ErrorBoundary from "./components/ErrorBoundary";
import Create from "./components/Create";
import Edit from "./components/Edit";
import OwnerCatalog from "./components/OwnerCatalog";

function App() {
  return (
    <AuthProvider>
      <div id="box">
        <Header />
        <main id="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/my-movies" element={<OwnerCatalog />} />
            <Route path="/add-movie" element={<Create />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/details/:movieId" element={<Details />} />
            <Route path="/edit/:movieId" element={<Edit />} />
            <Route path="*" element={<ErrorBoundary />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
