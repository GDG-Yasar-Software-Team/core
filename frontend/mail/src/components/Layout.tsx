import { Menu } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Sidebar from "./Sidebar";

export default function Layout() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="flex h-screen overflow-hidden bg-gray-50">
			<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

			<div className="flex flex-1 flex-col overflow-hidden">
				<header className="flex h-16 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
					>
						<Menu className="h-5 w-5" />
					</button>
					<span className="ml-3 font-display text-lg font-bold text-gray-900">
						GDG Mail
					</span>
				</header>

				<main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
					<Outlet />
				</main>
			</div>

			<Toaster position="bottom-right" richColors />
		</div>
	);
}
