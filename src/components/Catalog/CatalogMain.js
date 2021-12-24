import { useState, useEffect } from "react";

import { getAllMovies } from "../../services/movieServices";

import CatalogNav from "./CatalogNav";
import CatalogItem from "./CatalogItem";
import CatalogLoadMore from "./CatalogLoadMore";

const CatalogMain = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getAllMovies().then((data) => setMovies(data));
  }, []);

  return (
    <div className="catalog catalog--page">
      {movies.length === 0 ? (
        <div className="lds-grid">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : (
        <>
          {" "}
          <div className="container">
            <div className="row">
              <div className="col-12">
                <CatalogNav />
                <div className="row row--grid">
                  {movies.map((m) => (
                    <CatalogItem key={m._id} movie={m} />
                  ))}
                </div>
              </div>
            </div>
            <CatalogLoadMore />
          </div>{" "}
        </>
      )}
    </div>
  );
};

export default CatalogMain;
