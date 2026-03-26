import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AdminPasswordGate from "../../components/AdminPasswordGate";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import {
	getAllSubmissionsByForm,
	getFormById,
} from "../../services/formService";
import type {
	FormFieldSchema,
	FormResponse,
	SubmissionResponse,
} from "../../types";
import { exportSubmissionsToXlsx } from "../../utils/exportSubmissions";
import { formatAnswer, formatDateTime } from "../../utils/formatHelpers";

const EMAIL_FIELD_KEYS = ["email", "e_mail", "mail"];

function normalizeKey(value: string): string {
	return value.trim().toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
}

function matchesAnyKey(fieldId: string, keys: string[]): boolean {
	return keys.includes(normalizeKey(fieldId));
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
	const { isAuthorized } = useAdminAuth();
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

	return (
		<AdminPasswordGate>
			<div className="min-h-screen bg-slate-100 px-4 py-8">
				<div className="mx-auto max-w-7xl space-y-6">
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-xs uppercase tracking-wide text-slate-500">
									Form Görüntüleme Paneli
								</p>
								<h1 className="mt-2 text-2xl font-bold text-slate-900">
									{form?.title ?? "Form verileri yükleniyor..."}
								</h1>
								<p className="mt-2 text-sm text-slate-500">Form ID: {formId}</p>
							</div>
							{form && submissions.length > 0 && (
								<button
									type="button"
									onClick={() =>
										exportSubmissionsToXlsx({
											formTitle: form.title,
											submissions,
											visibleQuestions,
										})
									}
									className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800"
								>
									XLSX İndir
								</button>
							)}
						</div>
					</div>

					{isLoading ? (
						<div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
							<div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />
							<p className="mt-4 text-sm text-slate-500">
								Veriler yükleniyor...
							</p>
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
		</AdminPasswordGate>
	);
};

export default AdminFormViewsPage;
