import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMovieById } from "../../services/movieServices";
import DetailsCard from "./DetailsCard";

const Details = ({ userId, token }) => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState({});

  useEffect(() => {
    getMovieById(movieId).then((data) => {
      console.log(data);
      setMovie(data);
    });
  }, [movieId]);

  return (
    <section className="section section--head section--head-fixed section--gradient section--details-bg">
      <div
        className="section__bg"
        style={{
          background:
            "url(https://behope.church/wp-content/uploads/2021/05/MovieNight-graphic.jpg)",
          backgroundPosition: "center top",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="container">
        <div className="article">
          <div className="row">
            <DetailsCard movie={movie} userId={userId} token={token} />
            {/* <div className="col-12 col-xl-8">
              <video
                controls
                crossOrigin
                playsinline
                poster="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg"
                id="player"
              >
                <source
                  src="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4"
                  type="video/mp4"
                  size="576"
                />
                <source
                  src="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4"
                  type="video/mp4"
                  size="720"
                />
                <source
                  src="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4"
                  type="video/mp4"
                  size="1080"
                />

                <track
                  kind="captions"
                  label="English"
                  srcLang="en"
                  src="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.en.vtt"
                  default
                />
                <track
                  kind="captions"
                  label="Français"
                  srcLang="fr"
                  src="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.fr.vtt"
                />

                <Link
                  to="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4"
                  download
                >
                  Download
                </Link>
              </video>

              <div className="article__actions article__actions--details">
                <div className="article__download">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M21,14a1,1,0,0,0-1,1v4a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V15a1,1,0,0,0-2,0v4a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V15A1,1,0,0,0,21,14Zm-9.71,1.71a1,1,0,0,0,.33.21.94.94,0,0,0,.76,0,1,1,0,0,0,.33-.21l4-4a1,1,0,0,0-1.42-1.42L13,12.59V3a1,1,0,0,0-2,0v9.59l-2.29-2.3a1,1,0,1,0-1.42,1.42Z" />
                  </svg>
                  Download:
                  <Link to="#" download="#">
                    480p
                  </Link>
                  <Link to="#" download="#">
                    720p
                  </Link>
                  <Link to="#" download="#">
                    1080p
                  </Link>
                  <Link to="#" download="#">
                    4k
                  </Link>
                </div>

                <button className="article__favorites" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M16,2H8A3,3,0,0,0,5,5V21a1,1,0,0,0,.5.87,1,1,0,0,0,1,0L12,18.69l5.5,3.18A1,1,0,0,0,18,22a1,1,0,0,0,.5-.13A1,1,0,0,0,19,21V5A3,3,0,0,0,16,2Zm1,17.27-4.5-2.6a1,1,0,0,0-1,0L7,19.27V5A1,1,0,0,1,8,4h8a1,1,0,0,1,1,1Z"></path>
                  </svg>{" "}
                  Add to favorites
                </button>
              </div>
            </div> */}
            {/* 
            <div className="col-12">
              <div className="seriesWrap">
                <h3 className="seriesWrap__title">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M9,10a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V11A1,1,0,0,0,9,10Zm12,1a1,1,0,0,0,1-1V6a1,1,0,0,0-1-1H3A1,1,0,0,0,2,6v4a1,1,0,0,0,1,1,1,1,0,0,1,0,2,1,1,0,0,0-1,1v4a1,1,0,0,0,1,1H21a1,1,0,0,0,1-1V14a1,1,0,0,0-1-1,1,1,0,0,1,0-2ZM20,9.18a3,3,0,0,0,0,5.64V17H10a1,1,0,0,0-2,0H4V14.82A3,3,0,0,0,4,9.18V7H8a1,1,0,0,0,2,0H20Z" />
                  </svg>{" "}
                  1st season
                </h3>
                <div className="section__carouselWrap">
                  <div className="section__series owl-carousel" id="series">
                    <div className="series">
                      <Link to="details.html" className="series__cover">
                        <img src="img/series/1.jpg" alt="" />
                        <span>
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M11 1C16.5228 1 21 5.47716 21 11C21 16.5228 16.5228 21 11 21C5.47716 21 1 16.5228 1 11C1 5.47716 5.47716 1 11 1Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M14.0501 11.4669C13.3211 12.2529 11.3371 13.5829 10.3221 14.0099C10.1601 14.0779 9.74711 14.2219 9.65811 14.2239C9.46911 14.2299 9.28711 14.1239 9.19911 13.9539C9.16511 13.8879 9.06511 13.4569 9.03311 13.2649C8.93811 12.6809 8.88911 11.7739 8.89011 10.8619C8.88911 9.90489 8.94211 8.95489 9.04811 8.37689C9.07611 8.22089 9.15811 7.86189 9.18211 7.80389C9.22711 7.69589 9.30911 7.61089 9.40811 7.55789C9.48411 7.51689 9.57111 7.49489 9.65811 7.49789C9.74711 7.49989 10.1091 7.62689 10.2331 7.67589C11.2111 8.05589 13.2801 9.43389 14.0401 10.2439C14.1081 10.3169 14.2951 10.5129 14.3261 10.5529C14.3971 10.6429 14.4321 10.7519 14.4321 10.8619C14.4321 10.9639 14.4011 11.0679 14.3371 11.1549C14.3041 11.1999 14.1131 11.3999 14.0501 11.4669Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>{" "}
                          56:36
                        </span>
                      </Link>
                      <h3 className="series__title">
                        <Link to="details.html.html">1st series</Link>
                      </h3>
                    </div>

                    <div className="series">
                      <Link to="details.html" className="series__cover">
                        <img src="img/series/2.jpg" alt="" />
                        <span>
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M11 1C16.5228 1 21 5.47716 21 11C21 16.5228 16.5228 21 11 21C5.47716 21 1 16.5228 1 11C1 5.47716 5.47716 1 11 1Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M14.0501 11.4669C13.3211 12.2529 11.3371 13.5829 10.3221 14.0099C10.1601 14.0779 9.74711 14.2219 9.65811 14.2239C9.46911 14.2299 9.28711 14.1239 9.19911 13.9539C9.16511 13.8879 9.06511 13.4569 9.03311 13.2649C8.93811 12.6809 8.88911 11.7739 8.89011 10.8619C8.88911 9.90489 8.94211 8.95489 9.04811 8.37689C9.07611 8.22089 9.15811 7.86189 9.18211 7.80389C9.22711 7.69589 9.30911 7.61089 9.40811 7.55789C9.48411 7.51689 9.57111 7.49489 9.65811 7.49789C9.74711 7.49989 10.1091 7.62689 10.2331 7.67589C11.2111 8.05589 13.2801 9.43389 14.0401 10.2439C14.1081 10.3169 14.2951 10.5129 14.3261 10.5529C14.3971 10.6429 14.4321 10.7519 14.4321 10.8619C14.4321 10.9639 14.4011 11.0679 14.3371 11.1549C14.3041 11.1999 14.1131 11.3999 14.0501 11.4669Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>{" "}
                          58:41
                        </span>
                      </Link>
                      <h3 className="series__title">
                        <Link to="details.html">2nd series</Link>
                      </h3>
                    </div>

                    <div className="series">
                      <Link to="details.html" className="series__cover">
                        <img src="img/series/3.jpg" alt="" />
                        <span>
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M11 1C16.5228 1 21 5.47716 21 11C21 16.5228 16.5228 21 11 21C5.47716 21 1 16.5228 1 11C1 5.47716 5.47716 1 11 1Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M14.0501 11.4669C13.3211 12.2529 11.3371 13.5829 10.3221 14.0099C10.1601 14.0779 9.74711 14.2219 9.65811 14.2239C9.46911 14.2299 9.28711 14.1239 9.19911 13.9539C9.16511 13.8879 9.06511 13.4569 9.03311 13.2649C8.93811 12.6809 8.88911 11.7739 8.89011 10.8619C8.88911 9.90489 8.94211 8.95489 9.04811 8.37689C9.07611 8.22089 9.15811 7.86189 9.18211 7.80389C9.22711 7.69589 9.30911 7.61089 9.40811 7.55789C9.48411 7.51689 9.57111 7.49489 9.65811 7.49789C9.74711 7.49989 10.1091 7.62689 10.2331 7.67589C11.2111 8.05589 13.2801 9.43389 14.0401 10.2439C14.1081 10.3169 14.2951 10.5129 14.3261 10.5529C14.3971 10.6429 14.4321 10.7519 14.4321 10.8619C14.4321 10.9639 14.4011 11.0679 14.3371 11.1549C14.3041 11.1999 14.1131 11.3999 14.0501 11.4669Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>{" "}
                          57:19
                        </span>
                      </Link>
                      <h3 className="series__title">
                        <Link to="details.html">3rd series</Link>
                      </h3>
                    </div>

                    <div className="series">
                      <Link to="details.html" className="series__cover">
                        <img src="img/series/4.jpg" alt="" />
                        <span>
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M11 1C16.5228 1 21 5.47716 21 11C21 16.5228 16.5228 21 11 21C5.47716 21 1 16.5228 1 11C1 5.47716 5.47716 1 11 1Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M14.0501 11.4669C13.3211 12.2529 11.3371 13.5829 10.3221 14.0099C10.1601 14.0779 9.74711 14.2219 9.65811 14.2239C9.46911 14.2299 9.28711 14.1239 9.19911 13.9539C9.16511 13.8879 9.06511 13.4569 9.03311 13.2649C8.93811 12.6809 8.88911 11.7739 8.89011 10.8619C8.88911 9.90489 8.94211 8.95489 9.04811 8.37689C9.07611 8.22089 9.15811 7.86189 9.18211 7.80389C9.22711 7.69589 9.30911 7.61089 9.40811 7.55789C9.48411 7.51689 9.57111 7.49489 9.65811 7.49789C9.74711 7.49989 10.1091 7.62689 10.2331 7.67589C11.2111 8.05589 13.2801 9.43389 14.0401 10.2439C14.1081 10.3169 14.2951 10.5129 14.3261 10.5529C14.3971 10.6429 14.4321 10.7519 14.4321 10.8619C14.4321 10.9639 14.4011 11.0679 14.3371 11.1549C14.3041 11.1999 14.1131 11.3999 14.0501 11.4669Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>{" "}
                          54:58
                        </span>
                      </Link>
                      <h3 className="series__title">
                        <Link to="details.html">4th series</Link>
                      </h3>
                    </div>

                    <div className="series">
                      <Link to="details.html" className="series__cover">
                        <img src="img/series/5.jpg" alt="" />
                        <span>
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M11 1C16.5228 1 21 5.47716 21 11C21 16.5228 16.5228 21 11 21C5.47716 21 1 16.5228 1 11C1 5.47716 5.47716 1 11 1Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M14.0501 11.4669C13.3211 12.2529 11.3371 13.5829 10.3221 14.0099C10.1601 14.0779 9.74711 14.2219 9.65811 14.2239C9.46911 14.2299 9.28711 14.1239 9.19911 13.9539C9.16511 13.8879 9.06511 13.4569 9.03311 13.2649C8.93811 12.6809 8.88911 11.7739 8.89011 10.8619C8.88911 9.90489 8.94211 8.95489 9.04811 8.37689C9.07611 8.22089 9.15811 7.86189 9.18211 7.80389C9.22711 7.69589 9.30911 7.61089 9.40811 7.55789C9.48411 7.51689 9.57111 7.49489 9.65811 7.49789C9.74711 7.49989 10.1091 7.62689 10.2331 7.67589C11.2111 8.05589 13.2801 9.43389 14.0401 10.2439C14.1081 10.3169 14.2951 10.5129 14.3261 10.5529C14.3971 10.6429 14.4321 10.7519 14.4321 10.8619C14.4321 10.9639 14.4011 11.0679 14.3371 11.1549C14.3041 11.1999 14.1131 11.3999 14.0501 11.4669Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>{" "}
                          53:52
                        </span>
                      </Link>
                      <h3 className="series__title">
                        <Link to="details.html">5th series</Link>
                      </h3>
                    </div>

                    <div className="series">
                      <Link to="details.html" className="series__cover">
                        <img src="img/series/6.jpg" alt="" />
                        <span>
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M11 1C16.5228 1 21 5.47716 21 11C21 16.5228 16.5228 21 11 21C5.47716 21 1 16.5228 1 11C1 5.47716 5.47716 1 11 1Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M14.0501 11.4669C13.3211 12.2529 11.3371 13.5829 10.3221 14.0099C10.1601 14.0779 9.74711 14.2219 9.65811 14.2239C9.46911 14.2299 9.28711 14.1239 9.19911 13.9539C9.16511 13.8879 9.06511 13.4569 9.03311 13.2649C8.93811 12.6809 8.88911 11.7739 8.89011 10.8619C8.88911 9.90489 8.94211 8.95489 9.04811 8.37689C9.07611 8.22089 9.15811 7.86189 9.18211 7.80389C9.22711 7.69589 9.30911 7.61089 9.40811 7.55789C9.48411 7.51689 9.57111 7.49489 9.65811 7.49789C9.74711 7.49989 10.1091 7.62689 10.2331 7.67589C11.2111 8.05589 13.2801 9.43389 14.0401 10.2439C14.1081 10.3169 14.2951 10.5129 14.3261 10.5529C14.3971 10.6429 14.4321 10.7519 14.4321 10.8619C14.4321 10.9639 14.4011 11.0679 14.3371 11.1549C14.3041 11.1999 14.1131 11.3999 14.0501 11.4669Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>{" "}
                          59:37
                        </span>
                      </Link>
                      <h3 className="series__title">
                        <Link to="details.html">6th series</Link>
                      </h3>
                    </div>
                  </div>

                  <button
                    className="section__nav section__nav--series section__nav--prev"
                    data-nav="#series"
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
                    className="section__nav section__nav--series section__nav--next"
                    data-nav="#series"
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
            </div> */}
          </div>
          <div className="row">
            <div className="col-12 col-xl-8">
              <div className="comments">
                <ul
                  className="nav nav-tabs comments__title comments__title--tabs"
                  id="comments__tabs"
                  role="tablist"
                >
                  <li className="nav-item">
                    <Link
                      className="nav-link active"
                      data-toggle="tab"
                      to="#tab-1"
                      role="tab"
                      aria-controls="tab-1"
                      aria-selected="true"
                    >
                      <h4>Comments</h4>
                      <span>5</span>
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      data-toggle="tab"
                      to="#tab-2"
                      role="tab"
                      aria-controls="tab-2"
                      aria-selected="false"
                    >
                      <h4>Reviews</h4>
                      <span>3</span>
                    </Link>
                  </li>
                </ul>

                <div className="tab-content">
                  <div
                    className="tab-pane fade show active"
                    id="tab-1"
                    role="tabpanel"
                  >
                    <ul className="comments__list">
                      <li className="comments__item">
                        <div className="comments__autor">
                          <img
                            className="comments__avatar"
                            src="img/avatar.svg"
                            alt=""
                          />
                          <span className="comments__name">Brian Cranston</span>
                          <span className="comments__time">
                            30.08.2021, 17:53
                          </span>
                        </div>
                        <p className="comments__text">
                          There are many variations of passages of Lorem Ipsum
                          available, but the majority have suffered alteration
                          in some form, by injected humour, or randomised words
                          which don't look even slightly believable. If you are
                          going to use a passage of Lorem Ipsum, you need to be
                          sure there isn't anything embarrassing hidden in the
                          middle of text.
                        </p>
                        <div className="comments__actions">
                          <div className="comments__rate">
                            <button type="button">
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11 7.3273V14.6537"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  d="M14.6667 10.9905H7.33333"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.6857 1H6.31429C3.04762 1 1 3.31208 1 6.58516V15.4148C1 18.6879 3.0381 21 6.31429 21H15.6857C18.9619 21 21 18.6879 21 15.4148V6.58516C21 3.31208 18.9619 1 15.6857 1Z"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>{" "}
                              12
                            </button>

                            <button type="button">
                              7{" "}
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6667 10.9905H7.33333"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.6857 1H6.31429C3.04762 1 1 3.31208 1 6.58516V15.4148C1 18.6879 3.0381 21 6.31429 21H15.6857C18.9619 21 21 18.6879 21 15.4148V6.58516C21 3.31208 18.9619 1 15.6857 1Z"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>
                            </button>
                          </div>

                          <button type="button">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="512"
                              height="512"
                              viewBox="0 0 512 512"
                            >
                              <polyline
                                points="400 160 464 224 400 288"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M448,224H154C95.24,224,48,273.33,48,332v20"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                            </svg>
                            <span>Reply</span>
                          </button>
                          <button type="button">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="512"
                              height="512"
                              viewBox="0 0 512 512"
                            >
                              <polyline
                                points="320 120 368 168 320 216"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M352,168H144a80.24,80.24,0,0,0-80,80v16"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <polyline
                                points="192 392 144 344 192 296"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M160,344H368a80.24,80.24,0,0,0,80-80V248"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                            </svg>
                            <span>Quote</span>
                          </button>
                        </div>
                      </li>

                      <li className="comments__item comments__item--answer">
                        <div className="comments__autor">
                          <img
                            className="comments__avatar"
                            src="img/avatar.svg"
                            alt=""
                          />
                          <span className="comments__name">Jesse Plemons</span>
                          <span className="comments__time">
                            24.08.2021, 16:41
                          </span>
                        </div>
                        <p className="comments__text">
                          Lorem Ipsum is simply dummy text of the printing and
                          typesetting industry. Lorem Ipsum has been the
                          industry's standard dummy text ever since the 1500s,
                          when an unknown printer took a galley of type and
                          scrambled it to make a type specimen book.
                        </p>
                        <div className="comments__actions">
                          <div className="comments__rate">
                            <button type="button">
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11 7.3273V14.6537"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  d="M14.6667 10.9905H7.33333"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.6857 1H6.31429C3.04762 1 1 3.31208 1 6.58516V15.4148C1 18.6879 3.0381 21 6.31429 21H15.6857C18.9619 21 21 18.6879 21 15.4148V6.58516C21 3.31208 18.9619 1 15.6857 1Z"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>{" "}
                              10
                            </button>

                            <button type="button">
                              0{" "}
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6667 10.9905H7.33333"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.6857 1H6.31429C3.04762 1 1 3.31208 1 6.58516V15.4148C1 18.6879 3.0381 21 6.31429 21H15.6857C18.9619 21 21 18.6879 21 15.4148V6.58516C21 3.31208 18.9619 1 15.6857 1Z"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>
                            </button>
                          </div>

                          <button type="button">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="512"
                              height="512"
                              viewBox="0 0 512 512"
                            >
                              <polyline
                                points="400 160 464 224 400 288"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M448,224H154C95.24,224,48,273.33,48,332v20"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                            </svg>
                            <span>Reply</span>
                          </button>
                          <button type="button">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="512"
                              height="512"
                              viewBox="0 0 512 512"
                            >
                              <polyline
                                points="320 120 368 168 320 216"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M352,168H144a80.24,80.24,0,0,0-80,80v16"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <polyline
                                points="192 392 144 344 192 296"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M160,344H368a80.24,80.24,0,0,0,80-80V248"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                            </svg>
                            <span>Quote</span>
                          </button>
                        </div>
                      </li>

                      <li className="comments__item comments__item--quote">
                        <div className="comments__autor">
                          <img
                            className="comments__avatar"
                            src="img/avatar.svg"
                            alt=""
                          />
                          <span className="comments__name">Matt Jones</span>
                          <span className="comments__time">
                            11.08.2021, 11:11
                          </span>
                        </div>
                        <p className="comments__text">
                          <span>
                            There are many variations of passages of Lorem Ipsum
                            available, but the majority have suffered alteration
                            in some form, by injected humour, or randomised
                            words which don't look even slightly believable.
                          </span>
                          It has survived not only five centuries, but also the
                          leap into electronic typesetting, remaining
                          essentially unchanged. It was popularised in the 1960s
                          with the release of Letraset sheets containing Lorem
                          Ipsum passages, and more recently with desktop
                          publishing software like Aldus PageMaker including
                          versions of Lorem Ipsum.
                        </p>
                        <div className="comments__actions">
                          <div className="comments__rate">
                            <button type="button">
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11 7.3273V14.6537"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  d="M14.6667 10.9905H7.33333"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.6857 1H6.31429C3.04762 1 1 3.31208 1 6.58516V15.4148C1 18.6879 3.0381 21 6.31429 21H15.6857C18.9619 21 21 18.6879 21 15.4148V6.58516C21 3.31208 18.9619 1 15.6857 1Z"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>{" "}
                              9
                            </button>

                            <button type="button">
                              2{" "}
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6667 10.9905H7.33333"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.6857 1H6.31429C3.04762 1 1 3.31208 1 6.58516V15.4148C1 18.6879 3.0381 21 6.31429 21H15.6857C18.9619 21 21 18.6879 21 15.4148V6.58516C21 3.31208 18.9619 1 15.6857 1Z"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>
                            </button>
                          </div>

                          <button type="button">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="512"
                              height="512"
                              viewBox="0 0 512 512"
                            >
                              <polyline
                                points="400 160 464 224 400 288"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M448,224H154C95.24,224,48,273.33,48,332v20"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                            </svg>
                            <span>Reply</span>
                          </button>
                          <button type="button">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="512"
                              height="512"
                              viewBox="0 0 512 512"
                            >
                              <polyline
                                points="320 120 368 168 320 216"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M352,168H144a80.24,80.24,0,0,0-80,80v16"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <polyline
                                points="192 392 144 344 192 296"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M160,344H368a80.24,80.24,0,0,0,80-80V248"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                            </svg>
                            <span>Quote</span>
                          </button>
                        </div>
                      </li>

                      <li className="comments__item">
                        <div className="comments__autor">
                          <img
                            className="comments__avatar"
                            src="img/avatar.svg"
                            alt=""
                          />
                          <span className="comments__name">Tess Harper</span>
                          <span className="comments__time">
                            07.08.2021, 14:33
                          </span>
                        </div>
                        <p className="comments__text">
                          There are many variations of passages of Lorem Ipsum
                          available, but the majority have suffered alteration
                          in some form, by injected humour, or randomised words
                          which don't look even slightly believable. If you are
                          going to use a passage of Lorem Ipsum, you need to be
                          sure there isn't anything embarrassing hidden in the
                          middle of text.
                        </p>
                        <div className="comments__actions">
                          <div className="comments__rate">
                            <button type="button">
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11 7.3273V14.6537"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  d="M14.6667 10.9905H7.33333"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.6857 1H6.31429C3.04762 1 1 3.31208 1 6.58516V15.4148C1 18.6879 3.0381 21 6.31429 21H15.6857C18.9619 21 21 18.6879 21 15.4148V6.58516C21 3.31208 18.9619 1 15.6857 1Z"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>{" "}
                              7
                            </button>

                            <button type="button">
                              4{" "}
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6667 10.9905H7.33333"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.6857 1H6.31429C3.04762 1 1 3.31208 1 6.58516V15.4148C1 18.6879 3.0381 21 6.31429 21H15.6857C18.9619 21 21 18.6879 21 15.4148V6.58516C21 3.31208 18.9619 1 15.6857 1Z"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>
                            </button>
                          </div>

                          <button type="button">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="512"
                              height="512"
                              viewBox="0 0 512 512"
                            >
                              <polyline
                                points="400 160 464 224 400 288"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M448,224H154C95.24,224,48,273.33,48,332v20"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                            </svg>
                            <span>Reply</span>
                          </button>
                          <button type="button">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="512"
                              height="512"
                              viewBox="0 0 512 512"
                            >
                              <polyline
                                points="320 120 368 168 320 216"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M352,168H144a80.24,80.24,0,0,0-80,80v16"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <polyline
                                points="192 392 144 344 192 296"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M160,344H368a80.24,80.24,0,0,0,80-80V248"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                            </svg>
                            <span>Quote</span>
                          </button>
                        </div>
                      </li>

                      <li className="comments__item">
                        <div className="comments__autor">
                          <img
                            className="comments__avatar"
                            src="img/avatar.svg"
                            alt=""
                          />
                          <span className="comments__name">Jonathan Banks</span>
                          <span className="comments__time">
                            02.08.2021, 15:24
                          </span>
                        </div>
                        <p className="comments__text">
                          Many desktop publishing packages and web page editors
                          now use Lorem Ipsum as their default model text, and a
                          search for 'lorem ipsum' will uncover many web sites
                          still in their infancy. Various versions have evolved
                          over the years, sometimes by accident, sometimes on
                          purpose (injected humour and the like).
                        </p>
                        <div className="comments__actions">
                          <div className="comments__rate">
                            <button type="button">
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11 7.3273V14.6537"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  d="M14.6667 10.9905H7.33333"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.6857 1H6.31429C3.04762 1 1 3.31208 1 6.58516V15.4148C1 18.6879 3.0381 21 6.31429 21H15.6857C18.9619 21 21 18.6879 21 15.4148V6.58516C21 3.31208 18.9619 1 15.6857 1Z"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>{" "}
                              2
                            </button>

                            <button type="button">
                              17{" "}
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6667 10.9905H7.33333"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.6857 1H6.31429C3.04762 1 1 3.31208 1 6.58516V15.4148C1 18.6879 3.0381 21 6.31429 21H15.6857C18.9619 21 21 18.6879 21 15.4148V6.58516C21 3.31208 18.9619 1 15.6857 1Z"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>
                            </button>
                          </div>

                          <button type="button">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="512"
                              height="512"
                              viewBox="0 0 512 512"
                            >
                              <polyline
                                points="400 160 464 224 400 288"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M448,224H154C95.24,224,48,273.33,48,332v20"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                            </svg>
                            <span>Reply</span>
                          </button>
                          <button type="button">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="512"
                              height="512"
                              viewBox="0 0 512 512"
                            >
                              <polyline
                                points="320 120 368 168 320 216"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M352,168H144a80.24,80.24,0,0,0-80,80v16"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <polyline
                                points="192 392 144 344 192 296"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                              <path
                                d="M160,344H368a80.24,80.24,0,0,0,80-80V248"
                                style={{
                                  fill: "none",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: "32px",
                                }}
                              />
                            </svg>
                            <span>Quote</span>
                          </button>
                        </div>
                      </li>
                    </ul>

                    <div className="catalog__paginatorWrap catalog__paginatorWrap--comments">
                      <span className="catalog__pages">5 from 16</span>

                      <ul className="catalog__paginator">
                        <li>
                          <Link to="#">
                            <svg
                              width="14"
                              height="11"
                              viewBox="0 0 14 11"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0.75 5.36475L13.1992 5.36475"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M5.771 10.1271L0.749878 5.36496L5.771 0.602051"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Link>
                        </li>
                        <li className="active">
                          <Link to="#">1</Link>
                        </li>
                        <li>
                          <Link to="#">2</Link>
                        </li>
                        <li>
                          <Link to="#">3</Link>
                        </li>
                        <li>
                          <Link to="#">4</Link>
                        </li>
                        <li>
                          <Link to="#">
                            <svg
                              width="14"
                              height="11"
                              viewBox="0 0 14 11"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13.1992 5.3645L0.75 5.3645"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8.17822 0.602051L13.1993 5.36417L8.17822 10.1271"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <form action="#" className="comments__form">
                      <div className="sign__group">
                        <textarea
                          id="text"
                          name="text"
                          className="sign__textarea"
                          placeholder="Add comment"
                        ></textarea>
                      </div>
                      <button type="button" className="sign__btn">
                        Send
                      </button>
                    </form>
                  </div>

                  <div className="tab-pane fade" id="tab-2" role="tabpanel">
                    <ul className="reviews__list">
                      <li className="reviews__item">
                        <div className="reviews__autor">
                          <img
                            className="reviews__avatar"
                            src="img/avatar.svg"
                            alt=""
                          />
                          <span className="reviews__name">
                            Best Marvel movie in my opinion
                          </span>
                          <span className="reviews__time">
                            24.08.2021, 17:53 by Jonathan Banks
                          </span>
                          <span className="reviews__rating">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22,9.67A1,1,0,0,0,21.14,9l-5.69-.83L12.9,3a1,1,0,0,0-1.8,0L8.55,8.16,2.86,9a1,1,0,0,0-.81.68,1,1,0,0,0,.25,1l4.13,4-1,5.68A1,1,0,0,0,6.9,21.44L12,18.77l5.1,2.67a.93.93,0,0,0,.46.12,1,1,0,0,0,.59-.19,1,1,0,0,0,.4-1l-1-5.68,4.13-4A1,1,0,0,0,22,9.67Zm-6.15,4a1,1,0,0,0-.29.88l.72,4.2-3.76-2a1.06,1.06,0,0,0-.94,0l-3.76,2,.72-4.2a1,1,0,0,0-.29-.88l-3-3,4.21-.61a1,1,0,0,0,.76-.55L12,5.7l1.88,3.82a1,1,0,0,0,.76.55l4.21.61Z" />
                            </svg>{" "}
                            10
                          </span>
                        </div>
                        <p className="reviews__text">
                          There are many variations of passages of Lorem Ipsum
                          available, but the majority have suffered alteration
                          in some form, by injected humour, or randomised words
                          which don't look even slightly believable. If you are
                          going to use a passage of Lorem Ipsum, you need to be
                          sure there isn't anything embarrassing hidden in the
                          middle of text.
                        </p>
                      </li>

                      <li className="reviews__item">
                        <div className="reviews__autor">
                          <img
                            className="reviews__avatar"
                            src="img/avatar.svg"
                            alt=""
                          />
                          <span className="reviews__name">
                            Best Marvel movie in my opinion
                          </span>
                          <span className="reviews__time">
                            24.08.2021, 17:53 by Jesse Plemons
                          </span>
                          <span className="reviews__rating">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22,9.67A1,1,0,0,0,21.14,9l-5.69-.83L12.9,3a1,1,0,0,0-1.8,0L8.55,8.16,2.86,9a1,1,0,0,0-.81.68,1,1,0,0,0,.25,1l4.13,4-1,5.68A1,1,0,0,0,6.9,21.44L12,18.77l5.1,2.67a.93.93,0,0,0,.46.12,1,1,0,0,0,.59-.19,1,1,0,0,0,.4-1l-1-5.68,4.13-4A1,1,0,0,0,22,9.67Zm-6.15,4a1,1,0,0,0-.29.88l.72,4.2-3.76-2a1.06,1.06,0,0,0-.94,0l-3.76,2,.72-4.2a1,1,0,0,0-.29-.88l-3-3,4.21-.61a1,1,0,0,0,.76-.55L12,5.7l1.88,3.82a1,1,0,0,0,.76.55l4.21.61Z" />
                            </svg>{" "}
                            8.0
                          </span>
                        </div>
                        <p className="reviews__text">
                          There are many variations of passages of Lorem Ipsum
                          available, but the majority have suffered alteration
                          in some form, by injected humour, or randomised words
                          which don't look even slightly believable. If you are
                          going to use a passage of Lorem Ipsum, you need to be
                          sure there isn't anything embarrassing hidden in the
                          middle of text.
                        </p>
                      </li>

                      <li className="reviews__item">
                        <div className="reviews__autor">
                          <img
                            className="reviews__avatar"
                            src="img/avatar.svg"
                            alt=""
                          />
                          <span className="reviews__name">
                            Best Marvel movie in my opinion
                          </span>
                          <span className="reviews__time">
                            24.08.2021, 17:53 by Charles Baker
                          </span>
                          <span className="reviews__rating">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22,9.67A1,1,0,0,0,21.14,9l-5.69-.83L12.9,3a1,1,0,0,0-1.8,0L8.55,8.16,2.86,9a1,1,0,0,0-.81.68,1,1,0,0,0,.25,1l4.13,4-1,5.68A1,1,0,0,0,6.9,21.44L12,18.77l5.1,2.67a.93.93,0,0,0,.46.12,1,1,0,0,0,.59-.19,1,1,0,0,0,.4-1l-1-5.68,4.13-4A1,1,0,0,0,22,9.67Zm-6.15,4a1,1,0,0,0-.29.88l.72,4.2-3.76-2a1.06,1.06,0,0,0-.94,0l-3.76,2,.72-4.2a1,1,0,0,0-.29-.88l-3-3,4.21-.61a1,1,0,0,0,.76-.55L12,5.7l1.88,3.82a1,1,0,0,0,.76.55l4.21.61Z" />
                            </svg>{" "}
                            9.0
                          </span>
                        </div>
                        <p className="reviews__text">
                          There are many variations of passages of Lorem Ipsum
                          available, but the majority have suffered alteration
                          in some form, by injected humour, or randomised words
                          which don't look even slightly believable. If you are
                          going to use a passage of Lorem Ipsum, you need to be
                          sure there isn't anything embarrassing hidden in the
                          middle of text.
                        </p>
                      </li>
                    </ul>

                    <form action="#" className="reviews__form">
                      <div className="row">
                        <div className="col-12 col-md-9 col-lg-10 col-xl-9">
                          <div className="sign__group">
                            <input
                              type="text"
                              name="title"
                              className="sign__input"
                              placeholder="Title"
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-3 col-lg-2 col-xl-3">
                          <div className="sign__group">
                            <select
                              name="select"
                              id="select"
                              className="sign__select"
                            >
                              <option value="0">Rating</option>
                              <option value="10">10</option>
                              <option value="9">9</option>
                              <option value="8">8</option>
                              <option value="7">7</option>
                              <option value="6">6</option>
                              <option value="5">5</option>
                              <option value="4">4</option>
                              <option value="3">3</option>
                              <option value="2">2</option>
                              <option value="1">1</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="sign__group">
                            <textarea
                              id="text2"
                              name="text2"
                              className="sign__textarea"
                              placeholder="Add review"
                            ></textarea>
                          </div>
                        </div>

                        <div className="col-12">
                          <button type="button" className="sign__btn">
                            Send
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="col-12 col-xl-4">
              <div className="sidebar sidebar--mt">
                <div className="row">
                  <div className="col-12">
                    <form action="#" className="subscribe">
                      <div className="subscribe__img">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M13.64,9.74l-.29,1.73A1.55,1.55,0,0,0,14,13a1.46,1.46,0,0,0,1.58.09L17,12.28l1.44.79A1.46,1.46,0,0,0,20,13a1.55,1.55,0,0,0,.63-1.51l-.29-1.73,1.2-1.22a1.54,1.54,0,0,0-.85-2.6l-1.62-.24-.73-1.55a1.5,1.5,0,0,0-2.72,0l-.73,1.55-1.62.24a1.54,1.54,0,0,0-.85,2.6Zm1.83-2.13a1.51,1.51,0,0,0,1.14-.85L17,5.93l.39.83a1.55,1.55,0,0,0,1.14.86l1,.14-.73.74a1.57,1.57,0,0,0-.42,1.34l.16,1-.79-.43a1.48,1.48,0,0,0-1.44,0l-.79.43.16-1a1.54,1.54,0,0,0-.42-1.33l-.73-.75ZM21,15.26a1,1,0,0,0-1,1v3a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V9.67l5.88,5.88a2.94,2.94,0,0,0,2.1.88l.27,0a1,1,0,0,0,.91-1.08,1,1,0,0,0-1.09-.91.94.94,0,0,1-.77-.28L5.41,8.26H9a1,1,0,0,0,0-2H5a3,3,0,0,0-3,3v10a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3v-3A1,1,0,0,0,21,15.26Z" />
                        </svg>
                      </div>
                      <h4 className="subscribe__title">Notifications</h4>
                      <p className="subscribe__text">
                        Subscribe to notifications about new episodes
                      </p>
                      <div className="sign__group">
                        <input
                          type="text"
                          className="sign__input"
                          placeholder="Email"
                        />
                      </div>
                      <button type="button" className="sign__btn">
                        Send
                      </button>
                    </form>
                  </div>
                </div>

                <div className="row row--grid">
                  <div className="col-12">
                    <h5 className="sidebar__title">New items</h5>
                  </div>

                  <div className="col-6 col-sm-4 col-md-3 col-xl-6">
                    <div className="card">
                      <Link to="details.html" className="card__cover">
                        <img src="img/card/1.png" alt="" />
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11 1C16.5228 1 21 5.47716 21 11C21 16.5228 16.5228 21 11 21C5.47716 21 1 16.5228 1 11C1 5.47716 5.47716 1 11 1Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.0501 11.4669C13.3211 12.2529 11.3371 13.5829 10.3221 14.0099C10.1601 14.0779 9.74711 14.2219 9.65811 14.2239C9.46911 14.2299 9.28711 14.1239 9.19911 13.9539C9.16511 13.8879 9.06511 13.4569 9.03311 13.2649C8.93811 12.6809 8.88911 11.7739 8.89011 10.8619C8.88911 9.90489 8.94211 8.95489 9.04811 8.37689C9.07611 8.22089 9.15811 7.86189 9.18211 7.80389C9.22711 7.69589 9.30911 7.61089 9.40811 7.55789C9.48411 7.51689 9.57111 7.49489 9.65811 7.49789C9.74711 7.49989 10.1091 7.62689 10.2331 7.67589C11.2111 8.05589 13.2801 9.43389 14.0401 10.2439C14.1081 10.3169 14.2951 10.5129 14.3261 10.5529C14.3971 10.6429 14.4321 10.7519 14.4321 10.8619C14.4321 10.9639 14.4011 11.0679 14.3371 11.1549C14.3041 11.1999 14.1131 11.3999 14.0501 11.4669Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                      <button className="card__add" type="button">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M16,2H8A3,3,0,0,0,5,5V21a1,1,0,0,0,.5.87,1,1,0,0,0,1,0L12,18.69l5.5,3.18A1,1,0,0,0,18,22a1,1,0,0,0,.5-.13A1,1,0,0,0,19,21V5A3,3,0,0,0,16,2Zm1,17.27-4.5-2.6a1,1,0,0,0-1,0L7,19.27V5A1,1,0,0,1,8,4h8a1,1,0,0,1,1,1Z" />
                        </svg>
                      </button>
                      <span className="card__rating">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M22,9.67A1,1,0,0,0,21.14,9l-5.69-.83L12.9,3a1,1,0,0,0-1.8,0L8.55,8.16,2.86,9a1,1,0,0,0-.81.68,1,1,0,0,0,.25,1l4.13,4-1,5.68A1,1,0,0,0,6.9,21.44L12,18.77l5.1,2.67a.93.93,0,0,0,.46.12,1,1,0,0,0,.59-.19,1,1,0,0,0,.4-1l-1-5.68,4.13-4A1,1,0,0,0,22,9.67Zm-6.15,4a1,1,0,0,0-.29.88l.72,4.2-3.76-2a1.06,1.06,0,0,0-.94,0l-3.76,2,.72-4.2a1,1,0,0,0-.29-.88l-3-3,4.21-.61a1,1,0,0,0,.76-.55L12,5.7l1.88,3.82a1,1,0,0,0,.76.55l4.21.61Z" />
                        </svg>{" "}
                        8.3
                      </span>
                      <h3 className="card__title">
                        <Link to="details.html">The Good Lord Bird</Link>
                      </h3>
                      <ul className="card__list">
                        <li>Free</li>
                        <li>Action</li>
                        <li>2019</li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-6 col-sm-4 col-md-3 col-xl-6">
                    <div className="card">
                      <Link to="details.html" className="card__cover">
                        <img src="img/card/2.png" alt="" />
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11 1C16.5228 1 21 5.47716 21 11C21 16.5228 16.5228 21 11 21C5.47716 21 1 16.5228 1 11C1 5.47716 5.47716 1 11 1Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.0501 11.4669C13.3211 12.2529 11.3371 13.5829 10.3221 14.0099C10.1601 14.0779 9.74711 14.2219 9.65811 14.2239C9.46911 14.2299 9.28711 14.1239 9.19911 13.9539C9.16511 13.8879 9.06511 13.4569 9.03311 13.2649C8.93811 12.6809 8.88911 11.7739 8.89011 10.8619C8.88911 9.90489 8.94211 8.95489 9.04811 8.37689C9.07611 8.22089 9.15811 7.86189 9.18211 7.80389C9.22711 7.69589 9.30911 7.61089 9.40811 7.55789C9.48411 7.51689 9.57111 7.49489 9.65811 7.49789C9.74711 7.49989 10.1091 7.62689 10.2331 7.67589C11.2111 8.05589 13.2801 9.43389 14.0401 10.2439C14.1081 10.3169 14.2951 10.5129 14.3261 10.5529C14.3971 10.6429 14.4321 10.7519 14.4321 10.8619C14.4321 10.9639 14.4011 11.0679 14.3371 11.1549C14.3041 11.1999 14.1131 11.3999 14.0501 11.4669Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                      <button className="card__add" type="button">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M16,2H8A3,3,0,0,0,5,5V21a1,1,0,0,0,.5.87,1,1,0,0,0,1,0L12,18.69l5.5,3.18A1,1,0,0,0,18,22a1,1,0,0,0,.5-.13A1,1,0,0,0,19,21V5A3,3,0,0,0,16,2Zm1,17.27-4.5-2.6a1,1,0,0,0-1,0L7,19.27V5A1,1,0,0,1,8,4h8a1,1,0,0,1,1,1Z" />
                        </svg>
                      </button>
                      <span className="card__rating">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M22,9.67A1,1,0,0,0,21.14,9l-5.69-.83L12.9,3a1,1,0,0,0-1.8,0L8.55,8.16,2.86,9a1,1,0,0,0-.81.68,1,1,0,0,0,.25,1l4.13,4-1,5.68A1,1,0,0,0,6.9,21.44L12,18.77l5.1,2.67a.93.93,0,0,0,.46.12,1,1,0,0,0,.59-.19,1,1,0,0,0,.4-1l-1-5.68,4.13-4A1,1,0,0,0,22,9.67Zm-6.15,4a1,1,0,0,0-.29.88l.72,4.2-3.76-2a1.06,1.06,0,0,0-.94,0l-3.76,2,.72-4.2a1,1,0,0,0-.29-.88l-3-3,4.21-.61a1,1,0,0,0,.76-.55L12,5.7l1.88,3.82a1,1,0,0,0,.76.55l4.21.61Z" />
                        </svg>{" "}
                        8.1
                      </span>
                      <h3 className="card__title">
                        <Link to="details.html">The Dictator</Link>
                      </h3>
                      <ul className="card__list">
                        <li>Free</li>
                        <li>Comedy</li>
                        <li>2012</li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-6 col-sm-4 col-md-3 col-xl-6">
                    <div className="card">
                      <Link to="details.html" className="card__cover">
                        <img src="img/card/3.png" alt="" />
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11 1C16.5228 1 21 5.47716 21 11C21 16.5228 16.5228 21 11 21C5.47716 21 1 16.5228 1 11C1 5.47716 5.47716 1 11 1Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.0501 11.4669C13.3211 12.2529 11.3371 13.5829 10.3221 14.0099C10.1601 14.0779 9.74711 14.2219 9.65811 14.2239C9.46911 14.2299 9.28711 14.1239 9.19911 13.9539C9.16511 13.8879 9.06511 13.4569 9.03311 13.2649C8.93811 12.6809 8.88911 11.7739 8.89011 10.8619C8.88911 9.90489 8.94211 8.95489 9.04811 8.37689C9.07611 8.22089 9.15811 7.86189 9.18211 7.80389C9.22711 7.69589 9.30911 7.61089 9.40811 7.55789C9.48411 7.51689 9.57111 7.49489 9.65811 7.49789C9.74711 7.49989 10.1091 7.62689 10.2331 7.67589C11.2111 8.05589 13.2801 9.43389 14.0401 10.2439C14.1081 10.3169 14.2951 10.5129 14.3261 10.5529C14.3971 10.6429 14.4321 10.7519 14.4321 10.8619C14.4321 10.9639 14.4011 11.0679 14.3371 11.1549C14.3041 11.1999 14.1131 11.3999 14.0501 11.4669Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                      <button className="card__add" type="button">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M16,2H8A3,3,0,0,0,5,5V21a1,1,0,0,0,.5.87,1,1,0,0,0,1,0L12,18.69l5.5,3.18A1,1,0,0,0,18,22a1,1,0,0,0,.5-.13A1,1,0,0,0,19,21V5A3,3,0,0,0,16,2Zm1,17.27-4.5-2.6a1,1,0,0,0-1,0L7,19.27V5A1,1,0,0,1,8,4h8a1,1,0,0,1,1,1Z" />
                        </svg>
                      </button>
                      <span className="card__rating">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M22,9.67A1,1,0,0,0,21.14,9l-5.69-.83L12.9,3a1,1,0,0,0-1.8,0L8.55,8.16,2.86,9a1,1,0,0,0-.81.68,1,1,0,0,0,.25,1l4.13,4-1,5.68A1,1,0,0,0,6.9,21.44L12,18.77l5.1,2.67a.93.93,0,0,0,.46.12,1,1,0,0,0,.59-.19,1,1,0,0,0,.4-1l-1-5.68,4.13-4A1,1,0,0,0,22,9.67Zm-6.15,4a1,1,0,0,0-.29.88l.72,4.2-3.76-2a1.06,1.06,0,0,0-.94,0l-3.76,2,.72-4.2a1,1,0,0,0-.29-.88l-3-3,4.21-.61a1,1,0,0,0,.76-.55L12,5.7l1.88,3.82a1,1,0,0,0,.76.55l4.21.61Z" />
                        </svg>{" "}
                        7.9
                      </span>
                      <h3 className="card__title">
                        <Link to="details.html">12 Years a Slave</Link>
                      </h3>
                      <ul className="card__list">
                        <li>Free</li>
                        <li>History</li>
                        <li>2013</li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-6 col-sm-4 col-md-3 col-xl-6">
                    <div className="card">
                      <Link to="details.html" className="card__cover">
                        <img src="img/card/4.png" alt="" />
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11 1C16.5228 1 21 5.47716 21 11C21 16.5228 16.5228 21 11 21C5.47716 21 1 16.5228 1 11C1 5.47716 5.47716 1 11 1Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.0501 11.4669C13.3211 12.2529 11.3371 13.5829 10.3221 14.0099C10.1601 14.0779 9.74711 14.2219 9.65811 14.2239C9.46911 14.2299 9.28711 14.1239 9.19911 13.9539C9.16511 13.8879 9.06511 13.4569 9.03311 13.2649C8.93811 12.6809 8.88911 11.7739 8.89011 10.8619C8.88911 9.90489 8.94211 8.95489 9.04811 8.37689C9.07611 8.22089 9.15811 7.86189 9.18211 7.80389C9.22711 7.69589 9.30911 7.61089 9.40811 7.55789C9.48411 7.51689 9.57111 7.49489 9.65811 7.49789C9.74711 7.49989 10.1091 7.62689 10.2331 7.67589C11.2111 8.05589 13.2801 9.43389 14.0401 10.2439C14.1081 10.3169 14.2951 10.5129 14.3261 10.5529C14.3971 10.6429 14.4321 10.7519 14.4321 10.8619C14.4321 10.9639 14.4011 11.0679 14.3371 11.1549C14.3041 11.1999 14.1131 11.3999 14.0501 11.4669Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                      <button className="card__add" type="button">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M16,2H8A3,3,0,0,0,5,5V21a1,1,0,0,0,.5.87,1,1,0,0,0,1,0L12,18.69l5.5,3.18A1,1,0,0,0,18,22a1,1,0,0,0,.5-.13A1,1,0,0,0,19,21V5A3,3,0,0,0,16,2Zm1,17.27-4.5-2.6a1,1,0,0,0-1,0L7,19.27V5A1,1,0,0,1,8,4h8a1,1,0,0,1,1,1Z" />
                        </svg>
                      </button>
                      <span className="card__rating">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M22,9.67A1,1,0,0,0,21.14,9l-5.69-.83L12.9,3a1,1,0,0,0-1.8,0L8.55,8.16,2.86,9a1,1,0,0,0-.81.68,1,1,0,0,0,.25,1l4.13,4-1,5.68A1,1,0,0,0,6.9,21.44L12,18.77l5.1,2.67a.93.93,0,0,0,.46.12,1,1,0,0,0,.59-.19,1,1,0,0,0,.4-1l-1-5.68,4.13-4A1,1,0,0,0,22,9.67Zm-6.15,4a1,1,0,0,0-.29.88l.72,4.2-3.76-2a1.06,1.06,0,0,0-.94,0l-3.76,2,.72-4.2a1,1,0,0,0-.29-.88l-3-3,4.21-.61a1,1,0,0,0,.76-.55L12,5.7l1.88,3.82a1,1,0,0,0,.76.55l4.21.61Z" />
                        </svg>{" "}
                        8.8
                      </span>
                      <h3 className="card__title">
                        <Link to="details.html">Get On Up</Link>
                      </h3>
                      <ul className="card__list">
                        <li>Free</li>
                        <li>Biography</li>
                        <li>2014</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Details;
