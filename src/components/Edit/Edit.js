import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getMovieById, editMovie } from "../../services/movieServices";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";

const Edit = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { movieId } = useParams();
  const [movie, setMovie] = useState({});
  console.log(movieId);
  console.log(useParams());

  useEffect(() => {
    getMovieById(movieId).then((authData) => setMovie(authData));
  }, []);

  const editHandler = (e) => {
    e.preventDefault();
    const { Title, Genre, Poster, Year, Runtime, Country, imdbRating, Plot } =
      Object.fromEntries(new FormData(e.currentTarget));

    const movieData = {
      Title,
      Genre,
      Poster,
      Year,
      Runtime,
      Country,
      imdbRating,
      Plot,
    };

    editMovie(movieId, movieData, user.accessToken);
    navigate(`/catalog`);
  };

  return (
    <div
      className="sign section--full-bg"
      style={{
        backgroundImage: "url(https://wallpaperaccess.com/full/752715.jpg)",
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
                    defaultValue={movie.Title}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="text"
                    name="Genre"
                    className="sign__input"
                    placeholder="Genre"
                    defaultValue={movie.Genre}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="url"
                    name="Poster"
                    className="sign__input"
                    placeholder="Poster URL"
                    defaultValue={movie.Poster}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="number"
                    name="Year"
                    className="sign__input"
                    placeholder="Release year"
                    min="1900"
                    max="2025"
                    defaultValue={movie.Year}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="text"
                    name="Runtime"
                    className="sign__input"
                    placeholder="Runtime"
                    defaultValue={movie.Runtime}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="text"
                    name="Country"
                    className="sign__input"
                    placeholder="Country"
                    defaultValue={movie.Country}
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="number"
                    name="imdbRating"
                    className="sign__input"
                    placeholder="Rating"
                    min="1"
                    max="10"
                    defaultValue={movie.imdbRating}
                  />
                </div>

                <div className="sign__group">
                  <textarea
                    type="text"
                    name="Plot"
                    className="sign__textarea"
                    wrap="hard"
                    placeholder="Movie description"
                    minLength="10"
                    maxLength="300"
                    required="required"
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
