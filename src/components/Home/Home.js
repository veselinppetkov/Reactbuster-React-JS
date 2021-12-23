import { getAllMovies } from "../../services/movieServices";
import { useState, useEffect } from "react";
import Popular from "./Popular";
import Category from "../Category";

const Home = () => {
  const [_, setMovies] = useState([]);
  useEffect(() => {
    getAllMovies().then((data) => setMovies(data));
  }, []);

  return (
    <>
      <Category />
      <Popular />
    </>
  );
};
export default Home;
