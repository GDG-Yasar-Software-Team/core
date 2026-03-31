import type React from "react";
import type { Event } from "../../../types/event";
import "./EventCard.css";

interface EventCardProps {
	event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
	return (
		<article className="event-card">
			<div className="event-card__image-container">
				<img
					src={event.imageUrl}
					alt={event.title}
					className="event-card__image"
				/>
			</div>

			<div className="event-card__content">
				<div className="event-card__header">
					<time className="event-card__date">{event.date}</time>
					<span className="event-card__type">{event.type}</span>
					<span className="event-card__location">{event.city}</span>
				</div>

				<h3 className="event-card__title">{event.title}</h3>

				<div className="event-card__tags">
					{event.tags.map((tag) => (
						<span key={tag} className="event-card__tag">
							{tag}
						</span>
					))}
				</div>

				<p className="event-card__description">{event.description}</p>

				<button type="button" className="event-card__button">
					View details
				</button>
			</div>
		</article>
	);
};
