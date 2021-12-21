export const getAllMovies = async () => {
  const res = await fetch(`http://localhost:3030/data/movies`);
  const result = await res.json();
  return Object.values(result);
};

export const getMovieById = async (id) => {
  const res = await fetch(`http://localhost:3030/data/movies/${id}`);
  const result = await res.json();

  return result;
};

export const deleteMovieById = async (id, token) => {
  const confirmation = window.confirm(
    `Are you sure you want to delete this movie?`
  );

  if (confirmation) {
    return await fetch(`http://localhost:3030/data/movies/${id}`, {
      method: "delete",
      headers: {
        "X-Authorization": token,
      },
    });
  }
};

export const createMovie = (data, token) => {
  fetch(`http://localhost:3030/data/movies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token,
    },
    body: JSON.stringify(data),
  });
};

export const editMovie = (id, data, token) => {
  fetch(`http://localhost:3030/data/movies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token,
    },
    body: JSON.stringify(data),
  });
};

export const getUserMovies = async (userId) => {
  const res = await fetch(
    `http://localhost:3030/data/movies?where=_ownerId%3D%22${userId}%22&sortBy=_createdOn%20desc`
  );
  const result = await res.json();
  return Object.values(result);
};
