import { Link, useNavigate } from "react-router-dom";

import { deleteMovieById } from "../../services/movieServices";
import { useAuthContext } from "../../contexts/AuthContext";

const DetailsCard = ({ movie }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  return (
    <>
      {movie ? (
        <>
          <div className="col-12 col-xl-8">
            <div className="article__content">
              <h1>
                {movie.Title}
                {user._id === movie._ownerId ? (
                  <>
                    <Link to={`/edit/${movie._id}`}>
                      <button type="button" className="edit__btn">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        deleteMovieById(movie._id, user.accessToken);
                        navigate(`/catalog`);
                      }}
                      type="button"
                      className="delete__btn"
                    >
                      Delete
                    </button>
                  </>
                ) : null}
              </h1>
              <ul className="list">
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M22,9.67A1,1,0,0,0,21.14,9l-5.69-.83L12.9,3a1,1,0,0,0-1.8,0L8.55,8.16,2.86,9a1,1,0,0,0-.81.68,1,1,0,0,0,.25,1l4.13,4-1,5.68A1,1,0,0,0,6.9,21.44L12,18.77l5.1,2.67a.93.93,0,0,0,.46.12,1,1,0,0,0,.59-.19,1,1,0,0,0,.4-1l-1-5.68,4.13-4A1,1,0,0,0,22,9.67Zm-6.15,4a1,1,0,0,0-.29.88l.72,4.2-3.76-2a1.06,1.06,0,0,0-.94,0l-3.76,2,.72-4.2a1,1,0,0,0-.29-.88l-3-3,4.21-.61a1,1,0,0,0,.76-.55L12,5.7l1.88,3.82a1,1,0,0,0,.76.55l4.21.61Z" />
                  </svg>
                  {movie.imdbRating}
                </li>
                <li>{movie.Country}</li>
                <li>{movie.Year}</li>
                <li>{movie.Runtime}</li>
              </ul>
              <p> {movie.Plot}</p>
            </div>
          </div>
          <div className="col-12 col-xl-8">
            <div className="categories">
              <h3 className="categories__title">Trailer</h3>
            </div>
            <br />
            <iframe
              width="560"
              height="315"
              src="https://www.youtube-nocookie.com/embed/l6bqq_IaNn8"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="categories">
              <h3 className="categories__title">Genres</h3>
              {movie.Genre !== undefined
                ? movie.Genre.split(",").map((g) => (
                    <Link
                      to="/"
                      key={Math.random()}
                      className="categories__item"
                    >
                      {g}
                    </Link>
                  ))
                : null}
            </div>
          </div>
        </>
      ) : (
        <div className="lds-facebook">
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
    </>
  );
};

export default DetailsCard;
