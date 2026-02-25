import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllSubmissionsByForm, getFormById } from "../services/formService";
import type {
	FormFieldSchema,
	FormResponse,
	SubmissionResponse,
} from "../types";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "";
const EMAIL_FIELD_KEYS = ["email", "e_mail", "mail"];

function normalizeKey(value: string): string {
	return value.trim().toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
}

function matchesAnyKey(fieldId: string, keys: string[]): boolean {
	return keys.includes(normalizeKey(fieldId));
}

function formatDateTime(value: string | undefined): string {
	if (!value) {
		return "-";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("tr-TR", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

function formatAnswer(value: unknown): string {
	if (value === null || value === undefined) {
		return "-";
	}

	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : "-";
	}

	if (typeof value === "number") {
		return String(value);
	}

	if (typeof value === "boolean") {
		return value ? "Evet" : "Hayır";
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return "-";
		}
		return value.map((item) => formatAnswer(item)).join(", ");
	}

	try {
		return JSON.stringify(value);
	} catch {
		return "-";
	}
}

function formatError(error: unknown): string {
	if (error instanceof Error) {
		if (error.message.includes("404")) {
			return "Form bulunamadı.";
		}
		return "Veriler yüklenirken bir hata oluştu.";
	}
	return "Beklenmeyen bir hata oluştu.";
}

interface StatCardProps {
	label: string;
	value: string;
}

function StatCard({ label, value }: StatCardProps) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
			<p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
		</div>
	);
}

const AdminFormViewsPage = () => {
	const { formId } = useParams<{ formId: string }>();
	const [password, setPassword] = useState("");
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);
	const [form, setForm] = useState<FormResponse | null>(null);
	const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const visibleQuestions = useMemo(
		() =>
			form?.questions.filter(
				(question) => !matchesAnyKey(question.field_id, EMAIL_FIELD_KEYS),
			) ?? [],
		[form],
	);

	const uniqueEmailCount = useMemo(() => {
		const uniqueEmails = new Set<string>();
		for (const submission of submissions) {
			const email = submission.respondent_email?.trim().toLowerCase();
			if (email) {
				uniqueEmails.add(email);
			}
		}
		return uniqueEmails.size;
	}, [submissions]);

	const latestSubmissionTime = submissions[0]?.submitted_at;

	useEffect(() => {
		if (!isAuthorized || !formId) {
			return;
		}

		let isCancelled = false;

		const loadData = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const [formData, submissionData] = await Promise.all([
					getFormById(formId),
					getAllSubmissionsByForm(formId),
				]);

				if (isCancelled) {
					return;
				}

				setForm(formData);
				setSubmissions(submissionData);
			} catch (loadError) {
				if (isCancelled) {
					return;
				}
				setForm(null);
				setSubmissions([]);
				setError(formatError(loadError));
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		};

		void loadData();

		return () => {
			isCancelled = true;
		};
	}, [formId, isAuthorized]);

	const onUnlock = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!ADMIN_PASSWORD) {
			setAuthError(
				"Yönetici şifresi tanımlı değil. Frontend .env dosyasında VITE_ADMIN_PASSWORD ayarlayın.",
			);
			return;
		}

		if (password === ADMIN_PASSWORD) {
			setIsAuthorized(true);
			setAuthError(null);
			return;
		}

		setAuthError("Yönetici şifresi hatalı.");
	};

	if (!formId) {
		return (
			<div className="min-h-screen bg-slate-100 px-4 py-16">
				<div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
					<p className="text-lg font-semibold text-red-600">
						Geçersiz görüntüleme bağlantısı.
					</p>
				</div>
			</div>
		);
	}

	if (!isAuthorized) {
		return (
			<div className="min-h-screen bg-slate-100 px-4 py-16">
				<div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
					<h1 className="text-xl font-semibold text-slate-900">
						Yönetici Erişimi
					</h1>
					<p className="mt-2 text-sm text-slate-500">
						Form görüntüleme panelini açmak için yönetici şifresini girin.
					</p>

					<form onSubmit={onUnlock} className="mt-6 space-y-4">
						<div>
							<label
								htmlFor="admin-password"
								className="block text-sm font-medium text-slate-700"
							>
								Yönetici Şifresi
							</label>
							<input
								id="admin-password"
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								autoComplete="off"
								className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
								placeholder="Şifre"
							/>
						</div>

						<button
							type="submit"
							className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
						>
							Panele Gir
						</button>
					</form>

					{authError && (
						<p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
							{authError}
						</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-100 px-4 py-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<p className="text-xs uppercase tracking-wide text-slate-500">
						Form Görüntüleme Paneli
					</p>
					<h1 className="mt-2 text-2xl font-bold text-slate-900">
						{form?.title ?? "Form verileri yükleniyor..."}
					</h1>
					<p className="mt-2 text-sm text-slate-500">Form ID: {formId}</p>
				</div>

				{isLoading ? (
					<div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
						<div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />
						<p className="mt-4 text-sm text-slate-500">Veriler yükleniyor...</p>
					</div>
				) : null}

				{error && !isLoading ? (
					<div className="rounded-2xl border border-red-200 bg-white p-6 text-red-700 shadow-sm">
						{error}
					</div>
				) : null}

				{!isLoading && !error && form ? (
					<>
						<div className="grid gap-4 md:grid-cols-3">
							<StatCard
								label="Toplam Gönderim"
								value={String(submissions.length)}
							/>
							<StatCard
								label="Tekil E-posta"
								value={String(uniqueEmailCount)}
							/>
							<StatCard
								label="Son Gönderim"
								value={formatDateTime(latestSubmissionTime)}
							/>
						</div>

						<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-slate-200">
									<thead className="bg-slate-50">
										<tr>
											<th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
												Gönderim Zamanı
											</th>
											<th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
												E-posta
											</th>
											{visibleQuestions.map((question: FormFieldSchema) => (
												<th
													key={question.field_id}
													className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
												>
													{question.label}
												</th>
											))}
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
										{submissions.length === 0 ? (
											<tr>
												<td
													colSpan={visibleQuestions.length + 2}
													className="px-4 py-8 text-center text-sm text-slate-500"
												>
													Bu form için henüz gönderim yok.
												</td>
											</tr>
										) : (
											submissions.map((submission) => (
												<tr key={submission.id} className="align-top">
													<td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
														{formatDateTime(submission.submitted_at)}
													</td>
													<td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
														{submission.respondent_email ?? "-"}
													</td>
													{visibleQuestions.map((question) => (
														<td
															key={`${submission.id}-${question.field_id}`}
															className="max-w-xs px-4 py-3 text-sm text-slate-700"
														>
															<div className="line-clamp-3 break-words">
																{formatAnswer(
																	submission.answers[question.field_id],
																)}
															</div>
														</td>
													))}
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</div>
					</>
				) : null}
			</div>
		</div>
	);
};

export default AdminFormViewsPage;
