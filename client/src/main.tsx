import React from "react";
import ReactDOM from "react-dom/client";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import "./index.css";

const App = () => {
  const [username, setUsername] = React.useState("");

  return username ? (
    <Home username={username} />
  ) : (
    <Login onSubmit={setUsername} />
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
