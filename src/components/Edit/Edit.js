import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuthContext } from "../../contexts/AuthContext";

import { getMovieById, editMovie } from "../../services/movieServices";

const Edit = () => {
  const navigate = useNavigate();

  const { user } = useAuthContext();
  const { movieId } = useParams();

  const [movie, setMovie] = useState({});

  useEffect(() => {
    getMovieById(movieId).then((authData) => setMovie(authData));
  }, [movieId]);

  const editHandler = (e) => {
    e.preventDefault();

    let { Title, Genre, Poster, Year, Runtime, Country, imdbRating, Plot } =
      Object.fromEntries(new FormData(e.currentTarget));

    const movieData = {
      Title,
      Genre,
      Poster,
      Year,
      Runtime: (Runtime += `min.`),
      Country,
      imdbRating,
      Plot,
    };

    editMovie(movieId, movieData, user.accessToken);
    navigate(`/my-movies`);
  };

  return (
    <div
      className="sign section--full-bg"
      style={{
        backgroundImage: "url(https://bit.ly/3Epimlm)",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="sign__content">
              <form onSubmit={editHandler} className="create__form">
                <Link to="/" className="sign__logo">
                  <img src="img/logo.png" alt="" />
                </Link>

                <div className="sign__group">
                  <input
                    type="text"
                    name="Title"
                    className="sign__input"
                    placeholder="Title"
                    required
                    defaultValue={movie.Title}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="text"
                    name="Genre"
                    className="sign__input"
                    placeholder="Genre"
                    required
                    defaultValue={movie.Genre}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="url"
                    name="Poster"
                    className="sign__input"
                    placeholder="Poster URL"
                    required
                    defaultValue={movie.Poster}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="number"
                    name="Year"
                    className="sign__input"
                    placeholder="Release year"
                    min="0"
                    max="2025"
                    required
                    defaultValue={movie.Year}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="number"
                    name="Runtime"
                    className="sign__input"
                    placeholder="Runtime"
                    min="0"
                    max="360"
                    required
                    defaultValue={movie.Runtime}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="text"
                    name="Country"
                    className="sign__input"
                    placeholder="Country"
                    required
                    defaultValue={movie.Country}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="number"
                    name="imdbRating"
                    className="sign__input"
                    placeholder="Rating"
                    step="0.1"
                    min="1"
                    max="10"
                    required
                    defaultValue={movie.imdbRating}
                  />
                </div>

                <div className="sign__group">
                  <textarea
                    type="text"
                    name="Plot"
                    className="sign__textarea"
                    placeholder="Movie description"
                    minLength="10"
                    maxLength="300"
                    required
                    defaultValue={movie.Plot}
                  />
                </div>

                <button className="sign__btn" type="submit">
                  Edit movie
                </button>
                <button className="reset__btn" type="reset">
                  Reset
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Edit;
