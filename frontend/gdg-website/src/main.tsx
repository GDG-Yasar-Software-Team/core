import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Global styles
import "./styles/global.css";
import "./styles/tailwind.css";
import "./styles/tokens.css";

// Component styles

// Page styles

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
