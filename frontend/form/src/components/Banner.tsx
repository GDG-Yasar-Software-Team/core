import type React from "react";

const Banner: React.FC = () => (
	<div className="relative flex items-center justify-between px-8 py-8 bg-gradient-to-r from-[#0d1b4a] to-[#1a2f6e]">
		<img
			src="https://gdgoncampuserzincan.com/GDSC_icon.png"
			alt="GDG on Campus"
			className="h-10 object-contain"
		/>
		<h2 className="text-white font-bold text-2xl tracking-wide drop-shadow-md">
			GDG on Campus
		</h2>
		<img
			src="https://cdn.eleman.net/universite_img/yasar-uni.png"
			alt="Yaşar Üniversitesi"
			className="h-16 object-contain -mt-2"
		/>
	</div>
);

export default Banner;
