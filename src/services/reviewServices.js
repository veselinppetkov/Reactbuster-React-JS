const url = `http://localhost:3030`;

export const getAllReviews = async () => {
  const res = await fetch(`${url}/data/reviews`);
  const result = await res.json();

  return Object.values(result);
};

export const postReview = async (data, token) => {
  const res = await fetch(`${url}/data/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  return result;
};

export const deleteReviewById = async (id, token) => {
  const confirmation = window.confirm(
    `Are you sure you want to delete this review?`
  );

  if (confirmation) {
    return await fetch(`${url}/data/reviews/${id}`, {
      method: "delete",
      headers: {
        "X-Authorization": token,
      },
    });
  }
};

export const editReviewById = async (id, data, token) => {
  return await fetch(`${url}/data/reviews/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token,
    },
    body: JSON.stringify(data),
  });
};
