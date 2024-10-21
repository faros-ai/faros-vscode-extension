import { renderToString } from "react-dom/server";
import App from "./components/App";

const render = () => {
  return renderToString(App());
};

export default render;