import type React from "react";
import { Link } from "react-router-dom";
import type { Event } from "../../../types";

interface EventCardProps {
	event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
	return (
		<article className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-lg border border-[#e0e0e0] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] items-center md:items-start text-center md:text-left">
			<div className="flex-shrink-0 w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden bg-[#f5f5f5]">
				<img
					src={event.imageUrl}
					alt={event.title}
					className="w-full h-full object-cover"
				/>
			</div>

			<div className="flex-1 flex flex-col gap-3">
				<div className="flex items-center gap-3 flex-wrap text-sm text-[#5f6368] justify-center md:justify-start">
					<time className="font-semibold text-[#202124]">{event.date}</time>
					<span className="uppercase text-xs">{event.type}</span>
					<span className="uppercase text-xs">{event.location}</span>
				</div>

				<h3 className="text-xl font-medium text-[#202124] m-0">{event.title}</h3>

				<div className="flex gap-2 flex-wrap justify-center md:justify-start">
					{event.tags.map((tag) => (
						<span key={tag} className="py-1 px-3 bg-[#f1f3f4] rounded-2xl text-xs text-[#5f6368]">
							{tag}
						</span>
					))}
				</div>

				<p className="text-[#5f6368] text-sm leading-relaxed m-0 line-clamp-2">
					{event.description}
				</p>

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
