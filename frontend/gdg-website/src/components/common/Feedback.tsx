import type React from "react";

export interface FeedbackProps {
	className?: string;
}

export const Feedback: React.FC<FeedbackProps> = ({ className = "bg-[#f8f9fa]" }) => {
	return (
		<div
			className={`flex flex-col items-center py-12 px-6 min-h-[420px] relative ${className}`}
		>
			<div className="flex gap-2 mb-8">
				<div className="w-3 h-3 rounded-full bg-[#4285F4]" />
				<div className="w-3 h-3 rounded-full bg-[#EA4335]" />
				<div className="w-3 h-3 rounded-full bg-[#FBBC04]" />
				<div className="w-3 h-3 rounded-full bg-[#34A853]" />
			</div>

			<div className="bg-white border border-[#dadce0] rounded-[24px] pt-10 pb-8 px-5 sm:px-10 max-w-[540px] w-full text-center relative overflow-hidden shadow-sm">
				<div
					className="absolute top-0 left-0 right-0 h-1"
					style={{
						background:
							"linear-gradient(90deg, #4285F4 25%, #EA4335 25% 50%, #FBBC04 50% 75%, #34A853 75%)",
					}}
				/>

				<div className="w-16 h-16 rounded-full bg-[#E8F0FE] flex items-center justify-center mx-auto mb-5">
					<svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
						<path
							d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"
							fill="#4285F4"
						/>
					</svg>
				</div>

				<h2 className="text-[22px] font-bold text-[#1f1f1f] mb-3 tracking-tight">
					We'd Love to <span className="text-[#4285F4]">Hear From You</span>
				</h2>

				<p className="text-[14px] text-[#5f6368] leading-relaxed mb-8 max-w-[380px] mx-auto">
					Have ideas on how we can improve our events, the website, or just want
					to get in touch? Drop an email, and our team will get back to you
					shortly.
				</p>

				<a
					href="mailto:gdgoncampus.yu@gmail.com"
					className="inline-flex items-center gap-2.5 bg-[#4285F4] text-white border-none rounded-full px-7 py-[13px] text-[14px] font-medium cursor-pointer tracking-[0.1px] transition-all hover:bg-[#3367D6] hover:-translate-y-[1px] active:scale-95 mb-6"
				>
					<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
						<path
							d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
							fill="white"
						/>
					</svg>
					gdgoncampus.yu@gmail.com
				</a>

				<div className="flex items-center justify-center gap-2 mt-2">
					<div className="text-[11px] font-medium tracking-[0.4px] text-[#5f6368] flex items-center gap-1.5 uppercase">
						<span className="w-1.5 h-1.5 rounded-full inline-block bg-[#4285F4]" />
						<span className="w-1.5 h-1.5 rounded-full inline-block bg-[#EA4335]" />
						<span className="w-1.5 h-1.5 rounded-full inline-block bg-[#FBBC04]" />
						<span className="w-1.5 h-1.5 rounded-full inline-block bg-[#34A853]" />
						GDG on Campus · Yaşar University
					</div>
				</div>
			</div>
		</div>
	);
};
