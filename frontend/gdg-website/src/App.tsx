import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
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
					<Route path="/upcoming-events" element={<EventsPage />} />
					<Route path="/upcoming-events/:eventId" element={<EventDetailPage />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default App;
