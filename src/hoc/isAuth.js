import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

export const isAuth = (Component) = {
    const WrappedComponent = (props) => {
        const {isAuthenticated} = useAuthContext();

        return isAuthenticated
        ? <Component {...props}/>
        : <Navigate to="/login"/>

    }
    return WrappedComponent;
};
