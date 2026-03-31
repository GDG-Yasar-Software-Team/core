import type React from "react";

export interface HeroSectionProps {
	title: string;
	subtitle: string;
	backgroundImage?: string;
	className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
	title,
	subtitle,
	backgroundImage,
	className = "",
}) => {
	return (
		<section
			className={`hero-section ${className}`}
			style={
				backgroundImage
					? { backgroundImage: `url(${backgroundImage})` }
					: undefined
			}
		>
			<div className="hero-section__overlay" />
			<div className="hero-section__content">
				<h1 className="hero-section__title">{title}</h1>
				<p className="hero-section__subtitle">{subtitle}</p>
			</div>
		</section>
	);
};
