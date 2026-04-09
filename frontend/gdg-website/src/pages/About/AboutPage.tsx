import type React from "react";
import { useEffect, useState } from "react";
import { Feedback } from "../../components/common/Feedback";
import { Footer } from "../../components/layout/Footer";
import { Navigation } from "../../components/layout/Navigation";
import DomeGallery from "../../components/ui/DomeGallery";
import { fetchEvents } from "../../services/eventService";
import type { Event } from "../../types";

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

const EVENT_BG_COLORS = [
	"bg-[#4285F4]", // Blue
	"bg-[#EA4335]", // Red
	"bg-[#FBBC04]", // Yellow
	"bg-[#34A853]", // Green
];

export const AboutPage: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);

	useEffect(() => {
		const loadEvents = async () => {
			try {
				const data = await fetchEvents(10, 0);
				setEvents(data.slice(0, 4)); // Show recent 4
			} catch (error) {
				console.error("Error fetching events:", error);
			}
		};
		loadEvents();
	}, []);

	return (
		<div className="min-h-screen flex flex-col bg-white overflow-hidden">
			<Navigation />
			<div className="w-full overflow-hidden">
				<img
					src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/about-page-title/about-title.png"
					alt="About GDG on Campus Yaşar University"
					className="w-full h-auto block"
				/>
			</div>
			<main className="flex-1">
				{/* Biz Kimiz Section */}
				<section className="flex flex-col lg:flex-row w-full min-h-[75vh] mt-[-5px]">
					<div className="relative w-full lg:w-1/2 bg-[#121212] text-white p-12 lg:p-24 flex flex-col justify-center">
						<div className="max-w-xl mx-auto lg:ml-0 z-10 w-full">
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 tracking-tight leading-tight">
								Biz Kimiz?
							</h1>
							<p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-6 font-medium">
								Bizler, sadece ders geçmek veya zorunlu staj aramak yerine,
								teknolojiyi öğrenmeye ve yeni bir şeyler üretmeye aşık olduğumuz
								için toplanmış bir avuç Yaşar Üniversitesi öğrencisiyiz.
							</p>
							<p className="text-gray-400 text-base md:text-lg leading-relaxed mb-10">
								Aramızda ilk kez "Hello World" yazmanın heyecanını yaşayanlar da
								var, yıllardır kendi projelerini kodlayanlar da... Amacımız
								mükemmel olmak değil; birbirimizden öğrenmek, hata yapmaktan
								korkmamak ve teknolojinin hızına hep birlikte ayak uydurmak. Ne
								kadar farklı koda baksak da ortak dilimiz: Üretmek.
							</p>
							<a
								href="https://gdg.community.dev/gdg-on-campus-yasar-university-izmir-turkey/"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-block bg-[#4285F4] hover:bg-blue-600 text-white font-semibold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 w-max"
							>
								Topluluğa Katıl
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

				<div className="bg-[#fff] py-20 text-center border-y border-gray-100">
					<h2 className="text-4xl md:text-5xl font-extrabold text-[#202124] mb-6 tracking-tight">
						Neler Yapıyoruz?
					</h2>
					<p className="text-xl text-[#5f6368] max-w-3xl mx-auto px-6 leading-relaxed">
						Yapay zeka demolarından, teknik mülakat hazırlıklarına; saatlerce
						süren kodlama atölyelerinden, alanında uzman isimleri dinlediğimiz
						seminerlere... Teoride bırakmayıp pratiğe döktüğümüz geçmiş
						etkinliklerimize göz at.
					</p>
				</div>

				<div className="flex flex-col gap-24 py-16 px-6 lg:px-24 bg-[#fff] max-w-[1400px] mx-auto">
					{events.map((event, index) => {
						const isEven = index % 2 === 0;
						const GDG_COLORS = [
							"bg-[#4285F4]", // Blue
							"bg-[#EA4335]", // Red
							"bg-[#FBBC04]", // Yellow
							"bg-[#34A853]", // Green
						];
						const bgColor = GDG_COLORS[index % GDG_COLORS.length];
						const imageUrl =
							event.image_url ||
							GALLERY_IMAGES[(index + 1) % GALLERY_IMAGES.length].src;

						return (
							<section
								key={event.id}
								className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} w-full min-h-[40vh] bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden`}
							>
								<div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
									<div className="w-full">
										<div
											className={`inline-block px-5 py-2 mb-6 rounded-full text-xs font-bold tracking-widest uppercase ${bgColor} text-white shadow-sm`}
										>
											{event.event_type || "Event / Atölye"}
										</div>
										<h3 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight text-[#202124]">
											{event.title}
										</h3>
										<p className="text-[#5f6368] text-base md:text-lg leading-relaxed mb-10 line-clamp-6">
											{event.description}
										</p>
										{event.registration_form_url && (
											<a
												href={event.registration_form_url}
												target="_blank"
												rel="noopener noreferrer"
												className={`inline-block text-white hover:brightness-110 font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-md w-max ${bgColor}`}
											>
												Kayıt Ol & Detayları Gör
											</a>
										)}
									</div>
								</div>

								<div className="w-full lg:w-1/2 p-6 lg:p-8 flex items-center justify-center bg-gray-50/50">
									<div className="relative w-full h-full min-h-[300px] lg:min-h-[450px] rounded-[1.5rem] overflow-hidden shadow-md">
										<img
											src={imageUrl}
											alt={event.title}
											className="absolute inset-0 w-full h-full object-cover"
										/>
										<div className="absolute inset-0 bg-black/5"></div>
									</div>
								</div>
							</section>
						);
					})}
				</div>

				<section className="w-full py-20 bg-[#f8f9fa] overflow-hidden border-t border-gray-100">
					<div className="text-center mb-10">
						<h2 className="text-3xl md:text-4xl font-bold text-[#202124]">
							Ekibimizden Kareler
						</h2>
						<p className="text-gray-500 mt-3 text-lg">
							Birlikte olduğumuz, öğrendiğimiz ve eğlendiğimiz her an...
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
							overlayBlurColor="#f8f9fa"
							grayscale={false}
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
