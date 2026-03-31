import type React from "react";
import { useState } from "react";
import { Navigation } from "../components/layout/Navigation";
import { Footer } from "../components/layout/Footer";
import { EventCard } from "../components/features/EventCard";
import { events } from "../data/events";
import "./EventsPage.css";

export const EventsPage: React.FC = () => {
	const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

	const featuredEvent = events.find((e) => e.featured);
	const filteredEvents = events.filter((event) => {
		if (filter === "all") return true;
		return event.status === filter;
	});

	return (
		<div className="events-page">
			<Navigation />

			<main className="events-page__content">
				<section className="events-page__hero">
					<div className="events-page__container">
						<h1>Upcoming events</h1>
						<p className="events-page__intro">
							Join us for workshops, hackathons, and tech talks
						</p>
					</div>
				</section>

				{featuredEvent && (
					<section className="events-page__featured">
						<div className="events-page__container">
							<h2>Featured Event</h2>
							<EventCard event={featuredEvent} />
						</div>
					</section>
				)}

				<section className="events-page__events">
					<div className="events-page__container">
						<div className="events-page__filters">
							<button
								type="button"
								className={`events-page__filter-button ${
									filter === "all" ? "events-page__filter-button--active" : ""
								}`}
								onClick={() => setFilter("all")}
							>
								All Events
							</button>
							<button
								type="button"
								className={`events-page__filter-button ${
									filter === "upcoming"
										? "events-page__filter-button--active"
										: ""
								}`}
								onClick={() => setFilter("upcoming")}
							>
								Upcoming
							</button>
							<button
								type="button"
								className={`events-page__filter-button ${
									filter === "past" ? "events-page__filter-button--active" : ""
								}`}
								onClick={() => setFilter("past")}
							>
								Past
							</button>
						</div>

						<div className="events-page__events-grid">
							{filteredEvents.map((event) => (
								<EventCard key={event.id} event={event} />
							))}
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default EventsPage;
