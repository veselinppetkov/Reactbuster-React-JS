import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuthContext } from "../../contexts/AuthContext";

import { getUserMovies } from "../../services/movieServices";
import { getAllReviews } from "../../services/reviewServices";

import MyProfileMovieCard from "./MyProfileMovieCard";
import MyProfileReviewCard from "./MyProfileReviewCard";

const MyProfileHead = () => {
  const { user } = useAuthContext();
  const [reviews, setReviews] = useState({});
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getUserMovies(user._id)
      .then((data) => setMovies(data))
      .catch((err) => alert(err.message));
  }, [user._id]);

  useEffect(() => {
    getAllReviews()
      .then((data) => {
        const reviews = data.filter((r) => r._ownerId === user._id);
        console.log(reviews);
        setReviews(reviews);
      })
      .catch((err) => alert(err.message));
  }, [user._id]);

  return (
    <div class="catalog catalog--page">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="profile">
              <div class="profile__user">
                <div class="profile__avatar">
                  <img src="img/avatar.svg" alt="" />
                </div>
                <div class="profile__meta">
                  <h3>{user.email}</h3>
                </div>
              </div>

              <ul
                class="nav nav-tabs profile__tabs"
                id="profile__tabs"
                role="tablist"
              >
                <li class="nav-item">
                  <Link
                    class="nav-link active"
                    data-toggle="tab"
                    to="#"
                    role="tab"
                    aria-controls="tab-1"
                    aria-selected="true"
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="tab-content">
          <div class="tab-pane fade show active" id="tab-1" role="tabpanel">
            <div class="row row--grid">
              <div class="col-12 col-xl-6">
                <div class="dashbox">
                  <div class="dashbox__title">
                    <h3>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21,2a1,1,0,0,0-1,1V5H18V3a1,1,0,0,0-2,0V4H8V3A1,1,0,0,0,6,3V5H4V3A1,1,0,0,0,2,3V21a1,1,0,0,0,2,0V19H6v2a1,1,0,0,0,2,0V20h8v1a1,1,0,0,0,2,0V19h2v2a1,1,0,0,0,2,0V3A1,1,0,0,0,21,2ZM6,17H4V15H6Zm0-4H4V11H6ZM6,9H4V7H6Zm10,9H8V13h8Zm0-7H8V6h8Zm4,6H18V15h2Zm0-4H18V11h2Zm0-4H18V7h2Z" />
                      </svg>{" "}
                      Movies added by you
                    </h3>

                    <div class="dashbox__wrap">
                      <Link class="dashbox__refresh" to="#">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M21,11a1,1,0,0,0-1,1,8.05,8.05,0,1,1-2.22-5.5h-2.4a1,1,0,0,0,0,2h4.53a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4.77A10,10,0,1,0,22,12,1,1,0,0,0,21,11Z"></path>
                        </svg>
                      </Link>
                      <Link class="dashbox__more" to="/catalog">
                        View All
                      </Link>
                    </div>
                  </div>

                  <div class="dashbox__table-wrap dashbox__table-wrap--1">
                    <table class="main__table main__table--dash">
                      <thead>
                        <tr>
                          <th>TITLE</th>
                          <th>GENRE</th>
                          <th>RATING</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movies.map((m) => (
                          <MyProfileMovieCard key={m._id} movie={m} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="col-12 col-xl-6">
                <div class="dashbox">
                  <div class="dashbox__title">
                    <h3>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22,9.67A1,1,0,0,0,21.14,9l-5.69-.83L12.9,3a1,1,0,0,0-1.8,0L8.55,8.16,2.86,9a1,1,0,0,0-.81.68,1,1,0,0,0,.25,1l4.13,4-1,5.68A1,1,0,0,0,6.9,21.44L12,18.77l5.1,2.67a.93.93,0,0,0,.46.12,1,1,0,0,0,.59-.19,1,1,0,0,0,.4-1l-1-5.68,4.13-4A1,1,0,0,0,22,9.67Zm-6.15,4a1,1,0,0,0-.29.88l.72,4.2-3.76-2a1.06,1.06,0,0,0-.94,0l-3.76,2,.72-4.2a1,1,0,0,0-.29-.88l-3-3,4.21-.61a1,1,0,0,0,.76-.55L12,5.7l1.88,3.82a1,1,0,0,0,.76.55l4.21.61Z" />
                      </svg>{" "}
                      Your latest reviews
                    </h3>

                    <div class="dashbox__wrap">
                      <Link class="dashbox__refresh" to="#">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M21,11a1,1,0,0,0-1,1,8.05,8.05,0,1,1-2.22-5.5h-2.4a1,1,0,0,0,0,2h4.53a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4.77A10,10,0,1,0,22,12,1,1,0,0,0,21,11Z"></path>
                        </svg>
                      </Link>
                      <Link class="dashbox__more" to="#">
                        View All
                      </Link>
                    </div>
                  </div>

                  <div class="dashbox__table-wrap dashbox__table-wrap--2">
                    <table class="main__table main__table--dash">
                      <thead>
                        <tr>
                          <th>TITLE</th>
                          <th>REVIEWED MOVIE</th>
                          <th>RATING</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.length !== undefined
                          ? reviews.map((r) => (
                              <MyProfileReviewCard key={r._id} review={r} />
                            ))
                          : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MyProfileHead;
