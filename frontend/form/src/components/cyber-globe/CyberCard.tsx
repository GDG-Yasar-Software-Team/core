import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STATUS_INDICATORS = [
	{ color: "#00ff88", label: "SECURE" },
	{ color: "#00ffff", label: "ACTIVE" },
	{ color: "#ffaa00", label: "MONITOR" },
	{ color: "#ff00ff", label: "SYNC" },
];

export function CyberCard() {
	const [isVisible, setIsVisible] = useState(false);
	const [glitchText, setGlitchText] = useState(false);

	useEffect(() => {
		// Entrance animation
		const timer = setTimeout(() => setIsVisible(true), 500);
		
		// Occasional glitch effect
		const glitchInterval = setInterval(() => {
			setGlitchText(true);
			setTimeout(() => setGlitchText(false), 100);
		}, 5000);

		return () => {
			clearTimeout(timer);
			clearInterval(glitchInterval);
		};
	}, []);

	return (
		<div
			className={`
				relative z-20 transition-all duration-1000 ease-out
				${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
			`}
		>
			{/* Outer glow */}
			<div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#00ff88]/30 via-[#00ffff]/20 to-[#00ff88]/30 blur-xl animate-pulse" />
			
			{/* Card container */}
			<div
				className="
					relative overflow-hidden rounded-2xl
					border border-[#00ff88]/30
					bg-black/60 backdrop-blur-xl
					px-8 py-6
					shadow-[0_0_30px_rgba(0,255,136,0.15)]
				"
			>
				{/* Scan line effect */}
				<div className="absolute inset-0 pointer-events-none overflow-hidden">
					<div
						className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00ff88]/50 to-transparent animate-scan"
						style={{
							animation: "scan 3s linear infinite",
						}}
					/>
				</div>

				{/* Corner decorations */}
				<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ff88]/60" />
				<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00ff88]/60" />
				<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00ff88]/60" />
				<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ff88]/60" />

				{/* Content */}
				<div className="relative">
					{/* Header */}
					<div className="flex items-center gap-3 mb-4">
						{/* Logo container */}
						<div className="relative">
							<div className="absolute -inset-1 rounded-xl bg-[#00ff88]/20 blur-sm" />
							<div className="relative h-12 w-12 rounded-xl border border-[#00ff88]/40 bg-black/50 grid place-items-center">
								<img
									src="/gdg-logo.png"
									alt="GDG"
									className="h-8 w-8 object-contain filter brightness-125"
								/>
							</div>
						</div>

						{/* Title */}
						<div>
							<p
								className={`
									text-[10px] font-mono font-bold uppercase tracking-[0.3em] 
									${glitchText ? "text-[#ff00ff]" : "text-[#00ff88]"}
									transition-colors duration-75
								`}
							>
								GDG ON CAMPUS
							</p>
							<h1 className="text-xl font-bold text-white tracking-wide">
								Yaşar Üniversitesi
							</h1>
						</div>
					</div>

					{/* Divider */}
					<div className="h-px bg-gradient-to-r from-transparent via-[#00ff88]/50 to-transparent mb-4" />

					{/* Subtitle with Log In button */}
					<div className="flex items-center justify-between mb-4">
						<p className="text-sm font-mono text-[#00ffff]/80">
							<span className="text-[#00ff88]">{">"}</span> Form Uygulaması
						</p>
						<Link
							to="/admin/forms"
							className="
								px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider
								border border-[#00ff88]/50 rounded
								bg-[#00ff88]/10 text-[#00ff88]
								hover:bg-[#00ff88]/20 hover:border-[#00ff88]
								transition-all duration-200
								shadow-[0_0_10px_rgba(0,255,136,0.2)]
								hover:shadow-[0_0_15px_rgba(0,255,136,0.4)]
							"
						>
							Log In
						</Link>
					</div>

					{/* Status indicators */}
					<div className="flex items-center justify-center gap-3">
						{STATUS_INDICATORS.map((indicator, i) => (
							<div key={i} className="flex items-center gap-1.5 group">
								<div
									className="relative"
									style={{
										animation: `pulse ${1.5 + i * 0.2}s ease-in-out infinite`,
									}}
								>
									<div
										className="absolute inset-0 rounded-full blur-sm"
										style={{ backgroundColor: indicator.color, opacity: 0.5 }}
									/>
									<div
										className="relative h-2 w-2 rounded-full"
										style={{ backgroundColor: indicator.color }}
									/>
								</div>
								<span className="text-[8px] font-mono text-white/40 hidden group-hover:inline">
									{indicator.label}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Grid overlay */}
				<div
					className="absolute inset-0 pointer-events-none opacity-5"
					style={{
						backgroundImage: `
							linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px),
							linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)
						`,
						backgroundSize: "20px 20px",
					}}
				/>
			</div>

			{/* Add scan animation keyframes */}
			<style>{`
				@keyframes scan {
					0% { top: 0%; }
					100% { top: 100%; }
				}
			`}</style>
		</div>
	);
}

export default CyberCard;
