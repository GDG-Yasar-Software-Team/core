import type React from "react";

const Banner: React.FC = () => (
	<div className="relative h-48 overflow-hidden rounded-t-[2.5rem]">
		<img
			src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/form-banner1.png"
			alt="GDG ON CAMPUS Banner"
			className="w-full h-full object-cover"
		/>
	</div>
);

export default Banner;
