import type React from "react";
import { useMemo, useState } from "react";
import { Footer } from "../../components/layout/Footer";
import { Navigation } from "../../components/layout/Navigation";
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
		<div className="min-h-screen flex flex-col bg-white">
			<Navigation />

			<main className="flex-1 py-16 px-8 md:py-16 md:px-8">
				<div className="max-w-[1200px] mx-auto">
					<header className="mb-12">
						<h1 className="text-[2rem] md:text-[2.5rem] font-normal text-[#202124] m-0 mb-4">
							Upcoming events
						</h1>
						<p className="text-sm md:text-base text-[#5f6368] leading-relaxed max-w-[800px] m-0 italic">
							We can't wait to see you at an upcoming event! On this page, you
							can advance search by location, select event types (how you want
							to join the event), and/or pick out topics of your interest!
						</p>
					</header>

					<div className="flex justify-center mb-12">
						<div className="relative w-full max-w-[600px]">
							<input
								type="text"
								placeholder="Search for events"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full py-3.5 pr-12 pl-4 text-sm md:text-base border border-[#dadce0] rounded-3xl outline-none transition-all duration-200 focus:border-[#4285F4] focus:shadow-[0_1px_6px_rgba(66,133,244,0.3)]"
							/>
							<svg
								className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6368] pointer-events-none"
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

					<div className="flex flex-col gap-6">
						{filteredEvents.length > 0 ? (
							filteredEvents.map((event) => (
								<EventCard key={event.id} event={event} />
							))
						) : (
							<div className="text-center py-16 px-8 text-[#5f6368] text-lg">
								<p>No events found matching your search.</p>
							</div>
						)}
					</div>

					{filteredEvents.length === 0 && upcomingEvents.length === 0 && (
						<div className="text-center py-16 px-8 text-[#5f6368] text-lg">
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
