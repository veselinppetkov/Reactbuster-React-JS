import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";

const initialAuthState = {
  _id: "",
  email: "",
  accessToken: "",
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useLocalStorage("user", initialAuthState);

  const login = (authData) => {
    setUser(authData);
    navigate(`/`);
  };

  const logout = () => {
    setUser(initialAuthState);
    navigate(`/`);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: user.email }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const authState = useContext(AuthContext);

  return authState;
};
