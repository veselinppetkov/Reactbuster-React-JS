// import HomeCard from "./HomeCard";
import { getAllMovies } from "../../services/movieServices";
import { useState, useEffect } from "react";
import Popular from "./Popular";
import Category from "../Category";

const Home = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getAllMovies().then((data) => setMovies(data));
  }, []);

  return (
    <>
      {/* <div className="home home--static">
        <div className="home__carousel owl-carousel" id="flixtv-hero">
          {movies.map((m) => (
            <HomeCard key={m._id} movie={m} />
          ))}
        </div>
        <button
          className="home__nav home__nav--prev"
          data-nav="#flixtv-hero"
          type="button"
        ></button>
        <button
          className="home__nav home__nav--next"
          data-nav="#flixtv-hero"
          type="button"
        ></button>
      </div> */}
      <Category />
      <Popular movies={movies} />
    </>
  );
};
export default Home;
