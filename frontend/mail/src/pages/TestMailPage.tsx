import {
	CheckCircle,
	FlaskConical,
	Plus,
	Send,
	Trash2,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import HtmlEditor from "../components/HtmlEditor.tsx";
import HtmlPreview from "../components/HtmlPreview.tsx";
import { sendTestMail } from "../services/campaignService.ts";
import type { TestMailResult } from "../types";

export default function TestMailPage() {
	const [emails, setEmails] = useState<string[]>([""]);
	const [subject, setSubject] = useState("");
	const [bodyHtml, setBodyHtml] = useState("");
	const [showPreview, setShowPreview] = useState(false);
	const [sending, setSending] = useState(false);
	const [results, setResults] = useState<TestMailResult[] | null>(null);

	const addEmail = () => {
		if (emails.length >= 10) {
			toast.error("En fazla 10 alıcı eklenebilir.");
			return;
		}
		setEmails([...emails, ""]);
	};

	const removeEmail = (index: number) => {
		setEmails(emails.filter((_, i) => i !== index));
	};

	const updateEmail = (index: number, value: string) => {
		setEmails(emails.map((e, i) => (i === index ? value : e)));
	};

	const handleSend = async () => {
		const validEmails = emails.map((e) => e.trim()).filter(Boolean);

		if (validEmails.length === 0) {
			toast.error("En az bir geçerli e-posta adresi girin.");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const invalidEmails = validEmails.filter((e) => !emailRegex.test(e));
		if (invalidEmails.length > 0) {
			toast.error(`Geçersiz e-posta adresi: ${invalidEmails.join(", ")}`);
			return;
		}

		if (!subject.trim()) {
			toast.error("Konu gereklidir.");
			return;
		}

		if (!bodyHtml.trim()) {
			toast.error("E-posta içeriği gereklidir.");
			return;
		}

		setSending(true);
		setResults(null);
		try {
			const response = await sendTestMail({
				emails: validEmails,
				subject: subject.trim(),
				body_html: bodyHtml,
			});
			setResults(response.results);
			if (response.failed_count === 0) {
				toast.success(
					`Test maili ${response.sent_count} alıcıya başarıyla gönderildi!`,
				);
			} else if (response.sent_count === 0) {
				toast.error("Tüm gönderimler başarısız oldu.");
			} else {
				toast.warning(
					`${response.sent_count} başarılı, ${response.failed_count} başarısız.`,
				);
			}
		} catch (err: unknown) {
			toast.error(
				err instanceof Error ? err.message : "Test maili gönderilemedi.",
			);
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="mx-auto max-w-3xl">
			<div className="mb-6">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
						<FlaskConical className="h-5 w-5 text-amber-600" />
					</div>
					<div>
						<h1 className="font-display text-2xl font-bold text-gray-900">
							Test Maili Gönder
						</h1>
						<p className="text-sm text-gray-500">
							Gerçek kullanıcılara göndermeden önce e-postanı test et.
						</p>
					</div>
				</div>

				<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
					<p className="text-sm text-amber-800">
						<strong>Not:</strong> Bu gönderimler veritabanına kaydedilmez,
						kullanıcı servisi çağrılmaz ve abonelik listesiyle etkileşime
						girilmez. Konu başlığına otomatik olarak{" "}
						<code className="rounded bg-amber-100 px-1 font-mono text-xs">
							[TEST]
						</code>{" "}
						eklenir.
					</p>
				</div>
			</div>

			<div className="space-y-6">
				{/* Email Recipients */}
				<div className="rounded-xl border border-gray-200 bg-white p-6">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="font-display text-lg font-semibold text-gray-900">
							Alıcılar
						</h2>
						<span className="text-xs text-gray-400">{emails.length}/10</span>
					</div>

					<div className="space-y-2">
						{emails.map((email, index) => {
							const inputId = `test-email-${index}`;
							return (
								<div key={inputId} className="flex items-center gap-2">
									<input
										id={inputId}
										type="email"
										value={email}
										onChange={(e) => updateEmail(index, e.target.value)}
										placeholder="ornek@gmail.com"
										className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-google-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
									/>
									{emails.length > 1 && (
										<button
											type="button"
											onClick={() => removeEmail(index)}
											className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-google-red"
											aria-label="Alıcıyı sil"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									)}
								</div>
							);
						})}
					</div>

					<button
						type="button"
						onClick={addEmail}
						disabled={emails.length >= 10}
						className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-google-blue hover:text-google-blue disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Plus className="h-4 w-4" />
						Alıcı Ekle
					</button>
				</div>

				{/* Subject */}
				<div className="rounded-xl border border-gray-200 bg-white p-6">
					<h2 className="mb-4 font-display text-lg font-semibold text-gray-900">
						Konu
					</h2>
					<input
						id="test-subject"
						type="text"
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="Test e-posta konusu"
						className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-google-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
					/>
					<p className="mt-2 text-xs text-gray-400">
						Gönderimde konu başlığı{" "}
						<code className="rounded bg-gray-100 px-1 font-mono">[TEST]</code>{" "}
						önekiyle gönderilir.
					</p>
				</div>

				{/* HTML Body */}
				<div className="rounded-xl border border-gray-200 bg-white p-6">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="font-display text-lg font-semibold text-gray-900">
							E-posta İçeriği (HTML)
						</h2>
						<button
							type="button"
							onClick={() => setShowPreview(!showPreview)}
							className="text-xs font-medium text-google-blue hover:underline"
						>
							{showPreview ? "Editöre Dön" : "Önizleme"}
						</button>
					</div>

					{showPreview ? (
						<HtmlPreview html={bodyHtml} className="min-h-[300px]" />
					) : (
						<HtmlEditor value={bodyHtml} onChange={setBodyHtml} />
					)}
				</div>

				{/* Send Button */}
				<div className="flex justify-end">
					<button
						type="button"
						onClick={handleSend}
						disabled={sending}
						className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
					>
						<Send className="h-4 w-4" />
						{sending ? "Gönderiliyor..." : "Test Gönder"}
					</button>
				</div>

				{/* Results */}
				{results && results.length > 0 && (
					<div className="rounded-xl border border-gray-200 bg-white p-6">
						<h2 className="mb-4 font-display text-lg font-semibold text-gray-900">
							Gönderim Sonuçları
						</h2>
						<div className="space-y-2">
							{results.map((result) => (
								<div
									key={result.email}
									className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
										result.success
											? "border-green-100 bg-green-50"
											: "border-red-100 bg-red-50"
									}`}
								>
									{result.success ? (
										<CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
									) : (
										<XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
									)}
									<div className="flex-1 min-w-0">
										<p
											className={`truncate text-sm font-medium ${
												result.success ? "text-green-800" : "text-red-800"
											}`}
										>
											{result.email}
										</p>
										{result.error && (
											<p className="mt-0.5 text-xs text-red-600">
												{result.error}
											</p>
										)}
									</div>
									<span
										className={`text-xs font-medium ${
											result.success ? "text-green-600" : "text-red-600"
										}`}
									>
										{result.success ? "Gönderildi" : "Başarısız"}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
