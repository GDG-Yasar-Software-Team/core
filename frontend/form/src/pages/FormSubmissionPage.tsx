import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	type FieldError,
	type FieldErrors,
	type SubmitHandler,
	type UseFormSetValue,
	useForm,
} from "react-hook-form";
import { useParams } from "react-router-dom";
import Banner from "../components/Banner";
import FieldRenderer from "../components/FieldRenderer";
import { useFormDetails } from "../hooks/useFormDetails";
import { createSubmission } from "../services/formService";
import {
	createUser,
	getUserByEmail,
	recordFormSubmission,
	updateUser,
} from "../services/userService";
import type {
	FormFieldSchema,
	FormResponse,
	SubmissionCreate,
	UserPayload,
	UserResponse,
} from "../types";
import { ApiClientError } from "../utils/apiClientError";
import { buildFormSchema } from "../utils/buildFormSchema";
import { isQuestionVisible } from "../utils/fieldVisibility";
import { messageForPublicFormSubmitError } from "../utils/publicFormMessages";

type FormValues = Record<string, unknown>;

const EMAIL_FIELD_KEYS = ["email", "e_mail", "mail"];
const NAME_FIELD_KEYS = [
	"name",
	"full_name",
	"fullname",
	"isim_soyisim",
	"isimsoyisim",
	"ad_soyad",
	"adsoyad",
];
const SECTION_FIELD_KEYS = [
	"section",
	"department",
	"dept",
	"bolum",
	"bölüm",
	"blm",
];
const GRADE_FIELD_KEYS = ["grade", "class", "sinif", "sınıf", "year", "snf"];
const STUDENT_FIELD_KEYS = [
	"is_yasar_student",
	"yasar_student",
	"student",
	"ogrenci",
	"öğrenci",
];
const TURKISH_ID_FIELD_KEYS = [
	"turkish_identity_number",
	"tc_identity_number",
	"tc_kimlik_numarasi",
	"tc_kimlik_no",
	"tc_no",
	"tckn",
];
const TRUE_ALIASES = ["true", "yes", "evet", "1"];
const FALSE_ALIASES = ["false", "no", "hayir", "hayır", "0"];

function normalizeKey(value: string): string {
	return value.trim().toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
}

