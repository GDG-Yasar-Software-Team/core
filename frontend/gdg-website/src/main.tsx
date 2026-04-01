import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Global styles
import "./styles/global.css";
import "./styles/tokens.css";

// Component styles
import "./components/common/Card.css";
import "./components/features/AnimatedSocialDock.css";
import "./components/features/FlowingMenu.css";
import "./components/features/HeroSection.css";
import "./components/features/HighlightCard.css";
import "./components/features/LightPillar.css";
import "./components/features/TeamMemberCard.css";
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
