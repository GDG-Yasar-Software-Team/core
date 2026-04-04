import type React from "react";
import { Footer } from "../../components/layout/Footer";
import { Navigation } from "../../components/layout/Navigation";
import { Feedback } from "../../components/common/Feedback";
import DomeGallery from "../../components/ui/DomeGallery";

const GALLERY_IMAGES = [
	{ src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/C0A2367C-425D-42F4-8518-E8EF9681AB59_1_105_c.jpeg", alt: "GDG Event 1" },
	{ src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_2394.jpg", alt: "GDG Event 2" },
	{ src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_2422.jpg", alt: "GDG Event 3" },
	{ src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_3340.jpg", alt: "GDG Event 4" },
	{ src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_4219.JPG", alt: "GDG Event 5" },
	{ src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_4265.jpg", alt: "GDG Event 6" },
	{ src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_7674.jpg", alt: "GDG Event 7" },
	{ src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_8489.jpg", alt: "GDG Event 8" },
	{ src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/WhatsApp%20Image%202026-02-05%20at%2023.47.20.jpeg", alt: "GDG Event 9" }
].sort(() => Math.random() - 0.5);

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
				<section className="w-full py-16 lg:py-24 relative overflow-hidden">
					<div className="w-full max-w-[1440px] mx-auto px-6">
						<div className="flex flex-col xl:flex-row items-center justify-between gap-12 xl:gap-8">
							
							{/* Sol Metinler */}
							<div className="w-full xl:w-[320px] flex flex-col sm:flex-row xl:flex-col gap-10 z-10 flex-shrink-0 text-center xl:text-left order-2 xl:order-1">
								<div className="flex-1">
									<div className="w-14 h-14 bg-[#4285F4]/10 text-[#4285F4] rounded-2xl flex items-center justify-center mb-6 mx-auto xl:mx-0 shadow-sm border border-[#4285F4]/20 transform transition-transform hover:-translate-y-1">
										<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
										</svg>
									</div>
									<h3 className="text-2xl font-bold text-[#1f1f1f] mb-3">Connect</h3>
									<p className="text-gray-600 leading-relaxed text-[15px]">
										Meet student developers and tech enthusiasts on campus. Build a powerful network with like-minded peers sharing your tech passion.
									</p>
								</div>
								<div className="flex-1">
									<div className="w-14 h-14 bg-[#34A853]/10 text-[#34A853] rounded-2xl flex items-center justify-center mb-6 mx-auto xl:mx-0 shadow-sm border border-[#34A853]/20 transform transition-transform hover:-translate-y-1">
										<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
										</svg>
									</div>
									<h3 className="text-2xl font-bold text-[#1f1f1f] mb-3">Learn</h3>
									<p className="text-gray-600 leading-relaxed text-[15px]">
										Master new technologies across various stacks. Expand your horizons via hands-on workshops, code-labs, and expert-led tech talks.
									</p>
								</div>
							</div>

							{/* Galeri (Orta Merkez) */}
							<div className="w-full xl:flex-[2] h-[550px] md:h-[750px] relative bg-transparent order-1 xl:order-2 flex-shrink-0 xl:flex-shrink max-w-full">
								<div className="absolute inset-0 scale-[1.05] xl:scale-100 pointer-events-auto">
									<DomeGallery
										images={GALLERY_IMAGES}
										fit={0.9}
										minRadius={350}
										maxVerticalRotationDeg={0}
										segments={22}
										dragDampening={2}
										overlayBlurColor="#ffffff"
										grayscale={false}
									/>
								</div>
							</div>

							{/* Sağ Metinler */}
							<div className="w-full xl:w-[320px] flex flex-col sm:flex-row xl:flex-col gap-10 z-10 flex-shrink-0 text-center xl:text-right order-3 xl:order-3">
								<div className="flex-1">
									<div className="w-14 h-14 bg-[#FBBC04]/10 text-[#FBBC04] rounded-2xl flex items-center justify-center mb-6 mx-auto xl:ml-auto xl:mr-0 shadow-sm border border-[#FBBC04]/20 transform transition-transform hover:-translate-y-1">
										<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 14-4-4-6 6" />
										</svg>
									</div>
									<h3 className="text-2xl font-bold text-[#1f1f1f] mb-3">Grow</h3>
									<p className="text-gray-600 leading-relaxed text-[15px]">
										Apply theoretical knowledge to real-world challenges. Accelerate your career growth by moving from student to junior developer.
									</p>
								</div>
								<div className="flex-1">
									<div className="w-14 h-14 bg-[#EA4335]/10 text-[#EA4335] rounded-2xl flex items-center justify-center mb-6 mx-auto xl:ml-auto xl:mr-0 shadow-sm border border-[#EA4335]/20 transform transition-transform hover:-translate-y-1">
										<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
										</svg>
									</div>
									<h3 className="text-2xl font-bold text-[#1f1f1f] mb-3">Build</h3>
									<p className="text-gray-600 leading-relaxed text-[15px]">
										Collaborate on projects, join GDG hackathons, and shape the digital ecosystem while crafting solutions for your community.
									</p>
								</div>
							</div>

						</div>
					</div>
				</section>

				<section className="w-full py-24 bg-[#f8f9fa]">
					<div className="w-full">
						<img
							src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/tech-summit-banner/techs-banner.png"
							alt="Tech Summit Banner"
							className="w-full h-auto block"
						/>
					</div>
				</section>
				<Feedback />
			</main>
			<Footer />
		</div>
	);
};

export default AboutPage;
