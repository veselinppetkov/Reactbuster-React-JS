import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { getUserMovies } from "../../services/movieServices";
import { useAuthContext } from "../../contexts/AuthContext";

import OwnerCatalogItem from "./OwnerCatalogItem";
import OwnerCatalogLoadMore from "./OwnerCatalogLoadMore";
import OwnerCatalogNav from "./OwnerCatalogNav";
import OwnerCatalogHead from "./OwnerCatalogHead";

const OwnerCatalogMain = () => {
  const { user } = useAuthContext();
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getUserMovies(user._id)
      .then((data) => setMovies(data))
      .catch((err) => alert(err.message));
  }, [user._id]);

  return (
    <>
      {movies.length === 0 ? null : <OwnerCatalogHead />}
      <div className="catalog catalog--page">
        <div className="container">
          <div className="row">
            {movies.length === 0 ? (
              <div className="container">
                <div className="row">
                  <div className="col-12">
                    <div className="page-404__wrap">
                      <div className="page-404__content">
                        <h1 className="page-404__title">OPS...</h1>
                        <p className="page-404__text">
                          You still haven't added a movie
                        </p>
                        <Link to="/add-movie" className="page-404__btn">
                          Add Movie
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-12">
                <OwnerCatalogNav />
                <div className="row row--grid">
                  {movies.map((m) => (
                    <OwnerCatalogItem key={m._id} movie={m} />
                  ))}
                </div>
                <OwnerCatalogLoadMore />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnerCatalogMain;
