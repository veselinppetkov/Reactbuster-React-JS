const url = `http://localhost:3030`;

export const getAllReviews = async () => {
  const res = await fetch(`${url}/data/reviews`);
  const result = await res.json();

  return Object.values(result);
};

export const postReview = (data, token) => {
  fetch(`${url}/data/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token,
    },
    body: JSON.stringify(data),
  });
};
