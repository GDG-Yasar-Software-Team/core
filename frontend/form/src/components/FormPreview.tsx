import type { FieldError, FieldErrors, UseFormRegister } from "react-hook-form";
import type { FormFieldSchema, FormResponse } from "../types";
import Banner from "./Banner";
import FieldRenderer from "./FieldRenderer";
import { PhoneMockup } from "./PhoneMockup";

type FormValues = Record<string, unknown>;

interface FormPreviewProps {
	form: Pick<
		FormResponse,
		"id" | "title" | "description" | "questions" | "is_active"
	>;
	register: UseFormRegister<FormValues>;
	errors: FieldErrors<FormValues>;
}

const FormPreview = ({ form, register, errors }: FormPreviewProps) => {
	return (
		<div className="space-y-12">
			{/* Mobile Preview */}
			<div className="flex flex-col items-center">
				<div className="text-center mb-6">
					<h3 className="text-lg font-semibold text-slate-900">
						Mobil Görünüm
					</h3>
					<p className="text-sm text-slate-500">
						Formunuz telefonda böyle görünecek
					</p>
				</div>
				<PhoneMockup>
					<div>
						{/* Simplified Mobile Banner */}
						<div className="bg-slate-50 border-b border-slate-200 px-4 py-4">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-xl border border-slate-200 bg-white grid place-items-center shadow-sm">
									<img
										src="/gdg-logo.png"
										alt="GDG"
										className="h-6 w-6 object-contain"
									/>
								</div>
								<div>
									<p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
										GDG on Campus
									</p>
									<p className="text-sm font-bold text-slate-900">
										Yaşar Üniversitesi
									</p>
								</div>
							</div>
							<div className="mt-2 flex items-center gap-1">
								<span className="h-1 w-1 rounded-full bg-[#4285F4]" />
								<span className="h-1 w-1 rounded-full bg-[#EA4335]" />
								<span className="h-1 w-1 rounded-full bg-[#FBBC04]" />
								<span className="h-1 w-1 rounded-full bg-[#34A853]" />
							</div>
						</div>
						<div className="px-4 pt-4 pb-3 border-b border-gray-100">
							<h1 className="text-base font-bold text-gray-900 font-display tracking-tight">
								{form.title}
							</h1>
							{form.description && (
								<p className="mt-1 text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
									{form.description}
								</p>
							)}
						</div>
						<div className="px-4 py-4">
							<div className="mb-4">
								<label className="block text-xs font-medium text-gray-700 mb-1 font-display">
									E-posta <span className="text-red-500 ml-1">*</span>
								</label>
								<input
									type="email"
									disabled
									placeholder="E-posta adresiniz"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs bg-gray-50 text-gray-400"
								/>
							</div>
							<div className="space-y-4">
								{form.questions.map((field: FormFieldSchema) => (
									<div key={field.field_id} className="text-sm">
										<FieldRenderer
											field={field}
											registration={register(field.field_id)}
											error={
												(errors as FieldErrors<FormValues>)[field.field_id] as
													| FieldError
													| undefined
											}
										/>
									</div>
								))}
							</div>
							{form.questions.length === 0 && (
								<div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
									<p className="text-xs text-gray-500">Henüz alan eklenmedi.</p>
								</div>
							)}
							<div className="pt-4">
								<button
									type="button"
									disabled
									className="w-full py-2.5 bg-[#4285F4] text-white text-sm font-semibold rounded-lg opacity-50 cursor-not-allowed"
								>
									Gönder
								</button>
							</div>
						</div>
					</div>
				</PhoneMockup>
			</div>

			{/* Divider */}
			<div className="flex items-center gap-4">
				<div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
				<span className="text-xs text-slate-400 font-medium">WEB GÖRÜNÜMÜ</span>
				<div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
			</div>

			{/* Web Preview */}
			<div>
				<div className="text-center mb-6">
					<h3 className="text-lg font-semibold text-slate-900">
						Masaüstü Görünüm
					</h3>
					<p className="text-sm text-slate-500">
						Formunuz bilgisayarda böyle görünecek
					</p>
				</div>
				<div className="flex items-center justify-center">
					<div className="w-full max-w-2xl">
						<div className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white">
							<Banner />

							<div className="px-8 pt-6 pb-4 border-b border-gray-100">
								<h1 className="text-2xl font-bold text-gray-900 font-display tracking-tight">
									{form.title}
								</h1>
								{form.description && (
									<p className="mt-2 text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">
										{form.description}
									</p>
								)}
							</div>

							<div className="px-8 py-6">
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-1 font-display">
										E-posta <span className="text-red-500 ml-1">*</span>
									</label>
									<input
										type="email"
										disabled
										placeholder="E-posta adresiniz"
										className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-gray-50 text-gray-400"
									/>
									<p className="mt-2 text-xs text-gray-500">
										Önizleme modunda e-posta devre dışıdır.
									</p>
								</div>

								<div className="space-y-6">
									{form.questions.map((field: FormFieldSchema) => (
										<FieldRenderer
											key={field.field_id}
											field={field}
											registration={register(field.field_id)}
											error={
												(errors as FieldErrors<FormValues>)[field.field_id] as
													| FieldError
													| undefined
											}
										/>
									))}
								</div>

								{form.questions.length === 0 && (
									<div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
										<p className="text-sm text-gray-500">
											Henüz alan eklenmedi. "Düzenle" moduna geçerek alan
											ekleyin.
										</p>
									</div>
								)}

								<div className="pt-6 flex flex-col sm:flex-row gap-3">
									<button
										type="button"
										disabled
										className="flex-1 py-3 bg-[#4285F4] text-white font-semibold rounded-lg opacity-50 cursor-not-allowed"
									>
										Gönder (Önizleme)
									</button>
									<button
										type="button"
										disabled
										className="flex-1 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 opacity-50 cursor-not-allowed"
									>
										Formu Temizle
									</button>
								</div>
							</div>
						</div>
						<p className="mt-8 text-center text-xs text-gray-500">
							<span className="font-medium">
								GDG on Campus Yaşar Üniversitesi
							</span>{" "}
							tarafından geliştirilmiştir.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FormPreview;
