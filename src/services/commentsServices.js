const url = `http://localhost:3030`;

export const getAllComments = async () => {
  const res = await fetch(`${url}/data/comments`);
  const result = await res.json();

  return Object.values(result);
};

export const postComment = (data, token) => {
  fetch(`${url}/data/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token,
    },
    body: JSON.stringify(data),
  });
};
