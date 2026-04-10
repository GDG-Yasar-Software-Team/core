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
			className={`relative flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] bg-cover bg-center text-white ${className}`}
			style={
				backgroundImage
					? { backgroundImage: `url(${backgroundImage})` }
					: undefined
			}
		>
			<div
				className="absolute inset-0 bg-gradient-to-br from-[rgba(66,133,244,0.9)] to-[rgba(234,67,53,0.8)]"
				aria-hidden
			/>
			<div className="relative z-10 text-center px-8 max-w-[800px]">
				<h1 className="text-[length:var(--font-size-2xl)] md:text-[length:var(--font-size-3xl)] font-bold mb-6 m-0 [text-shadow:0_2px_4px_rgba(0,0,0,0.2)]">
					{title}
				</h1>
				<p className="text-[length:var(--font-size-lg)] md:text-[length:var(--font-size-xl)] m-0 opacity-95 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
					{subtitle}
				</p>
			</div>
		</section>
	);
};
