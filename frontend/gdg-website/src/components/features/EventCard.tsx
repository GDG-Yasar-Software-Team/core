import type React from "react";
import { Link } from "react-router";
import type { Event } from "../../types";
import "./EventCard.css";

export interface EventCardProps {
	event: Event;
	className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
	event,
	className = "",
}) => {
	const eventDate = new Date(event.date);

	return (
		<Link to={`/upcoming-events/${event.id}`} className={`event-card ${className}`}>
			<div className="event-card__date-badge">
				<span className="event-card__date-day">{eventDate.getDate()}</span>
				<span className="event-card__date-month">
					{eventDate.toLocaleDateString("en-US", { month: "short" })}
				</span>
			</div>

			{event.imageUrl && (
				<img
					src={event.imageUrl}
					alt={event.title}
					className="event-card__image"
				/>
			)}

			<div className="event-card__content">
				<h3 className="event-card__title">{event.title}</h3>
				<p className="event-card__description">{event.description}</p>

				<div className="event-card__meta">
					<div className="event-card__location">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
						</svg>
						<span>{event.location}</span>
					</div>
				</div>

				{event.speakers.length > 0 && (
					<div className="event-card__speakers">
						{event.speakers.slice(0, 3).map((speaker) => (
							<img
								key={speaker.id}
								src={speaker.avatarUrl}
								alt={speaker.name}
								className="event-card__speaker-avatar"
								title={speaker.name}
							/>
						))}
					</div>
				)}
			</div>
		</Link>
	);
};
