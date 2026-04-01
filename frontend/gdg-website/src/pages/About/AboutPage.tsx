import type React from "react";
import { Link } from "react-router-dom";
import { Navigation } from "../../components/layout/Navigation";
import { Footer } from "../../components/layout/Footer";
import "./AboutPage.css";

export const AboutPage: React.FC = () => {
	return (
		<div className="about-page">
			<Navigation />
			<div className="about-page__banner">
				<img
					src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/about-page-title/about-title.png"
					alt="About GDG on Campus Yaşar University"
					className="about-page__banner-img"
				/>
			</div>
			<main className="about-page__content">
				<section className="about-page__hero-section">
					<div className="about-page__hero-content">
						<div className="about-page__hero-text">
							<div className="about-page__hero-icon">
								<svg width="80" height="80" viewBox="0 0 24 24" fill="none">
									<path
										d="M12 2L2 7L12 12L22 7L12 2Z"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M2 17L12 22L22 17"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M2 12L12 17L22 12"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
							<h2>Join Our Next Event</h2>
							<p>
								Design Patterns with Hepsiburada is back with industry expert sessions. 
								Learn from a Software Engineering Manager at Hepsiburada/Hepsipay about 
								real-world applications of design patterns in large-scale systems. 
								Don't just watch the tech revolution—drive it by learning best practices 
								and architectural patterns used by leading tech companies.
							</p>
							<Link to="/events/design-patterns-hepsiburada" className="about-page__hero-button">
								View details
							</Link>
						</div>
						<div className="about-page__hero-image">
							<img
								src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/design-patterns/banner.gif"
								alt="Design Patterns with Hepsiburada"
								className="about-page__hero-event-img"
							/>
						</div>
					</div>
				</section>

				<div className="about-page__container">
				</div>

				<section className="about-page__tech-summit-banner">
					<div className="about-page__banner-container">
						<img
							src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/tech-summit-banner/techs-banner.png"
							alt="Tech Summit Banner"
							className="about-page__tech-summit-img"
						/>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
};

export default AboutPage;
