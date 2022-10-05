import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Relayer from "./pages/Relayer";
import User from "./pages/User";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Relayer />}></Route>
      <Route path="/user" element={<User />}></Route>
    </Routes>
  </BrowserRouter>
);
