import type React from "react";
import { Navigation } from "../../components/layout/Navigation";
import { Footer } from "../../components/layout/Footer";
import "./AboutPage.css";

export const AboutPage: React.FC = () => {
	return (
		<div className="about-page">
			<Navigation />
			<main className="about-page__content">
				<div className="about-page__container">
					<h1>About Us</h1>
					<p>Coming soon...</p>
				</div>
			</main>
			<Footer />
		</div>
	);
};

export default AboutPage;
