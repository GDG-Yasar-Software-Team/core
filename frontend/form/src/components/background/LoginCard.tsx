/**
 * LoginCard - Premium Glass Login Panel
 * 
 * Design inspired by Stripe, Linear, Vercel, and OpenAI interfaces.
 * Features:
 * - Glass/frosted card effect with backdrop blur
 * - Gradient glow border effect
 * - Soft shadows and rounded corners
 * - Subtle hover interactions
 * - Modern typography and spacing
 */

import { PillButton } from "../PillButton/PillButton";

export function LoginCard() {
	return (
		<div className="animate-fadeIn">
			{/* 
			 * Outer glow container
			 * Creates a subtle gradient glow around the card
			 */}
			<div className="relative">
				{/* Gradient glow effect behind card */}
				<div 
					className="absolute -inset-1 rounded-[24px] opacity-50 blur-xl"
					style={{
						background: "linear-gradient(135deg, rgba(52, 211, 153, 0.3) 0%, rgba(16, 185, 129, 0.2) 50%, rgba(52, 211, 153, 0.3) 100%)"
					}}
				/>
				
				{/* 
				 * Card Container
				 * 
				 * Design decisions:
				 * - Semi-transparent white with strong backdrop blur
				 * - Large border radius (24px) for modern feel
				 * - Multi-layer shadow for depth
				 * - Gradient border for premium look
				 */}
				<div
					className="
						relative
						w-[400px]
						rounded-[24px]
						border border-white/70
						bg-white/85
						backdrop-blur-2xl
						px-10 py-10
						shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_12px_24px_-8px_rgba(0,0,0,0.1)]
					"
					style={{
						background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)"
					}}
				>
					{/* Subtle inner glow overlay */}
					<div 
						className="absolute inset-0 rounded-[24px] pointer-events-none"
						style={{
							background: "radial-gradient(ellipse at top left, rgba(52, 211, 153, 0.05) 0%, transparent 50%)"
						}}
					/>
					
					{/* Content */}
					<div className="relative">
						{/* Logo and Brand */}
						<div className="flex items-center gap-4 mb-8">
							{/* Logo container with glow */}
							<div className="relative">
								<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/30 to-emerald-500/20 blur-lg" />
								<div className="relative h-16 w-16 rounded-2xl bg-white grid place-items-center shadow-lg border border-gray-100/80">
									<img
										src="/gdg-logo.png"
										alt="GDG"
										className="h-10 w-10 object-contain"
									/>
								</div>
							</div>

							{/* Brand text */}
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-500">
									GDG on Campus
								</p>
								<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
									Yaşar University
								</h1>
							</div>
						</div>

						{/* Divider with gradient */}
						<div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

						{/* Welcome text */}
						<div className="mb-8 text-center">
							<h2 className="text-sm font-medium text-gray-400 mb-2">
								Welcome to
							</h2>
							<p className="text-xl font-bold text-gray-800">
								Form Service Platform
							</p>
						</div>

						{/* 
						 * Login Button
						 * 
						 * Design:
						 * - Full width gradient button
						 * - Pill animation effect with GSAP
						 * - Smooth hover animation
						 */}
						<PillButton
							to="/admin/forms"
							label="Sign In to Dashboard"
						/>

						{/* Footer */}
						<div className="mt-8 text-center">
							<p className="text-xs text-gray-400">
								Secure authentication powered by GDG
							</p>

							{/* Status indicators - Google colors */}
							<div className="flex items-center justify-center gap-2.5 mt-4">
								<StatusDot color="#4285F4" delay={0} />
								<StatusDot color="#EA4335" delay={150} />
								<StatusDot color="#FBBC05" delay={300} />
								<StatusDot color="#34A853" delay={450} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * StatusDot - Animated status indicator with staggered animation
 */
function StatusDot({ color, delay }: { color: string; delay: number }) {
	return (
		<div 
			className="h-2 w-2 rounded-full animate-pulse"
			style={{ 
				backgroundColor: color,
				animationDelay: `${delay}ms`,
				animationDuration: "2s"
			}}
		/>
	);
}

export default LoginCard;
