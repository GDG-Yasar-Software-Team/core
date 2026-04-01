import type React from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "../../components/layout/Navigation";
import { Footer } from "../../components/layout/Footer";
import { EventCard } from "../UpcomingEvents/components/EventCard";
import { upcomingEvents } from "../UpcomingEvents/data/events";

const pastEventsDisplay = [
	{
		id: "info-session",
		title: "Info Session",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/1-info-session.png",
	},
	{
		id: "tech-talks",
		title: "Tech Talks",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/2-tech-talks.png",
	},
	{
		id: "build-your-circle",
		title: "Build Your Circle",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/3-build-your-circle.png",
	},
	{
		id: "ai-talks-25",
		title: "AI Talks 25",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/4-ai-talks-25.png",
	},
	{
		id: "batuhan-gungor",
		title: "Batuhan Güngör",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/6-batuhan-gungor.png",
	},
	{
		id: "emre-danisan",
		title: "Emre Danışan",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/7-emre-danisan.png",
	},
	{
		id: "fikirden-gelecege",
		title: "Fikirden Geleceğe",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/8-fikirden-gelecege-event.png",
	},
	{
		id: "hard-times",
		title: "Hard Times",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/9-hard-times.jpg",
	},
	{
		id: "study-connect",
		title: "Study Connect",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/10-study-connect.png",
	},
];

const missionCards = [
	{
		id: 1,
		title: "Learn",
		description: "Expand your knowledge through workshops, tech talks, and hands-on sessions with industry experts.",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/4-ai-talks-25.png",
		color: "#4285F4", // Blue
	},
	{
		id: 2,
		title: "Connect",
		description: "Build meaningful relationships with fellow developers and tech enthusiasts in our community.",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/10-study-connect.png",
		color: "#34A853", // Green
	},
	{
		id: 3,
		title: "Build",
		description: "Create innovative projects and bring your ideas to life with the support of our community.",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/7-emre-danisan.png",
		color: "#EA4335", // Red
	},
];

export const HomePage: React.FC = () => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const recentEvents = upcomingEvents
		.filter((e) => !e.isPast)
		.slice(0, 3);

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
		<div className="home-page">
			<Navigation />
			<div className="home-page__hero-image">
				<img
					src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/home-page-title/home-picture.png"
					alt="GDG on Campus Yaşar University"
					className="home-page__hero-image-img"
				/>
			</div>

			<main className="home-page__content">
				<section className="home-page__mission">
					<div className="home-page__container">
						<h2>Our Mission</h2>
						<p>
							We bring together students passionate about technology to learn,
							share, and build amazing things. Join us for workshops,
							hackathons, and tech talks!
						</p>
						<div className="home-page__mission-cards">
							{missionCards.map((card) => (
								<div key={card.id} className="home-page__mission-card">
									<div className="home-page__mission-card-image-wrapper">
										<img
											src={card.image}
											alt={card.title}
											className="home-page__mission-card-image"
										/>
										<div
											className="home-page__mission-card-overlay"
											style={{ backgroundColor: `${card.color}CC` }}
										/>
									</div>
									<div className="home-page__mission-card-content">
										<h3 style={{ color: card.color }}>{card.title}</h3>
										<p>{card.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="home-page__past-events">
					<div className="home-page__container">
						<h2>What We Do</h2>
					</div>
					<div className="home-page__past-events-wrapper">
						<button
							type="button"
							className="home-page__scroll-button home-page__scroll-button--left"
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
							className="home-page__past-events-scroll"
							ref={scrollContainerRef}
						>
							{pastEventsDisplay.map((event) => (
								<Link
									key={event.id}
									to={`/events/${event.id}`}
									className="home-page__past-event-card"
								>
									<img
										src={event.image}
										alt={event.title}
										className="home-page__past-event-image"
									/>
								</Link>
							))}
						</div>
						<button
							type="button"
							className="home-page__scroll-button home-page__scroll-button--right"
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

				<section className="home-page__events">
					<div className="home-page__container">
						<h2>	Events</h2>
						<div className="home-page__events-grid">
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
