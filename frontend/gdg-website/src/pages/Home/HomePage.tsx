import type React from "react";
import { useRef } from "react";
import { Navigation } from "../../components/layout/Navigation";
import { Footer } from "../../components/layout/Footer";
import { EventCard } from "../UpcomingEvents/components/EventCard";
import { upcomingEvents } from "../UpcomingEvents/data/events";

const pastEvents = [
	{
		id: 1,
		title: "Info Session",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/1-info-session.png",
	},
	{
		id: 2,
		title: "Tech Talks",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/2-tech-talks.png",
	},
	{
		id: 3,
		title: "Build Your Circle",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/3-build-your-circle.png",
	},
	{
		id: 4,
		title: "AI Talks 25",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/4-ai-talks-25.png",
	},
	{
		id: 6,
		title: "Batuhan Güngör",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/6-batuhan-gungor.png",
	},
	{
		id: 7,
		title: "Emre Danışan",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/7-emre-danisan.png",
	},
	{
		id: 8,
		title: "Fikirden Geleceğe",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/8-fikirden-gelecege-event.png",
	},
	{
		id: 9,
		title: "Hard Times",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/9-hard-times.jpg",
	},
	{
		id: 10,
		title: "Study Connect",
		image: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/10-study-connect.png",
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
							{pastEvents.map((event) => (
								<div key={event.id} className="home-page__past-event-card">
									<img
										src={event.image}
										alt={event.title}
										className="home-page__past-event-image"
									/>
								</div>
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
						<h2>Upcoming Events</h2>
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
