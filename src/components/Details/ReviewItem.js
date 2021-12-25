import { deleteReviewById } from "../../services/reviewServices";

const ReviewItem = ({ review, isAuthenticated, token }) => {
  return (
    <li className="reviews__item">
      <div className="reviews__autor">
        <img className="reviews__avatar" src="https://bit.ly/3EqA0oL" alt="" />
        <span className="reviews__name">
          {review.title}
          {isAuthenticated && isAuthenticated === review._ownerEmail ? (
            <>
              <button className="review-edit__btn">Edit</button>
              <button
                onClick={() => deleteReviewById(review._id, token)}
                className="review-delete__btn"
              >
                Delete
              </button>
            </>
          ) : null}
        </span>
        <span className="reviews__time">
          {new Date(review._createdOn).toGMTString()} by {review._ownerEmail}
        </span>
        <span className="reviews__rating">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M22,9.67A1,1,0,0,0,21.14,9l-5.69-.83L12.9,3a1,1,0,0,0-1.8,0L8.55,8.16,2.86,9a1,1,0,0,0-.81.68,1,1,0,0,0,.25,1l4.13,4-1,5.68A1,1,0,0,0,6.9,21.44L12,18.77l5.1,2.67a.93.93,0,0,0,.46.12,1,1,0,0,0,.59-.19,1,1,0,0,0,.4-1l-1-5.68,4.13-4A1,1,0,0,0,22,9.67Zm-6.15,4a1,1,0,0,0-.29.88l.72,4.2-3.76-2a1.06,1.06,0,0,0-.94,0l-3.76,2,.72-4.2a1,1,0,0,0-.29-.88l-3-3,4.21-.61a1,1,0,0,0,.76-.55L12,5.7l1.88,3.82a1,1,0,0,0,.76.55l4.21.61Z" />
          </svg>{" "}
          {review.rating}
        </span>
      </div>
      <p className="reviews__text">{review.content}</p>
    </li>
  );
};

export default ReviewItem;
