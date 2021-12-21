import OwnerCatalogItem from "./OwnerCatalogItem";
import OwnerCatalogLoadMore from "./OwnerCatalogLoadMore";
import OwnerCatalogNav from "./OwnerCatalogNav";
import { getUserMovies } from "../../services/movieServices";
import { useState, useEffect } from "react";

const OwnerCatalogMain = ({ userId }) => {
  const [movies, setMovies] = useState([]);
  console.log(userId);

  useEffect(() => {
    getUserMovies(userId).then((data) => setMovies(data));
  }, []);

  return (
    <div className="catalog catalog--page">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <OwnerCatalogNav />
            <div className="row row--grid">
              {movies.map((m) => (
                <OwnerCatalogItem key={m._id} movie={m} />
              ))}
            </div>
          </div>
        </div>
        <OwnerCatalogLoadMore />
      </div>
    </div>
  );
};

export default OwnerCatalogMain;
