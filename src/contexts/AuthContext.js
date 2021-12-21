import { createContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

export const AuthContext = createContext();

const initialState = {
  accessToken: "",
  email: "",
  _id: "",
};

export const AuthProvider = ({ children }) => {
  cont[(user, setUser)] = useLocalStorage(initialState);

  return (
    <AuthContext.Provider values={{ user }}>{children}</AuthContext.Provider>
  );
};
