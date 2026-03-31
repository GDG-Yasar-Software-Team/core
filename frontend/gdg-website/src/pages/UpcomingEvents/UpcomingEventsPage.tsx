import type React from "react";
import { useState, useMemo } from "react";
import { Navigation } from "../../components/layout/Navigation";
import { Footer } from "../../components/layout/Footer";
import { EventCard } from "./components/EventCard";
import { upcomingEvents } from "./data/events";

export const UpcomingEventsPage: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredEvents = useMemo(() => {
		if (!searchQuery.trim()) {
			return upcomingEvents;
		}

		const query = searchQuery.toLowerCase();
		return upcomingEvents.filter(
			(event) =>
				event.title.toLowerCase().includes(query) ||
				event.description.toLowerCase().includes(query) ||
				event.city.toLowerCase().includes(query) ||
				event.location.toLowerCase().includes(query) ||
				event.tags.some((tag) => tag.toLowerCase().includes(query)),
		);
	}, [searchQuery]);

	return (
		<div className="upcoming-events-page">
			<Navigation />

			<main className="upcoming-events-page__content">
				<div className="upcoming-events-page__container">
					<header className="upcoming-events-page__header">
						<h1 className="upcoming-events-page__title">Upcoming events</h1>
						<p className="upcoming-events-page__subtitle">
							We can't wait to see you at an upcoming event! On this page, you
							can advance search by location, select event types (how you want
							to join the event), and/or pick out topics of your interest!
						</p>
					</header>

					<div className="upcoming-events-page__search">
						<div className="upcoming-events-page__search-container">
							<input
								type="text"
								placeholder="Search for events"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="upcoming-events-page__search-input"
							/>
							<svg
								className="upcoming-events-page__search-icon"
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
					</div>

					<div className="upcoming-events-page__events">
						{filteredEvents.length > 0 ? (
							filteredEvents.map((event) => (
								<EventCard key={event.id} event={event} />
							))
						) : (
							<div className="upcoming-events-page__empty">
								<p>No events found matching your search.</p>
							</div>
						)}
					</div>

					{filteredEvents.length === 0 && upcomingEvents.length === 0 && (
						<div className="upcoming-events-page__no-events">
							<p>No upcoming events at the moment. Check back soon!</p>
						</div>
					)}
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default UpcomingEventsPage;
