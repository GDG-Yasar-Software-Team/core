import type React from "react";
import { useParams, Link } from "react-router";
import { Navigation } from "../components/layout/Navigation";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/common/Button";
import { events } from "../data/events";
import "./EventDetailPage.css";

export const EventDetailPage: React.FC = () => {
	const { eventId } = useParams<{ eventId: string }>();
	const event = events.find((e) => e.id === eventId);

	if (!event) {
		return (
			<div className="event-detail-page">
				<Navigation />
				<main className="event-detail-page__content">
					<div className="event-detail-page__container">
						<div className="event-detail-page__not-found">
							<h1>Event not found</h1>
							<p>The event you're looking for doesn't exist.</p>
							<Link to="/upcoming-events">
								<Button variant="filled" size="medium">
									Back to Events
								</Button>
							</Link>
						</div>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	const eventDate = new Date(event.date);
	const formattedDate = eventDate.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<div className="event-detail-page">
			<Navigation />

			<main className="event-detail-page__content">
				<div className="event-detail-page__container">
					<Link to="/upcoming-events" className="event-detail-page__back">
						← Back to Events
					</Link>

					<article className="event-detail-page__event">
						{event.imageUrl && (
							<img
								src={event.imageUrl}
								alt={event.title}
								className="event-detail-page__image"
							/>
						)}

						<div className="event-detail-page__header">
							<div className="event-detail-page__date-badge">
								<span className="event-detail-page__date-day">
									{eventDate.getDate()}
								</span>
								<span className="event-detail-page__date-month">
									{eventDate.toLocaleDateString("en-US", { month: "short" })}
								</span>
							</div>
							<div>
								<h1 className="event-detail-page__title">{event.title}</h1>
								<div className="event-detail-page__meta">
									<span className="event-detail-page__meta-item">
										📅 {formattedDate}
									</span>
									<span className="event-detail-page__meta-item">
										🕐 {event.time}
									</span>
									<span className="event-detail-page__meta-item">
										📍 {event.location}
									</span>
								</div>
							</div>
						</div>

						<div className="event-detail-page__details">
							<section className="event-detail-page__section">
								<h2>About this event</h2>
								<p>{event.description}</p>
							</section>

							{event.speakers.length > 0 && (
								<section className="event-detail-page__section">
									<h2>Speakers</h2>
									<div className="event-detail-page__speakers">
										{event.speakers.map((speaker) => (
											<div
												key={speaker.id}
												className="event-detail-page__speaker"
											>
												<img
													src={speaker.avatarUrl}
													alt={speaker.name}
													className="event-detail-page__speaker-avatar"
												/>
												<div>
													<h3 className="event-detail-page__speaker-name">
														{speaker.name}
													</h3>
													<p className="event-detail-page__speaker-title">
														{speaker.title}
													</p>
													{speaker.bio && (
														<p className="event-detail-page__speaker-bio">
															{speaker.bio}
														</p>
													)}
												</div>
											</div>
										))}
									</div>
								</section>
							)}

							{event.rsvpUrl && event.status === "upcoming" && (
								<section className="event-detail-page__rsvp">
									<h2>RSVP</h2>
									<p>
										Secure your spot at this event! Click the button below to
										register.
									</p>
									<a
										href={event.rsvpUrl}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Button variant="filled" size="large">
											Register Now
										</Button>
									</a>
								</section>
							)}
						</div>
					</article>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default EventDetailPage;
