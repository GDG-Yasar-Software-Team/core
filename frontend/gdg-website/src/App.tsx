import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

const HomePage = lazy(() => import("./pages/Home/HomePage"));
const AboutPage = lazy(() => import("./pages/About/AboutPage"));
const TeamPage = lazy(() => import("./pages/Team/TeamPage"));
const UpcomingEventsPage = lazy(
	() => import("./pages/UpcomingEvents/UpcomingEventsPage"),
);
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));

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
					<Route path="/about" element={<AboutPage />} />
					<Route path="/team" element={<TeamPage />} />
					<Route path="/upcoming-events" element={<UpcomingEventsPage />} />
					<Route
						path="/upcoming-events/:eventId"
						element={<EventDetailPage />}
					/>
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default App;
