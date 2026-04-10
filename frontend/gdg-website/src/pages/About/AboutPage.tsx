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
		<div className="min-h-screen flex flex-col bg-white overflow-hidden">
			<Navigation />
			<main className="flex-1">
				{/* Who Are We Section */}
				<section className="flex flex-col lg:flex-row w-full min-h-[75vh]">
					<div className="relative w-full lg:w-1/2 bg-[#121212] text-white p-12 lg:p-24 flex flex-col justify-center">
						<div className="max-w-xl mx-auto lg:ml-0 z-10 w-full">
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 tracking-tight leading-tight">
								Who Are We?
							</h1>
							<p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-6 font-medium">
								We are a group of Yasar University students gathered because we
								love learning technology and creating new things, rather than
								just passing classes or looking for mandatory internships.
							</p>
							<p className="text-gray-400 text-base md:text-lg leading-relaxed mb-10">
								There are some of us experiencing the excitement of writing
								"Hello World" for the first time, and some who have been coding
								their own projects for years... Our goal is not to be perfect;
								but to learn from each other, not be afraid of making mistakes,
								and keep up with the speed of technology together. No matter how
								different the code we look at, our common language is: Creating.
							</p>
							<a
								href="https://gdg.community.dev/gdg-on-campus-yasar-university-izmir-turkey/"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-block bg-[#4285F4] hover:bg-blue-600 text-white font-semibold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 w-max"
							>
								Join the Community
							</a>
						</div>
						<div className="absolute bottom-12 right-12 opacity-30 pointer-events-none">
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

					<div className="w-full lg:w-1/2 bg-[#4285F4] p-8 lg:p-0 flex items-center justify-center relative overflow-hidden">
						<div className="relative w-full max-w-[500px] aspect-square lg:h-[75%] lg:w-[75%] lg:max-w-none z-10">
							<div className="absolute inset-0 bg-white/10 rounded-[4rem] md:rounded-[6rem] lg:rounded-[120px_20px_120px_20px] overflow-hidden shadow-2xl">
								<img
									src={GALLERY_IMAGES[0].src}
									alt="GDG Team"
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="absolute -bottom-6 -right-6 lg:bottom-12 lg:-right-12 bg-white text-black px-6 py-5 rounded-[2rem] shadow-2xl font-bold font-sans italic rotate-[-8deg] animate-bounce z-20">
								<span className="text-2xl">
									<span className="text-[#EA4335]">Let's </span>
									<span className="text-[#4285F4]">code </span>
									<span className="text-[#34A853]">stuff!</span>
								</span>{" "}
								<span className="text-3xl ml-1">🚀</span>
							</div>
						</div>
						<div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
						<div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-[#34A853]/20 rounded-full blur-3xl pointer-events-none"></div>
					</div>
				</section>

				<div className="bg-[#f8f9fa] py-20 text-center border-y border-gray-200">
					<h2 className="text-4xl md:text-5xl font-extrabold text-[#202124] mb-6 tracking-tight">
						What Do We Do?
					</h2>
					<p className="text-xl text-[#5f6368] max-w-4xl mx-auto px-6 leading-relaxed">
						We are more than just a club; we are a community that bridges the gap between 
						theory and practice. Check out our diverse domains where we learn, build, and grow together.
					</p>
				</div>

				<div className="flex flex-col py-16 px-6 lg:px-24 bg-[#f8f9fa] gap-20 mx-auto">
					{[
						{
							title: "Hands-on Workshops",
							description: "We believe the best way to learn is by doing. We organize technical workshops ranging from Web and Mobile Development to AI and Cloud Computing. You bring your laptop, and we write code together, debug in real-time, and leave with a working project.",
							color: "bg-[#4285F4]",
							tag: "Learn By Doing",
							icon: <svg className="w-10 h-10 text-[#4285F4]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
						},
						{
							title: "Tech Talks & Seminars",
							description: "We host industry professionals, Google Developer Experts, and experienced alumni to share their knowledge, career journeys, and insights about the latest trends in the tech ecosystem. Getting direct experience from the experts is invaluable.",
							color: "bg-[#EA4335]",
							tag: "Listen to Experts",
							icon: <svg className="w-10 h-10 text-[#EA4335]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
						},
						{
							title: "Study & Connect",
							description: "Coding alone can be exhausting. Our \"Study & Connect\" sessions are designed to bring students together to study, debug, and work on their personal projects in a collaborative environment. Grab your coffee, join the circle, and let's get productive.",
							color: "bg-[#FBBC04]",
							tag: "Grow Together",
							icon: <svg className="w-10 h-10 text-[#FBBC04]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
						},
						{
							title: "Hackathons & Projects",
							description: "We encourage our members to organize and participate in hackathons. These events are the perfect opportunity to build real-world solutions under pressure, work in diverse teams, and push your limits. We design, we code, and we ship.",
							color: "bg-[#34A853]",
							tag: "Build & Ship",
							icon: <svg className="w-10 h-10 text-[#34A853]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
						}
					].map((block, index) => {
						const isEven = index % 2 === 0;
						// Use gallery images to match the visual language of the page, bypassing index 0 since it's already at top
						const imgUrl = GALLERY_IMAGES[(index + 1) % GALLERY_IMAGES.length].src;

						return (
							<div
								key={block.title}
								className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} w-full min-h-[450px] bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden max-w-[1400px] mx-auto`}
							>
								<div className="w-full lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
									<div className="w-full">
										<div className="flex items-center gap-4 mb-8">
											<div className={`w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100`}>
												{block.icon}
											</div>
											<div className={`inline-block px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase ${block.color} text-white shadow-sm`}>
												{block.tag}
											</div>
										</div>
										<h3 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight text-[#202124]">
											{block.title}
										</h3>
										<p className="text-[#5f6368] text-lg md:text-xl leading-relaxed">
											{block.description}
										</p>
									</div>
								</div>

								<div className="w-full lg:w-1/2 p-4 lg:p-6 flex items-center justify-center bg-gray-50/50">
									<div className="relative w-full h-full min-h-[350px] lg:min-h-[100%] rounded-[2rem] overflow-hidden shadow-md group">
										<img
											src={imgUrl}
											alt={block.title}
											className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				<section className="w-full py-24 bg-white overflow-hidden border-t border-gray-100">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-[#202124] tracking-tight">
							Moments From Our Team
						</h2>
						<p className="text-gray-500 mt-3 text-lg">
							Every moment we spend together, learning, and having fun...
						</p>
					</div>
					<div className="w-full h-[400px] sm:h-[500px] md:h-[600px] relative pointer-events-auto">
						<DomeGallery
							images={GALLERY_IMAGES}
							fit={0.8}
							minRadius={300}
							maxVerticalRotationDeg={0}
							segments={22}
							dragDampening={2}
							overlayBlurColor="#ffffff"
							grayscale={false}
						/>
					</div>
				</section>
				
				<div className="border-t border-gray-100">
					<Feedback className="bg-white py-24" />
				</div>
			</main>
			<Footer />
		</div>
	);
};

export default AboutPage;
