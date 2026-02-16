import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import Banner from "../components/Banner";
import FieldRenderer from "../components/FieldRenderer";
import { useFormDetails } from "../services/useFormDetails";
import type { SubmissionCreate } from "../types";
import { buildFormSchema } from "../utils/buildFormSchema";

const FormSubmissionPage = () => {
	const { formId } = useParams<{ formId: string }>();
	const { form, isLoading, error } = useFormDetails(formId);

	const schema = useMemo(
		() => (form ? buildFormSchema(form.questions) : null),
		[form],
	);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: schema ? zodResolver(schema) : undefined,
	});

	const onSubmit = (data: Record<string, unknown>) => {
		if (!form) return;

		const submission: SubmissionCreate = {
			formId: form.id,
			answers: data,
			respondentEmail: (data.email as string) || "",
			respondentName: (data.fullname as string) || undefined,
		};

		// TODO: Replace with actual API call
		console.log("Form submitted:", submission);
		alert("Form başarıyla gönderildi!");
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
					<p className="mt-4 text-gray-500">Form yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (error || !form) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center max-w-md">
					<p className="text-red-500 text-lg font-semibold">
						{error || "Form bulunamadı."}
					</p>
					<p className="mt-2 text-gray-400 text-sm">
						Lütfen URL'yi kontrol edip tekrar deneyin.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 font-sans">
			<div className="w-full max-w-2xl">
				<div className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white">
					<Banner />

					{/* Form Header */}
					<div className="px-8 pt-6 pb-4 border-b border-gray-100">
						<h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
						{form.description && (
							<p className="mt-2 text-sm text-gray-500">{form.description}</p>
						)}
						<p className="mt-3 text-xs text-gray-400">
							<span className="text-red-500">*</span> ile işaretli alanlar
							zorunludur.
						</p>
					</div>

					{/* Form Content */}
					<div className="px-8 py-6">
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="space-y-6"
							noValidate
						>
							{form.questions.map((field) => (
								<FieldRenderer
									key={field.fieldId}
									field={field}
									registration={register(field.fieldId)}
									error={
										(errors as FieldErrors)[field.fieldId] as
											| import("react-hook-form").FieldError
											| undefined
									}
								/>
							))}

							<div className="pt-4 flex flex-col sm:flex-row gap-3">
								<button
									type="submit"
									disabled={isSubmitting}
									className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSubmitting ? "Gönderiliyor..." : "Gönder"}
								</button>
								<button
									type="button"
									onClick={() => reset()}
									className="flex-1 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition"
								>
									Formu Temizle
								</button>
							</div>
						</form>
					</div>
				</div>

				{/* GDG Color Dots */}
				<div className="flex justify-center space-x-2 mt-6 opacity-40">
					<div className="w-2 h-2 bg-blue-500 rounded-full" />
					<div className="w-2 h-2 bg-red-500 rounded-full" />
					<div className="w-2 h-2 bg-yellow-400 rounded-full" />
					<div className="w-2 h-2 bg-green-500 rounded-full" />
				</div>
			</div>
		</div>
	);
};

export default FormSubmissionPage;
