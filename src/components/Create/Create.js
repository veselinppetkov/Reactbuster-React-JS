import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { createMovie } from "../../services/movieServices";

const Create = ({ token }) => {
  const navigate = useNavigate();

  const createHandler = (e) => {
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

    createMovie(movieData, token);
    console.log(`You have successfuly added a movie! Wohoo!`);
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
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="text"
                    name="Genre"
                    className="sign__input"
                    placeholder="Genre"
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="url"
                    name="Poster"
                    className="sign__input"
                    placeholder="Poster URL"
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
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="number"
                    name="Runtime"
                    className="sign__input"
                    placeholder="Runtime"
                    min="0"
                    max="300"
                  />
                </div>

                <div className="sign__group">
                  <input
                    type="text"
                    name="Country"
                    className="sign__input"
                    placeholder="Country"
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
