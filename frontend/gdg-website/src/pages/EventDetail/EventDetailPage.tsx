import type React from "react";
import { Link, useParams } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Navigation } from "../../components/layout/Navigation";
import { pastEvents, upcomingEvents } from "../UpcomingEvents/data/events";

export const EventDetailPage: React.FC = () => {
	const { eventId } = useParams<{ eventId: string }>();

	const allEvents = [...upcomingEvents, ...pastEvents];
	const event = allEvents.find((e) => e.id === eventId);

	if (!event) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navigation />
				<main className="flex-1 pt-16">
					<div className="max-w-[900px] mx-auto py-24 px-6">
						<h1>Event Not Found</h1>
						<p>The event you're looking for doesn't exist.</p>
						<Link to="/" className="inline-flex items-center gap-2 text-[#5f6368] no-underline text-base font-medium mb-8 transition-colors duration-200 hover:text-[#4285F4]">
							Back to Home
						</Link>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Navigation />
			<main className="flex-1 pt-16">
				<div className="max-w-[900px] mx-auto py-24 px-6">
					<Link to="/" className="inline-flex items-center gap-2 text-[#5f6368] no-underline text-base font-medium mb-8 transition-colors duration-200 hover:text-[#4285F4]">
						← Back to Home
					</Link>

					<div className="mb-24">
						<span className="inline-block py-1 px-4 bg-[#e8f0fe] text-[#1967d2] rounded-full text-sm font-medium mb-4">
							{event.type}
						</span>
						<h1 className="text-3xl md:text-4xl font-bold text-[#1f1f1f] m-0 mb-8 leading-tight">
							{event.title}
						</h1>

						<div className="flex flex-col md:flex-row md:flex-wrap gap-4 md:gap-8 mb-6">
							<div className="flex items-center gap-2 text-[#5f6368] text-base">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#5f6368]">
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
							<div className="flex items-center gap-2 text-[#5f6368] text-base">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#5f6368]">
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
									{event.location}, {event.city}
								</span>
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							{event.tags.map((tag) => (
								<span key={tag} className="py-1 px-4 bg-[#f1f3f4] text-[#5f6368] rounded-full text-sm font-medium">
									{tag}
								</span>
							))}
						</div>
					</div>

					<div className="border-t border-[#e8eaed] pt-16">
						<h2 className="text-2xl font-bold text-[#1f1f1f] m-0 mb-16">About This Event</h2>
						<div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-16 items-start">
							{event.id === "design-patterns-hepsiburada" ? (
								<div className="relative rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(60,64,67,0.15)] bg-gradient-to-br from-[#4285F4] via-[#EA4335] via-[#FBBC05] via-[#34A853] to-[#4285F4] p-1">
									<img
										src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/6-batuhan-gungor.png"
										alt="Batuhan Güngör"
										className="w-full h-auto block rounded-xl bg-white"
									/>
								</div>
							) : (
								<div className="relative rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(60,64,67,0.15)] bg-gradient-to-br from-[#4285F4] via-[#EA4335] via-[#FBBC05] via-[#34A853] to-[#4285F4] p-1">
									<img
										src={event.imageUrl}
										alt={event.title}
										className="w-full h-auto block rounded-xl bg-white"
									/>
								</div>
							)}
							<div className="flex flex-col gap-8">
								<p className="text-base text-[#5f6368] leading-relaxed m-0">
									{event.description}
								</p>

								{event.id === "design-patterns-hepsiburada" && (
									<div className="mt-8">
										<h3 className="text-xl font-bold text-[#1f1f1f] m-0 mb-6">Speaker</h3>
										<div className="p-6 bg-[#f8f9fa] rounded-xl border border-[#e8eaed]">
											<div>
												<h4 className="text-lg font-bold text-[#1f1f1f] m-0 mb-1">Batuhan Güngör</h4>
												<p className="text-base text-[#5f6368] m-0">
													Software Engineering Manager at Hepsiburada / Hepsipay
												</p>
											</div>
										</div>
									</div>
								)}

								{event.isPast && (
									<div className="flex items-center gap-4 p-6 bg-[#fef7e0] border-l-4 border-[#FBBC05] rounded text-[#5f6368] text-base">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-[#FBBC05]">
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
