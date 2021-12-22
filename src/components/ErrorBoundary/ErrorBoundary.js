import { Component } from "react";
import Error from "../Error";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.log(error);
  }

  render() {
    if (this.state.error) {
      return <Error />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
