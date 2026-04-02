import type React from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Navigation } from "../../components/layout/Navigation";
import { EventCard } from "../UpcomingEvents/components/EventCard";
import { upcomingEvents } from "../UpcomingEvents/data/events";

const pastEventsDisplay = [
	{
		id: "info-session",
		title: "Info Session",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/1-info-session.png",
	},
	{
		id: "tech-talks",
		title: "Tech Talks",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/2-tech-talks.png",
	},
	{
		id: "build-your-circle",
		title: "Build Your Circle",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/3-build-your-circle.png",
	},
	{
		id: "ai-talks-25",
		title: "AI Talks 25",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/4-ai-talks-25.png",
	},
	{
		id: "batuhan-gungor",
		title: "Batuhan Güngör",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/6-batuhan-gungor.png",
	},
	{
		id: "emre-danisan",
		title: "Emre Danışan",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/7-emre-danisan.png",
	},
	{
		id: "fikirden-gelecege",
		title: "Fikirden Geleceğe",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/8-fikirden-gelecege-event.png",
	},
	{
		id: "hard-times",
		title: "Hard Times",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/9-hard-times.jpg",
	},
	{
		id: "study-connect",
		title: "Study Connect",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/10-study-connect.png",
	},
];

const missionCards = [
	{
		id: 1,
		title: "Learn",
		description:
			"Expand your knowledge through workshops, tech talks, and hands-on sessions with industry experts.",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/4-ai-talks-25.png",
		color: "#4285F4", // Blue
	},
	{
		id: 2,
		title: "Connect",
		description:
			"Build meaningful relationships with fellow developers and tech enthusiasts in our community.",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/10-study-connect.png",
		color: "#34A853", // Green
	},
	{
		id: 3,
		title: "Build",
		description:
			"Create innovative projects and bring your ideas to life with the support of our community.",
		image:
			"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/7-emre-danisan.png",
		color: "#EA4335", // Red
	},
];

export const HomePage: React.FC = () => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const recentEvents = upcomingEvents.filter((e) => !e.isPast).slice(0, 3);

	const scroll = (direction: "left" | "right") => {
		if (scrollContainerRef.current) {
			const cardWidth = 280;
			const gap = 24;
			const scrollAmount = cardWidth + gap;
			const currentScroll = scrollContainerRef.current.scrollLeft;
			const targetScroll =
				direction === "left"
					? currentScroll - scrollAmount
					: currentScroll + scrollAmount;

			scrollContainerRef.current.scrollTo({
				left: targetScroll,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navigation />
			<div className="w-full overflow-hidden">
				<img
					src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/home-page-title/home-picture.png"
					alt="GDG on Campus Yaşar University"
					className="w-full h-auto block object-cover"
				/>
			</div>

			<main className="flex-1">
				<section className="py-24 text-center">
					<div className="max-w-[1200px] mx-auto px-6">
						<h2 className="text-2xl font-bold text-[#1f1f1f] m-0 mb-6">Our Mission</h2>
						<p className="text-lg text-[#5f6368] max-w-[800px] mx-auto mb-24 leading-relaxed">
							We bring together students passionate about technology to learn,
							share, and build amazing things. Join us for workshops,
							hackathons, and tech talks!
						</p>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
							{missionCards.map((card) => (
								<div key={card.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(60,64,67,0.15)] transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-[0_8px_24px_rgba(60,64,67,0.25)]">
									<div className="relative w-full h-60 overflow-hidden">
										<img
											src={card.image}
											alt={card.title}
											className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
										/>
										<div
											className="absolute top-0 left-0 right-0 bottom-0 opacity-30 transition-opacity duration-300 hover:opacity-50"
											style={{ backgroundColor: `${card.color}CC` }}
										/>
									</div>
									<div className="p-8">
										<h3 className="text-xl font-bold m-0 mb-4" style={{ color: card.color }}>{card.title}</h3>
										<p className="text-base text-[#5f6368] leading-relaxed m-0">{card.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="py-24 bg-[#f5f5f5] overflow-hidden">
					<div className="max-w-[1200px] mx-auto px-6">
						<h2 className="text-2xl font-bold text-[#1f1f1f] m-0 mb-16 text-center">What We Do</h2>
					</div>
					<div className="relative max-w-[1600px] mx-auto px-[60px] md:px-[60px]">
						<button
							type="button"
							className="absolute top-1/2 -translate-y-1/2 left-0 w-12 h-12 rounded-full bg-white border-none shadow-[0_2px_4px_0_rgba(60,64,67,0.3),0_1px_6px_1px_rgba(60,64,67,0.15)] cursor-pointer flex items-center justify-center text-[#5f6368] transition-all duration-200 z-10 hover:bg-[#f8f9fa] hover:shadow-[0_4px_8px_0_rgba(60,64,67,0.3),0_2px_8px_2px_rgba(60,64,67,0.15)] hover:text-[#202124] active:scale-95 md:flex hidden"
							onClick={() => scroll("left")}
							aria-label="Scroll left"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M15 18L9 12L15 6"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
						<div
							className="flex gap-6 overflow-x-auto md:overflow-x-hidden overflow-y-hidden scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] md:[scrollbar-width:none] [scrollbar-color:#dadce0_transparent] md:[&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#dadce0] [&::-webkit-scrollbar-thumb]:rounded"
							ref={scrollContainerRef}
						>
							{pastEventsDisplay.map((event) => (
								<Link
									key={event.id}
									to={`/events/${event.id}`}
									className="flex-[0_0_auto] w-[280px] bg-white rounded-xl overflow-hidden shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] transition-all duration-200 cursor-pointer no-underline block hover:-translate-y-1 hover:shadow-[0_4px_8px_0_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)]"
								>
									<img
										src={event.image}
										alt={event.title}
										className="w-full h-[280px] object-cover block"
									/>
								</Link>
							))}
						</div>
						<button
							type="button"
							className="absolute top-1/2 -translate-y-1/2 right-0 w-12 h-12 rounded-full bg-white border-none shadow-[0_2px_4px_0_rgba(60,64,67,0.3),0_1px_6px_1px_rgba(60,64,67,0.15)] cursor-pointer flex items-center justify-center text-[#5f6368] transition-all duration-200 z-10 hover:bg-[#f8f9fa] hover:shadow-[0_4px_8px_0_rgba(60,64,67,0.3),0_2px_8px_2px_rgba(60,64,67,0.15)] hover:text-[#202124] active:scale-95 md:flex hidden"
							onClick={() => scroll("right")}
							aria-label="Scroll right"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M9 18L15 12L9 6"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
				</section>

				<section className="py-24">
					<div className="max-w-[1200px] mx-auto px-6">
						<h2 className="text-2xl font-bold text-[#1f1f1f] m-0 mb-16 text-center"> Events</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{recentEvents.map((event) => (
								<EventCard key={event.id} event={event} />
							))}
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default HomePage;
