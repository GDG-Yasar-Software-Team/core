import type React from "react";
import { Navigation } from "../components/layout/Navigation";
import { Footer } from "../components/layout/Footer";
import { Accordion } from "../components/common/Accordion";
import { faqs } from "../data/faqs";
import "./AboutPage.css";

export const AboutPage: React.FC = () => {
	return (
		<div className="about-page">
			<Navigation />

			<main className="about-page__content">
				<section className="about-page__hero">
					<div className="about-page__container">
						<h1>About Us</h1>
						<p className="about-page__intro">
							Learn more about GDG on Campus Yaşar University and what we stand
							for
						</p>
					</div>
				</section>

				<section className="about-page__mission-vision">
					<div className="about-page__container">
						<div className="about-page__grid">
							<div className="about-page__card">
								<h2>Our Mission</h2>
								<p>
									To create an inclusive community where students can learn,
									collaborate, and grow their technical skills through hands-on
									workshops, hackathons, and networking events.
								</p>
							</div>
							<div className="about-page__card">
								<h2>Our Vision</h2>
								<p>
									To be the leading student technology community at Yaşar
									University, empowering the next generation of developers and
									innovators to build solutions that matter.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="about-page__values">
					<div className="about-page__container">
						<h2>Our Values</h2>
						<div className="about-page__values-grid">
							<div className="about-page__value-card">
								<h3>🤝 Inclusivity</h3>
								<p>
									We welcome students from all backgrounds and skill levels to
									join our community.
								</p>
							</div>
							<div className="about-page__value-card">
								<h3>📚 Learning</h3>
								<p>
									We believe in continuous learning and sharing knowledge with
									each other.
								</p>
							</div>
							<div className="about-page__value-card">
								<h3>🚀 Innovation</h3>
								<p>
									We encourage creative thinking and building solutions to
									real-world problems.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="about-page__faq">
					<div className="about-page__container">
						<h2>Frequently Asked Questions</h2>
						<Accordion items={faqs} />
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default AboutPage;
