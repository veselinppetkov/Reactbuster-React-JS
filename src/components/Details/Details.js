import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { getMovieById } from "../../services/movieServices";
import { getAllReviews, postReview } from "../../services/reviewServices";
import { useAuthContext } from "../../contexts/AuthContext";

import DetailsCard from "./DetailsCard";
import ReviewItem from "./ReviewItem";

const Details = () => {
  const { user, isAuthenticated } = useAuthContext();
  const { movieId } = useParams();

  const [movie, setMovie] = useState({});
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    getMovieById(movieId).then((data) => {
      setMovie(data);
    });
  }, [movieId]);

  useEffect(() => {
    getAllReviews().then((data) => {
      const reviews = data.filter((r) => r._movieId === movieId);
      setReviews(reviews);
    });
  }, []);

  const reviewHandler = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const { title, rating, content } = Object.fromEntries(new FormData(form));

    const reviewData = {
      title,
      rating,
      content,
      _movieId: movieId,
      _ownerId: user._id,
      _ownerEmail: user.email,
    };

    postReview(reviewData, user.accessToken).then((data) => {
      setReviews([...reviews, data]);
      form.reset();
    });
  };

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
            <DetailsCard movie={movie} />
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
                      className="nav-link"
                      data-toggle="tab"
                      to="#tab-2"
                      role="tab"
                      aria-controls="tab-2"
                      aria-selected="false"
                    >
                      <h4>Reviews</h4>
                      <span>{reviews ? reviews.length + 1 : 1}</span>
                    </Link>
                  </li>
                </ul>

                <div className="tab-content">
                  <div
                    className="tab-pane fade show active"
                    id="tab-1"
                    role="tabpanel"
                  >
                    <ul className="reviews__list">
                      <li className="reviews__item" id="hardCoded-review">
                        <div className="reviews__autor">
                          <img
                            className="reviews__avatar"
                            src="https://bit.ly/3EqA0oL"
                            alt=""
                          />
                          <span className="reviews__name">
                            What a movie, guys!
                          </span>
                          <span className="reviews__time">
                            Fri, 19 Mar 2021 13:57:33 GMT by user@userov.bg
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
                      {reviews && reviews.length > 0
                        ? reviews.map((r) => (
                            <ReviewItem
                              key={r._id}
                              review={r}
                              isAuthenticated={isAuthenticated}
                              token={user.accessToken}
                            />
                          ))
                        : null}
                    </ul>
                    {isAuthenticated ? (
                      <form
                        onSubmit={reviewHandler}
                        action="#"
                        className="reviews__form"
                      >
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
                                name="rating"
                                id="select"
                                className="sign__select"
                              >
                                <option value="0" disabled>
                                  Rating
                                </option>
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
                                name="content"
                                className="sign__textarea"
                                placeholder="Add review"
                              ></textarea>
                            </div>
                          </div>

                          <div className="col-12">
                            <button type="submit" className="sign__btn">
                              Send
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Details;
