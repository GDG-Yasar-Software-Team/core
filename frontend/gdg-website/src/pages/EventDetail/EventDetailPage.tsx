import type React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Navigation } from "../../components/layout/Navigation";
import {
	extractCity,
	extractLocation,
	fetchEventById,
	formatEventDate,
	isEventPast,
} from "../../services/eventService";
import type { Event } from "../../types";

export const EventDetailPage: React.FC = () => {
	const { eventId } = useParams<{ eventId: string }>();
	const [event, setEvent] = useState<Event | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadEvent = async () => {
			if (!eventId) {
				setError("Event ID is missing");
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);
				const eventData = await fetchEventById(eventId);
				setEvent(eventData);
			} catch (err) {
				console.error("Failed to load event:", err);
				setError("Failed to load event. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		loadEvent();
	}, [eventId]);

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navigation />
				<main className="flex-1 pt-12 md:pt-16">
					<div className="max-w-[900px] mx-auto py-16 md:py-24 px-4 sm:px-6 text-center">
						<div className="inline-block w-12 h-12 border-4 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
						<p className="mt-4 text-[#5f6368]">Loading event...</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (error || !event) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navigation />
				<main className="flex-1 pt-12 md:pt-16">
					<div className="max-w-[900px] mx-auto py-16 md:py-24 px-4 sm:px-6">
						<h1 className="text-3xl font-bold text-[#1f1f1f] mb-4">
							Event Not Found
						</h1>
						<p className="text-[#5f6368] mb-8">
							{error || "The event you're looking for doesn't exist."}
						</p>
						<Link
							to="/"
							className="inline-flex items-center gap-2 text-[#4285F4] no-underline text-base font-medium transition-colors duration-200 hover:text-[#3367d6]"
						>
							← Back to Home
						</Link>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	const formattedDate = formatEventDate(event.date);
	const location = extractLocation(event.place);
	const city = extractCity(event.place);
	const imageUrl =
		event.image_url || "https://via.placeholder.com/400x300?text=GDG+Event";
	const registrationUrl = event.registration_form_url?.trim();
	const isPast = isEventPast(event);

	// Determine event type from title
	let eventType = "Event";
	const titleLower = event.title.toLowerCase();
	if (titleLower.includes("workshop")) eventType = "Workshop";
	else if (titleLower.includes("hackathon")) eventType = "Hackathon";
	else if (titleLower.includes("talk") || titleLower.includes("session"))
		eventType = "Tech Talk";
	else if (titleLower.includes("meetup")) eventType = "Meetup";
	else if (titleLower.includes("conference") || titleLower.includes("summit"))
		eventType = "Conference";

	// Generate tags
	const tags: string[] = [eventType];
	if (event.speakers.length > 0) {
		tags.push("Guest Speaker");
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Navigation />
			<main className="flex-1 pt-12 md:pt-16">
				<div className="max-w-[900px] mx-auto py-16 md:py-24 px-4 sm:px-6">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-[#5f6368] no-underline text-base font-medium mb-8 transition-colors duration-200 hover:text-[#4285F4]"
					>
						← Back to Home
					</Link>

					<div className="mb-16 md:mb-24">
						<span className="inline-block py-1 px-4 bg-[#e8f0fe] text-[#1967d2] rounded-full text-sm font-medium mb-4">
							{eventType}
						</span>
						<h1 className="text-3xl md:text-4xl font-bold text-[#1f1f1f] m-0 mb-8 leading-tight">
							{event.title}
						</h1>

						<div className="flex flex-col md:flex-row md:flex-wrap gap-4 md:gap-8 mb-6">
							<div className="flex items-center gap-2 text-[#5f6368] text-base">
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									className="text-[#5f6368]"
								>
									<path
										d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>{formattedDate}</span>
							</div>
							<div className="flex items-center gap-2 text-[#5f6368] text-base">
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									className="text-[#5f6368]"
								>
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
								<span>
									{location}, {city}
								</span>
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							{tags.map((tag) => (
								<span
									key={tag}
									className="py-1 px-4 bg-[#f1f3f4] text-[#5f6368] rounded-full text-sm font-medium"
								>
									{tag}
								</span>
							))}
						</div>
					</div>

					<div className="border-t border-[#e8eaed] pt-16">
						<h2 className="text-2xl font-bold text-[#1f1f1f] m-0 mb-16">
							About This Event
						</h2>
						<div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 md:gap-16 items-start">
							<div className="relative rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(60,64,67,0.15)] bg-gradient-to-br from-[#4285F4] via-[#EA4335] via-[#FBBC05] via-[#34A853] to-[#4285F4] p-1">
								<img
									src={imageUrl}
									alt={event.title}
									className="w-full h-auto block rounded-xl bg-white"
								/>
							</div>
							<div className="flex flex-col gap-8">
								<p className="text-base text-[#5f6368] leading-relaxed m-0 whitespace-pre-wrap">
									{event.description}
								</p>

								{registrationUrl && !isPast && (
									<div className="mt-2 p-5 bg-[#e8f0fe] rounded-xl border border-[#d2e3fc]">
										<h3 className="text-lg font-bold text-[#1f1f1f] m-0 mb-2">
											Registration
										</h3>
										<p className="text-sm text-[#5f6368] m-0 mb-4">
											Secure your spot using the event form.
										</p>
										<a
											href={registrationUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 py-2.5 px-4 rounded-lg bg-[#1a73e8] text-white no-underline text-sm font-medium hover:bg-[#1765cc] transition-colors"
										>
											Register now
										</a>
									</div>
								)}

								{event.speakers.length > 0 && (
									<div className="mt-8">
										<h3 className="text-xl font-bold text-[#1f1f1f] m-0 mb-6">
											{event.speakers.length === 1 ? "Speaker" : "Speakers"}
										</h3>
										<div className="flex flex-col gap-4">
											{event.speakers.map((speaker, index) => (
												<div
													key={index}
													className="p-4 bg-[#f8f9fa] rounded-xl border border-[#e8eaed]"
												>
													<h4 className="text-base font-bold text-[#1f1f1f] m-0 mb-1 leading-tight">
														{speaker.name}
													</h4>
													<p className="text-sm text-[#5f6368] m-0 leading-snug">
														{speaker.title} @ {speaker.company}
													</p>
												</div>
											))}
										</div>
									</div>
								)}

								{isPast && (
									<div className="flex items-center gap-4 p-6 bg-[#fef7e0] border-l-4 border-[#FBBC05] rounded text-[#5f6368] text-base">
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											className="flex-shrink-0 text-[#FBBC05]"
										>
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
