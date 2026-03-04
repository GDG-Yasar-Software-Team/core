import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminPasswordGate from "../../components/AdminPasswordGate";
import { useForms } from "../../hooks/useForms";
import { deleteForm } from "../../services/formService";

function formatDate(value: string | undefined): string {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("tr-TR", {
		dateStyle: "medium",
	}).format(date);
}

const PAGE_SIZE = 20;

const AdminFormListPage = () => {
	const navigate = useNavigate();
	const [page, setPage] = useState(0);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const skip = page * PAGE_SIZE;
	const { forms, total, isLoading, error, refetch } = useForms(skip, PAGE_SIZE);

	const totalPages = Math.ceil(total / PAGE_SIZE);

	const handleDelete = async (formId: string, title: string) => {
		const confirmed = window.confirm(
			`"${title}" formunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
		);
		if (!confirmed) return;

		setDeletingId(formId);
		try {
			await deleteForm(formId);
			refetch();
		} catch (err) {
			alert(
				`Silme hatası: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`,
			);
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<AdminPasswordGate>
			<div className="min-h-screen bg-slate-100 px-4 py-8">
				<div className="mx-auto max-w-6xl space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold text-slate-900">
								Form Yönetimi
							</h1>
							<p className="mt-1 text-sm text-slate-500">
								Tüm formları görüntüleyin, düzenleyin veya silin.
							</p>
						</div>
						<button
							type="button"
							onClick={() => navigate("/admin/forms/editor")}
							className="rounded-lg bg-[#4285F4] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3367D6]"
						>
							Yeni Form Oluştur
						</button>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
						{isLoading ? (
							<div className="flex items-center justify-center py-16">
								<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
								<span className="ml-3 text-slate-500">Yükleniyor...</span>
							</div>
						) : error ? (
							<div className="px-6 py-12 text-center">
								<p className="text-red-600">{error}</p>
								<button
									type="button"
									onClick={refetch}
									className="mt-4 text-sm text-blue-600 hover:underline"
								>
									Tekrar Dene
								</button>
							</div>
						) : forms.length === 0 ? (
							<div className="px-6 py-12 text-center">
								<p className="text-slate-500">Henüz form oluşturulmamış.</p>
							</div>
						) : (
							<>
								<table className="w-full">
									<thead className="border-b border-slate-100 bg-slate-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
												Başlık
											</th>
											<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
												Durum
											</th>
											<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
												Son Tarih
											</th>
											<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
												Oluşturulma
											</th>
											<th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
												İşlemler
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
										{forms.map((form) => (
											<tr key={form.id} className="hover:bg-slate-50">
												<td className="px-6 py-4">
													<span className="font-medium text-slate-900">
														{form.title}
													</span>
													{form.description && (
														<p className="mt-0.5 text-xs text-slate-500 truncate max-w-xs">
															{form.description}
														</p>
													)}
												</td>
												<td className="px-6 py-4">
													{form.is_active ? (
														<span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
															Aktif
														</span>
													) : (
														<span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
															Pasif
														</span>
													)}
												</td>
												<td className="px-6 py-4 text-sm text-slate-600">
													{formatDate(form.deadline)}
												</td>
												<td className="px-6 py-4 text-sm text-slate-600">
													{formatDate(form.start_date)}
												</td>
												<td className="px-6 py-4">
													<div className="flex items-center justify-end gap-2">
														<button
															type="button"
															onClick={() => navigate(`/views/${form.id}`)}
															className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
															title="Yanıtları Görüntüle"
														>
															Yanıtlar
														</button>
														<button
															type="button"
															onClick={() =>
																navigate(`/admin/forms/editor?id=${form.id}`)
															}
															className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
														>
															Düzenle
														</button>
														<button
															type="button"
															onClick={() => handleDelete(form.id, form.title)}
															disabled={deletingId === form.id}
															className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
														>
															{deletingId === form.id ? "Siliniyor..." : "Sil"}
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>

								{totalPages > 1 && (
									<div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
										<p className="text-sm text-slate-500">
											Toplam {total} form
										</p>
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => setPage((p) => Math.max(0, p - 1))}
												disabled={page === 0}
												className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
											>
												Önceki
											</button>
											<span className="text-sm text-slate-600">
												{page + 1} / {totalPages}
											</span>
											<button
												type="button"
												onClick={() =>
													setPage((p) => Math.min(totalPages - 1, p + 1))
												}
												disabled={page >= totalPages - 1}
												className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
											>
												Sonraki
											</button>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</AdminPasswordGate>
	);
};

export default AdminFormListPage;
