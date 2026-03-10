import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import HtmlEditor from "../components/HtmlEditor.tsx";
import HtmlPreview from "../components/HtmlPreview.tsx";
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import ScheduleForm from "../components/ScheduleForm.tsx";
import { useCampaign } from "../hooks/useCampaign.ts";
import { updateCampaign } from "../services/campaignService.ts";
import type { ScheduledSend } from "../types";

const campaignSchema = z.object({
	subject: z
		.string()
		.min(1, "Konu gereklidir")
		.max(200, "Konu en fazla 200 karakter olabilir"),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function EditCampaignPage() {
	const { campaignId } = useParams<{ campaignId: string }>();
	const navigate = useNavigate();
	const { campaign, isLoading, error } = useCampaign(campaignId);

	const [bodyHtml, setBodyHtml] = useState("");
	const [schedules, setSchedules] = useState<ScheduledSend[]>([]);
	const [useCustomSubjects, setUseCustomSubjects] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [showPreview, setShowPreview] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CampaignFormData>({
		resolver: zodResolver(campaignSchema),
	});

	useEffect(() => {
		if (campaign) {
			reset({ subject: campaign.subject });
			setBodyHtml(campaign.body_html);
			setSchedules(campaign.scheduled_sends);
			setUseCustomSubjects(campaign.use_custom_subjects);
		}
	}, [campaign, reset]);

	const onSubmit = async (data: CampaignFormData) => {
		if (!campaignId) return;
		if (!bodyHtml.trim()) {
			toast.error("E-posta gövdesi (HTML) gereklidir.");
			return;
		}

		setSubmitting(true);
		try {
			await updateCampaign(campaignId, {
				subject: data.subject,
				body_html: bodyHtml,
				scheduled_sends: schedules,
				use_custom_subjects: useCustomSubjects,
			});
			toast.success("Kampanya başarıyla güncellendi!");
			navigate(`/campaigns/${campaignId}`);
		} catch (err: unknown) {
			toast.error(
				err instanceof Error ? err.message : "Kampanya güncellenemedi.",
			);
		} finally {
			setSubmitting(false);
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

	if (isCompleted) {
		return (
			<div className="mx-auto max-w-4xl">
				<Link
					to={`/campaigns/${campaignId}`}
					className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
				>
					<ArrowLeft className="h-4 w-4" />
					Kampanyaya Dön
				</Link>
				<div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
					Tamamlanmış veya başarısız kampanyalar düzenlenemez.
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl">
			<div className="mb-6">
				<Link
					to={`/campaigns/${campaignId}`}
					className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
				>
					<ArrowLeft className="h-4 w-4" />
					Kampanyaya Dön
				</Link>
				<h1 className="font-display text-2xl font-bold text-gray-900">
					Kampanyayı Düzenle
				</h1>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<div className="rounded-xl border border-gray-200 bg-white p-6">
					<h2 className="mb-4 font-display text-lg font-semibold text-gray-900">
						Kampanya Bilgileri
					</h2>

					<div className="mb-4">
						<label
							htmlFor="subject"
							className="mb-1 block text-sm font-medium text-gray-700"
						>
							Konu *
						</label>
						<input
							id="subject"
							type="text"
							{...register("subject")}
							className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
								errors.subject
									? "border-red-400 focus:ring-red-200"
									: "border-gray-300 focus:border-google-blue focus:ring-blue-100"
							}`}
						/>
						{errors.subject && (
							<p className="mt-1 text-xs text-red-500">
								{errors.subject.message}
							</p>
						)}
					</div>

					<div className="mb-4">
						<div className="mb-2 flex items-center justify-between">
							<span className="block text-sm font-medium text-gray-700">
								E-posta Gövdesi (HTML) *
							</span>
							<button
								type="button"
								onClick={() => setShowPreview(!showPreview)}
								className="text-xs font-medium text-google-blue hover:underline"
							>
								{showPreview ? "Editöre Dön" : "Önizleme"}
							</button>
						</div>
						{showPreview ? (
							<HtmlPreview html={bodyHtml} className="min-h-[400px]" />
						) : (
							<HtmlEditor value={bodyHtml} onChange={setBodyHtml} />
						)}
					</div>
				</div>

				<div className="rounded-xl border border-gray-200 bg-white p-6">
					<h2 className="mb-4 font-display text-lg font-semibold text-gray-900">
						Zamanlanmış Gönderimler
					</h2>
					<ScheduleForm
						schedules={schedules}
						useCustomSubjects={useCustomSubjects}
						onSchedulesChange={setSchedules}
						onCustomSubjectsChange={setUseCustomSubjects}
					/>
				</div>

				<div className="flex justify-end gap-3">
					<Link
						to={`/campaigns/${campaignId}`}
						className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
					>
						İptal
					</Link>
					<button
						type="submit"
						disabled={submitting}
						className="inline-flex items-center gap-1.5 rounded-lg bg-google-blue px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 disabled:opacity-50"
					>
						<Save className="h-4 w-4" />
						{submitting ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
					</button>
				</div>
			</form>
		</div>
	);
}