function hasEmailShape(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function matchesAnyKey(fieldId: string, keys: string[]): boolean {
	return keys.includes(normalizeKey(fieldId));
}

function toNonEmptyString(value: unknown): string | undefined {
	if (typeof value !== "string") {
		return undefined;
	}
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function parseBooleanLike(value: unknown): boolean | undefined {
	if (typeof value === "boolean") {
		return value;
	}
	if (typeof value === "number") {
		if (value === 1) return true;
		if (value === 0) return false;
		return undefined;
	}
	if (typeof value !== "string") {
		return undefined;
	}

	const normalized = value.trim().toLowerCase();
	if (TRUE_ALIASES.includes(normalized)) {
		return true;
	}
	if (FALSE_ALIASES.includes(normalized)) {
		return false;
	}
	return undefined;
}

function findStringByKeys(
	values: FormValues,
	keys: string[],
): string | undefined {
	for (const [fieldId, value] of Object.entries(values)) {
		if (!matchesAnyKey(fieldId, keys)) {
			continue;
		}
		const parsed = toNonEmptyString(value);
		if (parsed) {
			return parsed;
		}
	}
	return undefined;
}

function findBooleanByKeys(
	values: FormValues,
	keys: string[],
): boolean | undefined {
	for (const [fieldId, value] of Object.entries(values)) {
		if (!matchesAnyKey(fieldId, keys)) {
			continue;
		}
		const parsed = parseBooleanLike(value);
		if (parsed !== undefined) {
			return parsed;
		}
	}
	return undefined;
}

function selectStudentOption(
	options: string[] | undefined,
	isYasarStudent: boolean,
): string | undefined {
	if (!options || options.length === 0) {
		return undefined;
	}

	const normalizedAliases = isYasarStudent ? TRUE_ALIASES : FALSE_ALIASES;

	for (const option of options) {
		if (normalizedAliases.includes(option.trim().toLowerCase())) {
			return option;
		}
	}

	return undefined;
}

function selectOptionByValue(
	options: string[] | undefined,
	value: string,
): string | undefined {
	if (!options || options.length === 0) {
		return undefined;
	}

	const normalized = value.trim().toLowerCase();
	for (const option of options) {
		if (option.trim().toLowerCase() === normalized) {
			return option;
		}
	}

	return undefined;
}

function getDefaultFieldValue(field: FormFieldSchema): unknown {
	if (field.field_type === "multiselect") {
		return [];
	}
	if (field.field_type === "checkbox") {
		return field.options && field.options.length > 0 ? [] : false;
	}
	return "";
}

function areValuesEqual(current: unknown, target: unknown): boolean {
	if (Array.isArray(current) && Array.isArray(target)) {
		if (current.length !== target.length) {
			return false;
		}
		return current.every((item, index) => item === target[index]);
	}
	return current === target;
}

function buildUserPayload(
	email: string,
	values: FormValues,
	existingUser: UserResponse | null,
): UserPayload {
	const name = findStringByKeys(values, NAME_FIELD_KEYS);
	const section = findStringByKeys(values, SECTION_FIELD_KEYS);
	const grade = findStringByKeys(values, GRADE_FIELD_KEYS);
	const isYasarStudent = findBooleanByKeys(values, STUDENT_FIELD_KEYS);
	const turkishIdentityNumber = findStringByKeys(values, TURKISH_ID_FIELD_KEYS);

	return {
		email,
		name: name ?? existingUser?.name ?? null,
		section: section ?? existingUser?.section ?? null,
		grade: grade ?? existingUser?.grade ?? null,
		is_yasar_student: isYasarStudent ?? existingUser?.is_yasar_student ?? null,
		turkish_identity_number:
			turkishIdentityNumber ?? existingUser?.turkish_identity_number ?? null,
		is_subscribed: existingUser?.is_subscribed ?? true,
	};
}

function buildSubmissionAnswers(
	form: FormResponse,
	values: FormValues,
	respondentEmail: string,
): Record<string, unknown> {
	const answers: Record<string, unknown> = {};

	for (const field of form.questions) {
		if (matchesAnyKey(field.field_id, EMAIL_FIELD_KEYS)) {
			answers[field.field_id] = respondentEmail;
			continue;
		}

		if (!isQuestionVisible(field, values)) {
			continue;
		}

		answers[field.field_id] = values[field.field_id];
	}

	return answers;
}

function applyUserAutofill(
	form: FormResponse,
	user: UserResponse,
	setValue: UseFormSetValue<FormValues>,
): void {
	for (const field of form.questions) {
		if (matchesAnyKey(field.field_id, EMAIL_FIELD_KEYS)) {
			setValue(field.field_id, user.email);
			continue;
		}

		if (matchesAnyKey(field.field_id, NAME_FIELD_KEYS) && user.name) {
			setValue(field.field_id, user.name);
			continue;
		}

		if (matchesAnyKey(field.field_id, SECTION_FIELD_KEYS) && user.section) {
			setValue(field.field_id, user.section);
			continue;
		}

		if (matchesAnyKey(field.field_id, GRADE_FIELD_KEYS) && user.grade) {
			if (field.field_type === "select" || field.field_type === "radio") {
				const matchedOption = selectOptionByValue(field.options, user.grade);
				setValue(field.field_id, matchedOption ?? user.grade);
				continue;
			}
			setValue(field.field_id, user.grade);
			continue;
		}

		if (matchesAnyKey(field.field_id, STUDENT_FIELD_KEYS)) {
			if (
				field.field_type === "checkbox" &&
				(!field.options || field.options.length === 0)
			) {
				setValue(field.field_id, user.is_yasar_student);
				continue;
			}

			if (field.field_type === "select" || field.field_type === "radio") {
				const matchedOption = selectStudentOption(
					field.options,
					user.is_yasar_student,
				);
				if (matchedOption) {
					setValue(field.field_id, matchedOption);
				}
			}
		}

		if (
			matchesAnyKey(field.field_id, TURKISH_ID_FIELD_KEYS) &&
			user.turkish_identity_number
		) {
			setValue(field.field_id, user.turkish_identity_number);
		}
	}
}

const FormSubmissionPage = () => {
	const { formId } = useParams<{ formId: string }>();
	const { form, isLoading, error } = useFormDetails(formId);
	const [respondentEmail, setRespondentEmail] = useState("");
	const [submissionError, setSubmissionError] = useState<string | null>(null);
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const [, setExistingUser] = useState<UserResponse | null>(null);
	const lookupRequestRef = useRef(0);
	const nonEmailQuestions = useMemo(
		() =>
			form?.questions.filter(
				(question) => !matchesAnyKey(question.field_id, EMAIL_FIELD_KEYS),
			) ?? [],
		[form],
	);

	const schema = useMemo(
		() => (form ? buildFormSchema(nonEmailQuestions) : null),
		[form, nonEmailQuestions],
	);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		clearErrors,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: schema ? zodResolver(schema) : undefined,
	});
	const watchedValues = watch();
	const visibleQuestions = useMemo(
		() =>
			nonEmailQuestions.filter((question) =>
				isQuestionVisible(question, watchedValues),
			),
		[nonEmailQuestions, watchedValues],
	);

	useEffect(() => {
		if (!form) {
			return;
		}

		const defaults = form.questions.reduce<FormValues>((acc, field) => {
			acc[field.field_id] = getDefaultFieldValue(field);
			return acc;
		}, {});

		reset(defaults);
		setSubmissionError(null);
		setShowSuccessAlert(false);
		setExistingUser(null);
	}, [form, reset]);

	useEffect(() => {
		if (!form) {
			return;
		}

		for (const field of nonEmailQuestions) {
			if (isQuestionVisible(field, watchedValues)) {
				continue;
			}

			const defaultValue = getDefaultFieldValue(field);
			if (!areValuesEqual(watchedValues[field.field_id], defaultValue)) {
				setValue(field.field_id, defaultValue, {
					shouldDirty: false,
					shouldTouch: false,
					shouldValidate: false,
				});
			}
			if ((errors as FieldErrors<FormValues>)[field.field_id]) {
				clearErrors(field.field_id);
			}
		}
	}, [clearErrors, errors, form, nonEmailQuestions, setValue, watchedValues]);

	useEffect(() => {
		if (!form) {
			return;
		}

		const normalizedEmail = respondentEmail.trim().toLowerCase();
		for (const field of form.questions) {
			if (matchesAnyKey(field.field_id, EMAIL_FIELD_KEYS)) {
				setValue(field.field_id, normalizedEmail, {
					shouldDirty: true,
				});
			}
		}
	}, [form, respondentEmail, setValue]);

	useEffect(() => {
		if (!form) {
			return;
		}

		const normalizedEmail = respondentEmail.trim().toLowerCase();
		if (!hasEmailShape(normalizedEmail)) {
			setExistingUser(null);
			return;
		}

		const requestId = lookupRequestRef.current + 1;
		lookupRequestRef.current = requestId;

		const timeoutId = window.setTimeout(async () => {
			try {
				const user = await getUserByEmail(normalizedEmail);
				if (lookupRequestRef.current !== requestId) {
					return;
				}

				if (!user) {
					setExistingUser(null);
					return;
				}

				setExistingUser(user);
				applyUserAutofill(form, user, setValue);
			} catch {
				if (lookupRequestRef.current !== requestId) {
					return;
				}
				setExistingUser(null);
			}
		}, 400);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [form, respondentEmail, setValue]);

	const canFillForm = hasEmailShape(respondentEmail.trim().toLowerCase());

	const onSubmit: SubmitHandler<FormValues> = async (values) => {
		if (!form) {
			return;
		}

		const normalizedEmail = respondentEmail.trim().toLowerCase();
		if (!hasEmailShape(normalizedEmail)) {
			setSubmissionError("Lütfen göndermeden önce geçerli bir e-posta girin.");
			return;
		}

		setSubmissionError(null);

		try {
			const currentUser = await getUserByEmail(normalizedEmail);
			const submissionAnswers = buildSubmissionAnswers(
				form,
				values,
				normalizedEmail,
			);
			const payload = buildUserPayload(
				normalizedEmail,
				submissionAnswers,
				currentUser,
			);

			if (currentUser) {
				await updateUser(normalizedEmail, payload);
			} else {
				try {
					await createUser(payload);
				} catch (createError) {
					if (
						createError instanceof ApiClientError &&
						createError.status === 409
					) {
						await updateUser(normalizedEmail, payload);
					} else {
						throw createError;
					}
				}
			}

			const submissionPayload: SubmissionCreate = {
				form_id: form.id,
				answers: submissionAnswers,
				respondent_email: normalizedEmail,
				respondent_name: payload.name ?? undefined,
			};

			await createSubmission(submissionPayload);
			await recordFormSubmission(normalizedEmail, form.id);

			setExistingUser(await getUserByEmail(normalizedEmail));
			setShowSuccessAlert(true);
			setSubmissionError(null);
		} catch (submitError) {
			setSubmissionError(messageForPublicFormSubmitError(submitError));
		}
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
						Lütfen URL&apos;yi kontrol edin ve form servisinin çalıştığından
						emin olun.
					</p>
				</div>
			</div>
		);
	}

	if (showSuccessAlert) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 font-sans">
				<div className="w-full max-w-2xl">
					<div className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white">
						<Banner />
						<div className="px-8 py-8">
							<h1 className="text-2xl font-bold text-gray-900 font-display tracking-tight">
								{form.title}
							</h1>
							<p className="mt-4 text-sm text-gray-700 font-medium">
								Yanıtınız kaydedildi. Katılımınız için teşekkür ederiz.
							</p>
							<div className="mt-6">
								<button
									type="button"
									onClick={() => {
										setShowSuccessAlert(false);
										setRespondentEmail("");
										reset();
									}}
									className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition"
								>
									Başka bir yanıt gönder
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
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 font-sans">
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
							<label
								htmlFor="respondent-email"
								className="block text-sm font-medium text-gray-700 mb-1 font-display"
							>
								E-posta <span className="text-red-500 ml-1">*</span>
							</label>
							<div className="flex flex-col sm:flex-row gap-3">
								<input
									id="respondent-email"
									type="email"
									value={respondentEmail}
									onChange={(event) => setRespondentEmail(event.target.value)}
									placeholder="E-posta adresiniz"
									className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200"
								/>
							</div>
							{!canFillForm && (
								<p className="mt-2 text-xs text-gray-500">
									Devam etmek için geçerli bir e-posta girin.
								</p>
							)}
						</div>

						<form
							onSubmit={handleSubmit(onSubmit)}
							className={`space-y-6 ${canFillForm ? "" : "pointer-events-none opacity-60"}`}
							noValidate
						>
							{visibleQuestions.map((field) => (
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

							<div className="pt-4 flex flex-col sm:flex-row gap-3">
								<button
									type="submit"
									disabled={isSubmitting || !canFillForm}
									className="flex-1 py-3 bg-[#4285F4] text-white font-semibold rounded-lg hover:bg-[#3367D6] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

						{submissionError && (
							<p className="mt-4 text-sm text-red-600">{submissionError}</p>
						)}
					</div>
				</div>
				<p className="mt-8 text-center text-xs text-gray-500">
					<span className="font-medium">GDG on Campus Yaşar Üniversitesi</span>{" "}
					tarafından geliştirilmiştir.
				</p>
			</div>
		</div>
	);
};

export default FormSubmissionPage;
