import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Send, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import HtmlEditor from "../components/HtmlEditor.tsx";
import HtmlPreview from "../components/HtmlPreview.tsx";
import ScheduleForm from "../components/ScheduleForm.tsx";
import {
	createCampaign,
	createCampaignWithFile,
} from "../services/campaignService.ts";
import type { ScheduledSend } from "../types";

const campaignSchema = z.object({
	subject: z
		.string()
		.min(1, "Konu gereklidir")
		.max(200, "Konu en fazla 200 karakter olabilir"),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function CreateCampaignPage() {
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [bodyHtml, setBodyHtml] = useState("");
	const [schedules, setSchedules] = useState<ScheduledSend[]>([]);
	const [useCustomSubjects, setUseCustomSubjects] = useState(false);
	const [htmlFile, setHtmlFile] = useState<File | null>(null);
	const [useFileUpload, setUseFileUpload] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [showPreview, setShowPreview] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CampaignFormData>({
		resolver: zodResolver(campaignSchema),
	});

	const onSubmit = async (data: CampaignFormData) => {
		if (!useFileUpload && !bodyHtml.trim()) {
			toast.error("E-posta gövdesi (HTML) gereklidir.");
			return;
		}
		if (useFileUpload && !htmlFile) {
			toast.error("Lütfen bir HTML dosyası seçin.");
			return;
		}

		setSubmitting(true);
		try {
			let result: { id: string };

			if (useFileUpload && htmlFile) {
				const formData = new FormData();
				formData.append("subject", data.subject);
				formData.append("body_file", htmlFile);
				if (schedules.length > 0) {
					formData.append("scheduled_sends", JSON.stringify(schedules));
				}
				formData.append("use_custom_subjects", String(useCustomSubjects));
				result = await createCampaignWithFile(formData);
			} else {
				result = await createCampaign({
					subject: data.subject,
					body_html: bodyHtml,
					scheduled_sends: schedules.length > 0 ? schedules : undefined,
					use_custom_subjects: useCustomSubjects || undefined,
				});
			}

			toast.success("Kampanya başarıyla oluşturuldu!");
			navigate(`/campaigns/${result.id}`);
		} catch (err: unknown) {
			toast.error(
				err instanceof Error ? err.message : "Kampanya oluşturulamadı.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-4xl">
			<div className="mb-6">
				<Link
					to="/"
					className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
				>
					<ArrowLeft className="h-4 w-4" />
					Kampanyalara Dön
				</Link>
				<h1 className="font-display text-2xl font-bold text-gray-900">
					Yeni Kampanya
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
							placeholder="E-posta konusu"
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
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setUseFileUpload(false)}
									className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
										!useFileUpload
											? "bg-google-blue text-white"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200"
									}`}
								>
									Editör
								</button>
								<button
									type="button"
									onClick={() => setUseFileUpload(true)}
									className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
										useFileUpload
											? "bg-google-blue text-white"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200"
									}`}
								>
									<Upload className="mr-1 inline h-3 w-3" />
									Dosya Yükle
								</button>
							</div>
						</div>

						{useFileUpload ? (
							<div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
								<input
									ref={fileInputRef}
									type="file"
									accept=".html,.htm"
									onChange={(e) => setHtmlFile(e.target.files?.[0] ?? null)}
									className="hidden"
								/>
								<Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
								<p className="text-sm text-gray-600">
									{htmlFile ? htmlFile.name : "HTML dosyanızı seçin"}
								</p>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="mt-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
								>
									Dosya Seç
								</button>
							</div>
						) : (
							<>
								<div className="mb-2 flex justify-end">
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
							</>
						)}
					</div>
				</div>

				<div className="rounded-xl border border-gray-200 bg-white p-6">
					<h2 className="mb-4 font-display text-lg font-semibold text-gray-900">
						Zamanlanmış Gönderimler
					</h2>
					<p className="mb-4 text-sm text-gray-500">
						Kampanyanın otomatik olarak gönderileceği zamanları belirleyin. Boş
						bırakırsanız kampanyayı manuel olarak tetikleyebilirsiniz.
					</p>
					<ScheduleForm
						schedules={schedules}
						useCustomSubjects={useCustomSubjects}
						onSchedulesChange={setSchedules}
						onCustomSubjectsChange={setUseCustomSubjects}
					/>
				</div>

				<div className="flex justify-end gap-3">
					<Link
						to="/"
						className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
					>
						İptal
					</Link>
					<button
						type="submit"
						disabled={submitting}
						className="inline-flex items-center gap-1.5 rounded-lg bg-google-blue px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 disabled:opacity-50"
					>
						<Send className="h-4 w-4" />
						{submitting ? "Oluşturuluyor..." : "Kampanya Oluştur"}
					</button>
				</div>
			</form>
		</div>
	);
}
