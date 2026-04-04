import type React from "react";
import { Link } from "react-router-dom";
import type { Event } from "../../../types";
import { formatEventDate, extractCity, extractLocation } from "../../../services/eventService";

interface EventCardProps {
	event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
	const formattedDate = formatEventDate(event.date);
	const location = extractLocation(event.place);
	const city = extractCity(event.place);
	const imageUrl = event.image_url || 'https://via.placeholder.com/400x300?text=GDG+Event';

	// Determine event type from title
	let eventType = 'Event';
	const titleLower = event.title.toLowerCase();
	if (titleLower.includes('workshop')) eventType = 'Workshop';
	else if (titleLower.includes('hackathon')) eventType = 'Hackathon';
	else if (titleLower.includes('talk') || titleLower.includes('session')) eventType = 'Tech Talk';
	else if (titleLower.includes('meetup')) eventType = 'Meetup';
	else if (titleLower.includes('conference') || titleLower.includes('summit')) eventType = 'Conference';

	// Generate tags
	const tags: string[] = [eventType];
	if (event.speakers.length > 0) {
		tags.push('Guest Speaker');
	}

	return (
		<article className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-lg border border-[#e0e0e0] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] items-center md:items-start text-center md:text-left">
			<div className="flex-shrink-0 w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden bg-[#f5f5f5]">
				<img
					src={imageUrl}
					alt={event.title}
					className="w-full h-full object-cover"
				/>
			</div>

			<div className="flex-1 flex flex-col gap-3">
				<div className="flex items-center gap-3 flex-wrap text-sm text-[#5f6368] justify-center md:justify-start">
					<time className="font-semibold text-[#202124]">{formattedDate}</time>
					<span className="uppercase text-xs">{eventType}</span>
					<span className="uppercase text-xs">{location}</span>
				</div>

				<h3 className="text-xl font-medium text-[#202124] m-0">{event.title}</h3>

				<div className="flex gap-2 flex-wrap justify-center md:justify-start">
					{tags.map((tag) => (
						<span key={tag} className="py-1 px-3 bg-[#f1f3f4] rounded-2xl text-xs text-[#5f6368]">
							{tag}
						</span>
					))}
				</div>

				<p className="text-[#5f6368] text-sm leading-relaxed m-0 line-clamp-2">
					{event.description}
				</p>

				{event.speakers.length > 0 && (
					<div className="flex gap-2 items-center text-xs text-[#5f6368]">
						<span>Speakers:</span>
						<span className="font-medium text-[#202124]">
							{event.speakers.map(s => s.name).join(', ')}
						</span>
					</div>
				)}

				<Link 
					to={`/events/${event.id}`} 
					className="self-center md:self-start inline-block py-2 px-6 bg-[#4285F4] text-white border-none rounded font-medium text-sm cursor-pointer transition-colors duration-200 no-underline hover:bg-[#3367d6]"
				>
					View details
				</Link>
			</div>
		</article>
	);
};
