import type React from "react";
import { useParams, Link } from "react-router-dom";
import { Navigation } from "../../components/layout/Navigation";
import { Footer } from "../../components/layout/Footer";
import { upcomingEvents, pastEvents } from "../UpcomingEvents/data/events";

export const EventDetailPage: React.FC = () => {
	const { eventId } = useParams<{ eventId: string }>();
	
	const allEvents = [...upcomingEvents, ...pastEvents];
	const event = allEvents.find((e) => e.id === eventId);

	if (!event) {
		return (
			<div className="event-detail-page">
				<Navigation />
				<main className="event-detail-page__content">
					<div className="event-detail-page__container">
						<h1>Event Not Found</h1>
						<p>The event you're looking for doesn't exist.</p>
						<Link to="/" className="event-detail-page__back-link">
							Back to Home
						</Link>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="event-detail-page">
			<Navigation />
			<main className="event-detail-page__content">
				<div className="event-detail-page__container">
					<Link to="/" className="event-detail-page__back-link">
						← Back to Home
					</Link>

					<div className="event-detail-page__header">
						<span className="event-detail-page__type">{event.type}</span>
						<h1 className="event-detail-page__title">{event.title}</h1>
						
						<div className="event-detail-page__meta">
							<div className="event-detail-page__meta-item">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path
										d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>{event.date}</span>
							</div>
							<div className="event-detail-page__meta-item">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path
										d="M12 13.43a3.12 3.12 0 1 0 0-6.24 3.12 3.12 0 0 0 0 6.24z"
										stroke="currentColor"
										strokeWidth="1.5"
									/>
									<path
										d="M3.62 8.49c1.97-8.66 14.80-8.65 16.76.01 1.15 5.08-2.01 9.38-4.78 12.04a5.193 5.193 0 0 1-7.21 0c-2.76-2.66-5.92-6.97-4.77-12.05z"
										stroke="currentColor"
										strokeWidth="1.5"
									/>
								</svg>
								<span>{event.location}, {event.city}</span>
							</div>
						</div>

						<div className="event-detail-page__tags">
							{event.tags.map((tag) => (
								<span key={tag} className="event-detail-page__tag">
									{tag}
								</span>
							))}
						</div>
					</div>

					<div className="event-detail-page__body">
						<h2>About This Event</h2>
						<div className="event-detail-page__content-wrapper">
							{event.id === "design-patterns-hepsiburada" ? (
								<div className="event-detail-page__image-card">
									<img
										src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/6-batuhan-gungor.png"
										alt="Batuhan Güngör"
										className="event-detail-page__content-image"
									/>
								</div>
							) : (
								<div className="event-detail-page__image-card">
									<img
										src={event.imageUrl}
										alt={event.title}
										className="event-detail-page__content-image"
									/>
								</div>
							)}
							<div className="event-detail-page__description-wrapper">
								<p className="event-detail-page__description">{event.description}</p>
								
								{event.id === "design-patterns-hepsiburada" && (
									<div className="event-detail-page__speaker">
										<h3>Speaker</h3>
										<div className="event-detail-page__speaker-card">
											<div className="event-detail-page__speaker-info">
												<h4>Batuhan Güngör</h4>
												<p>Software Engineering Manager at Hepsiburada / Hepsipay</p>
											</div>
										</div>
									</div>
								)}
								
								{event.isPast && (
									<div className="event-detail-page__past-notice">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
											<path
												d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z"
												stroke="currentColor"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d="M12 8v5"
												stroke="currentColor"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d="M11.995 16h.009"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
										<span>This event has already taken place.</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
};

export default EventDetailPage;
