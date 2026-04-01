import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

const HomePage = lazy(() => import("./pages/Home/HomePage"));
const TeamPage = lazy(() => import("./pages/Team/TeamPage"));
const AboutPage = lazy(() => import("./pages/About/AboutPage"));
const UpcomingEventsPage = lazy(
	() => import("./pages/UpcomingEvents/UpcomingEventsPage"),
);
const EventDetailPage = lazy(
	() => import("./pages/EventDetail/EventDetailPage"),
);

function App() {
	return (
		<BrowserRouter>
			<Suspense
				fallback={
					<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
				}
			>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/team" element={<TeamPage />} />
					<Route path="/about" element={<AboutPage />} />
					<Route path="/upcoming-events" element={<UpcomingEventsPage />} />
					<Route path="/events/:eventId" element={<EventDetailPage />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default App;
