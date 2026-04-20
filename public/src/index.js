import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
app.get('/', (req, res) => {
  res.send('Server is running from src/utils!');
});