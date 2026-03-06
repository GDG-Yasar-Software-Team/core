/**
 * LoginCard - Clean login UI component
 * 
 * A simple, centered card for the home page.
 * Pure HTML/CSS - no external dependencies.
 */

import { Link } from "react-router-dom";

export function LoginCard() {
	return (
		<div className="animate-fadeIn">
			{/* Card container */}
			<div
				className="
					rounded-2xl
					border border-gray-200
					bg-white
					px-8 py-6
					shadow-lg
				"
			>
				{/* Content */}
				<div>
					{/* Header */}
					<div className="flex items-center gap-3 mb-4">
						{/* Logo container */}
						<div className="h-12 w-12 rounded-xl border border-gray-200 bg-white grid place-items-center shadow-sm">
							<img
								src="/gdg-logo.png"
								alt="GDG"
								className="h-8 w-8 object-contain"
							/>
						</div>

						{/* Title */}
						<div>
							<p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-emerald-600">
								GDG ON CAMPUS
							</p>
							<h1 className="text-xl font-bold text-gray-900 tracking-wide">
								Yaşar Üniversitesi
							</h1>
						</div>
					</div>

					{/* Divider */}
					<div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

					{/* Subtitle with Login button */}
					<div className="flex items-center justify-between mb-4">
						<p className="text-sm font-mono text-gray-600">
							<span className="text-emerald-600">{">"}</span> Form Uygulaması
						</p>
						<Link
							to="/admin/forms"
							className="
								px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider
								border border-emerald-500 rounded-lg
								bg-emerald-50 text-emerald-700
								hover:bg-emerald-100 hover:border-emerald-600
								transition-all duration-200
								shadow-sm hover:shadow
							"
						>
							Log In
						</Link>
					</div>

					{/* Status indicators */}
					<div className="flex items-center justify-center gap-4">
						<StatusDot color="bg-blue-500" />
						<StatusDot color="bg-red-500" />
						<StatusDot color="bg-yellow-500" />
						<StatusDot color="bg-green-500" />
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * StatusDot - Simple colored indicator
 */
function StatusDot({ color }: { color: string }) {
	return (
		<div className="relative">
			<div className={`h-2 w-2 rounded-full ${color} animate-pulse`} />
		</div>
	);
}

export default LoginCard;
