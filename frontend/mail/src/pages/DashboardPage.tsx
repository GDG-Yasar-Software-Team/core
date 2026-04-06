import { PlusCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import CampaignCard from "../components/CampaignCard.tsx";
import EmptyState from "../components/EmptyState.tsx";
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import Pagination from "../components/Pagination.tsx";
import { useCampaigns } from "../hooks/useCampaigns.ts";

export default function DashboardPage() {
	const { campaigns, isLoading, error, page, setPage, hasMore, refresh } =
		useCampaigns();

	return (
		<div className="mx-auto max-w-5xl">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-display text-2xl font-bold text-gray-900">
						Kampanyalar
					</h1>
					<p className="mt-1 text-sm text-gray-500">
						E-posta kampanyalarını yönetin ve takip edin.
					</p>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={refresh}
						className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
					>
						<RefreshCw className="h-4 w-4" />
						Yenile
					</button>
					<Link
						to="/campaigns/new"
						className="inline-flex items-center gap-1.5 rounded-lg bg-google-blue px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
					>
						<PlusCircle className="h-4 w-4" />
						Yeni Kampanya
					</Link>
				</div>
			</div>

			{isLoading && (
				<div className="flex justify-center py-20">
					<LoadingSpinner size="lg" />
				</div>
			)}

			{error && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			)}

			{!isLoading && !error && campaigns.length === 0 && (
				<EmptyState
					title="Henüz kampanya yok"
					description="İlk e-posta kampanyanızı oluşturmak için başlayın."
					action={
						<Link
							to="/campaigns/new"
							className="inline-flex items-center gap-1.5 rounded-lg bg-google-blue px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
						>
							<PlusCircle className="h-4 w-4" />
							Kampanya Oluştur
						</Link>
					}
				/>
			)}

			{!isLoading && !error && campaigns.length > 0 && (
				<>
					<div className="grid gap-3 sm:grid-cols-2">
						{campaigns.map((campaign) => (
							<CampaignCard key={campaign.id} campaign={campaign} />
						))}
					</div>
					<Pagination page={page} hasMore={hasMore} onPageChange={setPage} />
				</>
			)}
		</div>
	);
}
