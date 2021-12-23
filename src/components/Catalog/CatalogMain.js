import CatalogItem from "./CatalogItem";
import CatalogLoadMore from "./CatalogLoadMore";
import CatalogNav from "./CatalogNav";
import { getAllMovies } from "../../services/movieServices";
import { useState, useEffect } from "react";

const CatalogMain = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getAllMovies().then((data) => setMovies(data));
  }, []);

  if (movies.length === 0) {
    return (
      <div class="lds-grid">
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
    );
  }

  return (
    <div className="catalog catalog--page">
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
      </div>
    </div>
  );
};

export default CatalogMain;
