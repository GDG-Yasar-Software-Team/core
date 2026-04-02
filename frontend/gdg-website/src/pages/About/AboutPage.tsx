import type React from "react";
import { Link } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Navigation } from "../../components/layout/Navigation";

export const AboutPage: React.FC = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<Navigation />
			<div className="w-full overflow-hidden">
				<img
					src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/about-page-title/about-title.png"
					alt="About GDG on Campus Yaşar University"
					className="w-full h-auto block"
				/>
			</div>
			<main className="flex-1">
				<section className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] py-24 text-white">
					<div className="max-w-[1200px] mx-auto px-6">
						<div className="border-2 border-[#4285F4] rounded-3xl p-8 bg-transparent shadow-2xl">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
								<div className="flex flex-col gap-8 relative overflow-hidden">
									<div className="absolute top-0 right-0 w-40 h-40 bg-[#4285F4]/15 rounded-full blur-3xl"></div>
									<div className="absolute bottom-0 left-0 w-40 h-40 bg-[#EA4335]/15 rounded-full blur-3xl"></div>
									<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FBBC05]/10 rounded-full blur-3xl"></div>
									<div className="relative z-10 text-[#4285F4] w-20 h-20 md:w-[80px] md:h-[80px] border-2 border-[#4285F4] rounded-lg flex items-center justify-center bg-[#1a1a1a]">
										<svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="w-[60px] h-[60px] md:w-[80px] md:h-[80px]">
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
									<p className="relative z-10 text-base md:text-lg leading-relaxed text-white/90 m-0">
										Design Patterns with Hepsiburada is back with industry expert
										sessions. Learn from a Software Engineering Manager at
										Hepsiburada/Hepsipay about real-world applications of design
										patterns in large-scale systems. Don't just watch the tech
										revolution—drive it by learning best practices and architectural
										patterns used by leading tech companies.
									</p>
									<Link
										to="/events/batuhan-gungor"
										className="relative z-10 inline-block py-3.5 px-8 bg-[#4285F4] text-white no-underline rounded font-medium text-base transition-colors duration-200 hover:bg-[#3367d6] self-start shadow-lg"
									>
										View details
									</Link>
								</div>
								<div className="flex justify-center items-center">
									<img
										src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/design-patterns/banner.gif"
										alt="Design Patterns with Hepsiburada"
										className="w-full max-w-[500px] h-auto rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				<div className="max-w-[1200px] mx-auto py-24 px-6 text-center" />

				<section className="w-full py-24 bg-[#f8f9fa]">
					<div className="max-w-[1200px] mx-auto px-6">
						<img
							src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/tech-summit-banner/techs-banner.png"
							alt="Tech Summit Banner"
							className="w-full h-auto block rounded-2xl shadow-[0_4px_12px_rgba(60,64,67,0.15)]"
						/>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
};

export default AboutPage;
