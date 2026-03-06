/**
 * LoginCard - Premium SaaS Login Panel
 * 
 * Design inspired by Stripe, Linear, and Vercel dashboards.
 * Features:
 * - Glass/frosted card effect with backdrop blur
 * - Soft shadows and rounded corners
 * - Subtle hover interactions
 * - Modern typography and spacing
 * - Minimal, professional aesthetic
 */

import { Link } from "react-router-dom";

export function LoginCard() {
	return (
		<div className="animate-fadeIn">
			{/* 
			 * Card Container
			 * 
			 * Design decisions:
			 * - Semi-transparent white with backdrop blur for glass effect
			 * - Large border radius (20px) for modern feel
			 * - Multi-layer shadow for depth without heaviness
			 * - Subtle border to define edges
			 */}
			<div
				className="
					relative
					w-[380px]
					rounded-[20px]
					border border-white/60
					bg-white/90
					backdrop-blur-xl
					px-10 py-8
					shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12),0_8px_20px_-8px_rgba(0,0,0,0.08)]
				"
			>
				{/* Subtle gradient overlay for premium feel */}
				<div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
				
				{/* Content */}
				<div className="relative">
					{/* Logo and Brand */}
					<div className="flex items-center gap-4 mb-6">
						{/* Logo container with subtle shadow */}
						<div className="h-14 w-14 rounded-2xl bg-white grid place-items-center shadow-md border border-gray-100/80">
							<img
								src="/gdg-logo.png"
								alt="GDG"
								className="h-9 w-9 object-contain"
							/>
						</div>

						{/* Brand text */}
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#34c9a5]">
								GDG on Campus
							</p>
							<h1 className="text-xl font-bold text-gray-900 tracking-tight">
								Yaşar University
							</h1>
						</div>
					</div>

					{/* Divider with gradient fade */}
					<div className="h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent mb-6" />

					{/* Product name */}
					<div className="mb-6">
						<h2 className="text-sm font-medium text-gray-500 mb-1">
							Welcome to
						</h2>
						<p className="text-lg font-semibold text-gray-800">
							Form Service Platform
						</p>
					</div>

					{/* 
					 * Login Button
					 * 
					 * Design decisions:
					 * - Full width for prominence
					 * - Accent color #34c9a5
					 * - Subtle gradient for depth
					 * - Smooth hover transition
					 */}
					<Link
						to="/admin/forms"
						className="
							block w-full
							py-3 px-6
							text-center text-sm font-semibold
							text-white
							bg-gradient-to-r from-[#34c9a5] to-[#2db89a]
							rounded-xl
							shadow-lg shadow-[#34c9a5]/25
							hover:shadow-xl hover:shadow-[#34c9a5]/30
							hover:from-[#2db89a] hover:to-[#28a88a]
							transform hover:-translate-y-0.5
							transition-all duration-200
						"
					>
						Sign In to Dashboard
					</Link>

					{/* Footer info */}
					<p className="mt-6 text-center text-xs text-gray-400">
						Secure authentication powered by GDG
					</p>

					{/* Status indicators - Google colors */}
					<div className="flex items-center justify-center gap-3 mt-4">
						<StatusDot color="#4285F4" />
						<StatusDot color="#EA4335" />
						<StatusDot color="#FBBC05" />
						<StatusDot color="#34A853" />
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * StatusDot - Animated status indicator
 * Uses Google brand colors for GDG association
 */
function StatusDot({ color }: { color: string }) {
	return (
		<div 
			className="h-1.5 w-1.5 rounded-full animate-pulse"
			style={{ backgroundColor: color, opacity: 0.7 }}
		/>
	);
}

export default LoginCard;
