import { Link, useNavigate } from "react-router-dom";

import { useAuthContext } from "../../contexts/AuthContext";

import { createMovie } from "../../services/movieServices";

const Create = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const createHandler = (e) => {
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

    createMovie(movieData, user.accessToken).catch((err) => alert(err.message));
    navigate(`/my-movies`);
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
              <form onSubmit={createHandler} className="create__form">
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
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="text"
                    name="Genre"
                    className="sign__input"
                    placeholder="Genre"
                    required
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="url"
                    name="Poster"
                    className="sign__input"
                    placeholder="Poster URL"
                    required
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
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="text"
                    name="Country"
                    className="sign__input"
                    placeholder="Country"
                    required
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
                  />
                </div>

                <button className="sign__btn" type="submit">
                  Add new movie
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
export default Create;
