import type React from "react";
import { Navigation } from "../../components/layout/Navigation";
import { Footer } from "../../components/layout/Footer";
import { HeroSection } from "../../components/features/HeroSection";
import { HighlightCard } from "../../components/features/HighlightCard";
import { EventCard } from "../UpcomingEvents/components/EventCard";
import { highlights } from "./highlights.data";
import { upcomingEvents } from "../UpcomingEvents/data/events";
import "./HomePage.css";

export const HomePage: React.FC = () => {
	const recentEvents = upcomingEvents
		.filter((e) => !e.isPast)
		.slice(0, 3);

	return (
		<div className="home-page">
			<Navigation />
			<HeroSection
				title="GDG on Campus Yaşar University"
				subtitle="Building a community of developers and tech enthusiasts"
			/>

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

				<section className="home-page__highlights">
					<div className="home-page__container">
						<h2>What We Do</h2>
						<div className="home-page__highlights-grid">
							{highlights.map((highlight) => (
								<HighlightCard key={highlight.id} highlight={highlight} />
							))}
						</div>
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
