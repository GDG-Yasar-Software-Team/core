import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Global styles
import "./styles/global.css";
import "./styles/tailwind.css";
import "./styles/tokens.css";

// Component styles
import "./components/layout/Footer.css";
import "./components/layout/Navigation.css";

// Page styles
import "./pages/About/AboutPage.css";
import "./pages/EventDetail/EventDetailPage.css";
import "./pages/Home/HomePage.css";
import "./pages/Team/TeamPage.css";
import "./pages/UpcomingEvents/UpcomingEventsPage.css";
import "./pages/UpcomingEvents/components/EventCard.css";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
