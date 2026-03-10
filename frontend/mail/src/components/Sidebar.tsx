import { LayoutDashboard, Mail, PlusCircle, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
	open: boolean;
	onClose: () => void;
}

const navItems = [
	{ to: "/", label: "Kampanyalar", icon: LayoutDashboard },
	{ to: "/campaigns/new", label: "Yeni Kampanya", icon: PlusCircle },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
	const location = useLocation();

	return (
		<>
			{open && (
				<button
					type="button"
					className="fixed inset-0 z-30 bg-black/30 lg:hidden"
					onClick={onClose}
					onKeyDown={(e) => e.key === "Escape" && onClose()}
					aria-label="Menüyü kapat"
				/>
			)}

			<aside
				className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
					open ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
					<Link to="/" className="flex items-center gap-2.5">
						<Mail className="h-6 w-6 text-google-blue" />
						<span className="font-display text-lg font-bold text-gray-900">
							GDG Mail
						</span>
					</Link>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 lg:hidden"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<nav className="flex-1 space-y-1 px-3 py-4">
					{navItems.map((item) => {
						const active = location.pathname === item.to;
						return (
							<Link
								key={item.to}
								to={item.to}
								onClick={onClose}
								className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
									active
										? "bg-blue-50 text-google-blue"
										: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
								}`}
							>
								<item.icon className="h-5 w-5" />
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div className="border-t border-gray-200 p-4">
					<p className="text-xs text-gray-400">GDG on Campus Yasar</p>
				</div>
			</aside>
		</>
	);
}
