import type React from "react";
import { Feedback } from "../../components/common/Feedback";
import { Footer } from "../../components/layout/Footer";
import { Navigation } from "../../components/layout/Navigation";
import DomeGallery from "../../components/ui/DomeGallery";

const GALLERY_IMAGES = [
	{
		src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/C0A2367C-425D-42F4-8518-E8EF9681AB59_1_105_c.jpeg",
		alt: "GDG Event 1",
	},
	{
		src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_2394.jpg",
		alt: "GDG Event 2",
	},
	{
		src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_2422.jpg",
		alt: "GDG Event 3",
	},
	{
		src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_3340.jpg",
		alt: "GDG Event 4",
	},
	{
		src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_4219.JPG",
		alt: "GDG Event 5",
	},
	{
		src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_4265.jpg",
		alt: "GDG Event 6",
	},
	{
		src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_7674.jpg",
		alt: "GDG Event 7",
	},
	{
		src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_8489.jpg",
		alt: "GDG Event 8",
	},
	{
		src: "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/WhatsApp%20Image%202026-02-05%20at%2023.47.20.jpeg",
		alt: "GDG Event 9",
	},
].sort(() => Math.random() - 0.5);

export const AboutPage: React.FC = () => {
	return (
		<div className="min-h-screen flex flex-col bg-white overflow-x-clip max-w-full">
			<Navigation />
			<main className="flex-1 overflow-x-clip max-w-full">
				{/* Who Are We Section */}
				<section className="flex flex-col lg:flex-row w-full max-w-full min-h-[75vh] overflow-x-clip">
					<div className="relative w-full lg:w-1/2 bg-[#121212] text-white p-6 sm:p-8 lg:p-24 flex flex-col justify-center">
						<div className="max-w-xl mx-auto lg:ml-0 z-10 w-full">
							<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 sm:mb-8 tracking-tight leading-tight">
								Who Are We?
							</h1>
							<p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed mb-5 sm:mb-6 font-medium">
								We are a university-based student community that brings together
								individuals interested in technology, innovation, and personal
								development.
							</p>
							<p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed mb-7 sm:mb-10">
								Our members come from different backgrounds, but we share a
								common goal: learning by doing and growing together.
							</p>
							<a
								href="https://gdg.community.dev/gdg-on-campus-yasar-university-izmir-turkey/"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center bg-[#4285F4] hover:bg-blue-600 text-white text-sm sm:text-base font-semibold py-3 sm:py-4 px-6 sm:px-10 rounded-full transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 w-full sm:w-max"
							>
								Join the Community
							</a>
						</div>
						<div className="absolute bottom-6 right-6 sm:bottom-12 sm:right-12 opacity-30 pointer-events-none hidden sm:block">
							<svg
								width="64"
								height="80"
								viewBox="0 0 24 32"
								fill="none"
								stroke="#4285F4"
								strokeWidth="2"
							>
								<path
									d="M8 2 L20 2 L20 30 L8 30"
									strokeLinecap="square"
									strokeLinejoin="miter"
								/>
							</svg>
						</div>
					</div>

					<div className="w-full lg:w-1/2 bg-[#4285F4] p-4 sm:p-6 lg:p-0 flex items-center justify-center relative overflow-hidden">
						<div className="relative w-full max-w-[320px] sm:max-w-[460px] aspect-square lg:h-[75%] lg:w-[75%] lg:max-w-none z-10">
							<div className="absolute inset-0 bg-white/10 rounded-[2.5rem] sm:rounded-[4rem] lg:rounded-[120px_20px_120px_20px] overflow-hidden shadow-2xl">
								<img
									src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/64670bc4-2530-468e-a450-bfb3c4b2cd34.jpg"
									alt="GDG Team"
									className="w-full h-full object-cover"
								/>
							</div>
						</div>
						<div className="absolute top-[-20%] right-[-30%] sm:top-[-10%] sm:right-[-10%] w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
						<div className="absolute bottom-[-20%] left-[-30%] sm:bottom-[-10%] sm:left-[-10%] w-56 h-56 sm:w-80 sm:h-80 bg-[#34A853]/20 rounded-full blur-3xl pointer-events-none" />
					</div>
				</section>

				<div className="bg-[#f8f9fa] py-14 sm:py-20 text-center border-y border-gray-200 max-w-full overflow-x-clip">
					<h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#202124] mb-5 sm:mb-6 tracking-tight">
						What Do We Do?
					</h2>
					<p className="text-base sm:text-lg md:text-xl text-[#5f6368] max-w-4xl mx-auto px-4 sm:px-6 leading-relaxed">
						We are more than just a club; we are a community that bridges the
						gap between theory and practice. Check out our diverse domains where
						we learn, build, and grow together.
					</p>
				</div>

				<div className="flex flex-col py-12 sm:py-16 px-4 sm:px-6 lg:px-24 bg-[#f8f9fa] gap-10 sm:gap-14 lg:gap-20 mx-auto max-w-full overflow-x-clip">
					{[
						{
							title: "Hands-on Workshops",
							description:
								"We believe the best way to learn is by doing. We organize technical workshops ranging from Web and Mobile Development to AI and Cloud Computing. You bring your laptop, and we write code together, debug in real-time, and leave with a working project.",
							color: "bg-[#4285F4]",
							tag: "Learn By Doing",
							image:
								"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_8489.jpg",
							icon: (
								<svg
									className="w-10 h-10 text-[#4285F4]"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
									/>
								</svg>
							),
						},
						{
							title: "Tech Talks & Seminars",
							description:
								"We host industry professionals, Google Developer Experts, and experienced alumni to share their knowledge, career journeys, and insights about the latest trends in the tech ecosystem. Getting direct experience from the experts is invaluable.",
							color: "bg-[#EA4335]",
							tag: "Listen to Experts",
							image:
								"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/IMG_7674.jpg",
							icon: (
								<svg
									className="w-10 h-10 text-[#EA4335]"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							),
						},
						{
							title: "Coffee Talks",
							description:
								"Coffee Talks are post-event networking sessions designed to bring students together with guest speakers and professionals from the industry. Through these conversations, participants can gain practical insights, exchange ideas, and expand their professional network in a more personal and engaging environment.",
							color: "bg-[#FBBC04]",
							tag: "Grow Together",
							icon: (
								<svg
									className="w-10 h-10 text-[#FBBC04]"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
									/>
								</svg>
							),
							image:
								"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/WhatsApp%20Image%202026-04-10%20at%2016.07.10.jpeg",
						},
						{
							title: "Problem-Solving & Code Together",
							description:
								"A session designed around collaboration, discussion, and live coding. Participants had the chance to think through challenges together with our guest speaker, exchange ideas, and experience what it feels like to solve problems and write code in an interactive environment.",
							color: "bg-[#34A853]",
							tag: "Build & Ship",
							icon: (
								<svg
									className="w-10 h-10 text-[#34A853]"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							),
							image:
								"https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/gdg-events/events-picture/WhatsApp%20Image%202026-02-05%20at%2023.47.20.jpeg",
						},
					].map((block, index) => {
						const isEven = index % 2 === 0;
						// Use gallery images to match the visual language of the page, bypassing index 0 since it's already at top
						const imgUrl =
							block.image ||
							GALLERY_IMAGES[(index + 1) % GALLERY_IMAGES.length].src;

						return (
							<div
								key={block.title}
								className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} w-full bg-white rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden max-w-[1400px] mx-auto`}
							>
								<div className="w-full lg:w-1/2 p-5 sm:p-8 lg:p-20 flex flex-col justify-center">
									<div className="w-full">
										<div className="flex items-center flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
											<div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl sm:rounded-3xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
												{block.icon}
											</div>
											<div
												className={`inline-block px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide sm:tracking-widest uppercase ${block.color} text-white shadow-sm`}
											>
												{block.tag}
											</div>
										</div>
										<h3 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 tracking-tight leading-tight text-[#202124] break-words">
											{block.title}
										</h3>
										<p className="text-[#5f6368] text-base sm:text-lg md:text-xl leading-relaxed">
											{block.description}
										</p>
									</div>
								</div>

								<div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6 flex items-center justify-center bg-gray-50/50">
									<div className="relative w-full h-full min-h-[220px] sm:min-h-[300px] lg:min-h-[100%] rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden shadow-md group">
										<img
											src={imgUrl}
											alt={block.title}
											className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
									</div>
								</div>
							</div>
						);
					})}
				</div>

				<section className="w-full max-w-full py-16 sm:py-24 bg-white overflow-x-clip border-t border-gray-100">
					<div className="text-center mb-10 sm:mb-16 px-4">
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#202124] tracking-tight">
							Moments From Our Team
						</h2>
						<p className="text-gray-500 mt-3 text-base sm:text-lg">
							Every moment we spend together, learning, and having fun...
						</p>
					</div>
					<div className="w-full h-[300px] sm:h-[420px] md:h-[560px] relative pointer-events-auto">
						<DomeGallery
							images={GALLERY_IMAGES}
							fit={0.8}
							minRadius={180}
							maxVerticalRotationDeg={0}
							segments={22}
							dragDampening={2}
							overlayBlurColor="#ffffff"
							grayscale={false}
						/>
					</div>
				</section>

				<div className="border-t border-gray-100">
					<Feedback className="bg-white py-16 sm:py-24" />
				</div>
			</main>
			<Footer />
		</div>
	);
};

export default AboutPage;
