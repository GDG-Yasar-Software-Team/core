import type React from "react";
import { pastEvents } from "../../UpcomingEvents/data/events";

export const PastEventsGallery: React.FC = () => {
	return (
		<section className="past-events-gallery">
			<div className="past-events-gallery__container">
				<h2 className="past-events-gallery__title">Our Past Events</h2>
				<p className="past-events-gallery__subtitle">
					Take a look at the amazing events we've organized
				</p>

				<div className="past-events-gallery__grid">
					{pastEvents.map((event) => (
						<div key={event.id} className="past-events-gallery__card">
							<div className="past-events-gallery__image-wrapper">
								<img
									src={event.imageUrl}
									alt={event.title}
									className="past-events-gallery__image"
								/>
							</div>
							<div className="past-events-gallery__content">
								<h3 className="past-events-gallery__event-title">
									{event.title}
								</h3>
								<p className="past-events-gallery__event-date">{event.date}</p>
								{event.description && (
									<p className="past-events-gallery__event-description">
										{event.description}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};
