import { ArrowLeft, Calendar, Clock, Edit, Play, Send } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog.tsx";
import ExecutionHistory from "../components/ExecutionHistory.tsx";
import HtmlPreview from "../components/HtmlPreview.tsx";
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import StatusBadge from "../components/StatusBadge.tsx";
import { useCampaign } from "../hooks/useCampaign.ts";
import { useTrigger } from "../hooks/useTrigger.ts";
import { formatDateTime, formatRelative } from "../utils/formatDate.ts";

export default function CampaignDetailPage() {
	const { campaignId } = useParams<{ campaignId: string }>();
	const { campaign, isLoading, error, refresh } = useCampaign(campaignId);
	const { trigger, isTriggering } = useTrigger();
	const [showTriggerDialog, setShowTriggerDialog] = useState(false);

	const handleTrigger = async () => {
		if (!campaignId) return;
		try {
			const result = await trigger(campaignId);
			toast.success(
				`Kampanya gönderildi! ${result.sent_count} başarılı, ${result.failed_count} başarısız.`,
			);
			refresh();
		} catch {
			toast.error("Kampanya tetiklenemedi.");
		} finally {
			setShowTriggerDialog(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-20">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (error || !campaign) {
		return (
			<div className="mx-auto max-w-4xl">
				<Link
					to="/"
					className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
				>
					<ArrowLeft className="h-4 w-4" />
					Kampanyalara Dön
				</Link>
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error ?? "Kampanya bulunamadı."}
				</div>
			</div>
		);
	}

	const isCompleted =
		campaign.status === "completed" || campaign.status === "failed";

	return (
		<div className="mx-auto max-w-4xl">
			<Link
				to="/"
				className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
			>
				<ArrowLeft className="h-4 w-4" />
				Kampanyalara Dön
			</Link>

			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="font-display text-2xl font-bold text-gray-900">
							{campaign.subject}
						</h1>
						<StatusBadge status={campaign.status} />
					</div>
					<div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
						<span className="inline-flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							Oluşturulma: {formatRelative(campaign.created_at)}
						</span>
						{campaign.updated_at && (
							<span className="inline-flex items-center gap-1">
								<Clock className="h-4 w-4" />
								Güncelleme: {formatRelative(campaign.updated_at)}
							</span>
						)}
					</div>
				</div>
				<div className="flex gap-2">
					{!isCompleted && (
						<Link
							to={`/campaigns/${campaign.id}/edit`}
							className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
						>
							<Edit className="h-4 w-4" />
							Düzenle
						</Link>
					)}
					<button
						type="button"
						onClick={() => setShowTriggerDialog(true)}
						className="inline-flex items-center gap-1.5 rounded-lg bg-google-blue px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
					>
						<Play className="h-4 w-4" />
						Şimdi Gönder
					</button>
				</div>
			</div>

			{campaign.scheduled_sends.length > 0 && (
				<div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 className="mb-3 font-display text-lg font-semibold text-gray-900">
						Zamanlanmış Gönderimler
					</h2>
					<div className="space-y-2">
						{campaign.scheduled_sends.map((send) => {
							const executed = campaign.executed_times.some(
								(t) => new Date(t).getTime() === new Date(send.time).getTime(),
							);
							return (
								<div
									key={send.time}
									className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
								>
									<Send
										className={`h-4 w-4 ${executed ? "text-google-green" : "text-gray-400"}`}
									/>
									<div className="flex-1">
										<p className="text-sm font-medium text-gray-900">
											{formatDateTime(send.time)}
										</p>
										{send.subject && (
											<p className="text-xs text-gray-500">
												Konu: {send.subject}
											</p>
										)}
									</div>
									<span
										className={`rounded-full px-2 py-0.5 text-xs font-medium ${
											executed
												? "bg-green-100 text-google-green"
												: "bg-gray-200 text-gray-600"
										}`}
									>
										{executed ? "Gönderildi" : "Bekliyor"}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}

			<div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 className="mb-3 font-display text-lg font-semibold text-gray-900">
					E-posta İçeriği
				</h2>
				<HtmlPreview html={campaign.body_html} className="min-h-[300px]" />
			</div>

			<div className="rounded-xl border border-gray-200 bg-white p-6">
				<h2 className="mb-3 font-display text-lg font-semibold text-gray-900">
					Çalıştırma Geçmişi
				</h2>
				<ExecutionHistory executions={campaign.executions} />
			</div>

			<ConfirmDialog
				open={showTriggerDialog}
				title="Kampanyayı Şimdi Gönder"
				description="Bu kampanya abone olan tüm kullanıcılara hemen gönderilecek. Devam etmek istiyor musunuz?"
				confirmLabel="Gönder"
				variant="primary"
				loading={isTriggering}
				onConfirm={handleTrigger}
				onCancel={() => setShowTriggerDialog(false)}
			/>
		</div>
	);
}
