import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { getAllMovies } from "../../services/movieServices";

import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

import PopularCard from "./PopularCard";

const Popular = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getAllMovies()
      .then((data) => setMovies(data))
      .catch((err) => alert(err.message));
  }, []);

  return (
    <section className="section section--pb0">
      <div className="container">
        <div className="row">
          {movies.length === 0 ? (
            <div className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : (
            <>
              <div className="col-12">
                <h2 className="section__title">
                  <Link to="/catalog">Popular</Link>
                </h2>
              </div>
              <div className="col-12">
                <div className="section__carousel-wrap">
                  <OwlCarousel
                    className="section__carousel owl-carousel"
                    items={6}
                    loop
                    autoplay
                    autoplayHoverPause
                    margin={10}
                  >
                    {movies.map((m) => (
                      <PopularCard key={m._id} movie={m} />
                    ))}
                  </OwlCarousel>

                  <button
                    className="section__nav section__nav--cards section__nav--prev"
                    data-nav="#popular"
                    type="button"
                  >
                    <svg
                      width="17"
                      height="15"
                      viewBox="0 0 17 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.25 7.72559L16.25 7.72559"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7.2998 1.70124L1.2498 7.72524L7.2998 13.7502"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="section__nav section__nav--cards section__nav--next"
                    data-nav="#popular"
                    type="button"
                  >
                    <svg
                      width="17"
                      height="15"
                      viewBox="0 0 17 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.75 7.72559L0.75 7.72559"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.7002 1.70124L15.7502 7.72524L9.7002 13.7502"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Popular;
