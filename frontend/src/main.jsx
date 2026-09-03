import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

const rawGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const googleClientId =
  rawGoogleClientId &&
  !rawGoogleClientId.includes("placeholder") &&
  !rawGoogleClientId.includes("your-google-client-id") &&
  !rawGoogleClientId.includes("your_google_client_id")
    ? rawGoogleClientId
    : "";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || ""}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);