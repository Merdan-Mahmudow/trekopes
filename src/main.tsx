import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Provider } from "./components/ui/provider"
import "./style/root.css";

import { routeTree } from "./routeTree.gen";


const router = createRouter({ routeTree });


declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function setVh() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
setVh();
window.addEventListener('resize', setVh);

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
        <Provider>
          <RouterProvider router={router} />
        </Provider>
    </StrictMode>,
  );
}