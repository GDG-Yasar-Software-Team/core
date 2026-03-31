import * as XLSX from "xlsx";
import type { FormFieldSchema, SubmissionResponse } from "../types";
import { formatAnswer, formatDateTime } from "./formatHelpers";

interface ExportSubmissionsParams {
	formTitle: string;
	submissions: SubmissionResponse[];
	visibleQuestions: FormFieldSchema[];
}

export function exportSubmissionsToXlsx({
	formTitle,
	submissions,
	visibleQuestions,
}: ExportSubmissionsParams): void {
	const headers = [
		"Gönderim Zamanı",
		"E-posta",
		...visibleQuestions.map((q) => q.label),
	];

	const rows = submissions.map((submission) => [
		formatDateTime(submission.submitted_at),
		submission.respondent_email ?? "-",
		...visibleQuestions.map((q) =>
			formatAnswer(submission.answers[q.field_id]),
		),
	]);

	const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

	const colWidths = headers.map((header, colIdx) => {
		let maxLen = header.length;
		for (const row of rows) {
			const cellLen = String(row[colIdx] ?? "").length;
			if (cellLen > maxLen) {
				maxLen = cellLen;
			}
		}
		return { wch: Math.min(maxLen + 2, 60) };
	});
	worksheet["!cols"] = colWidths;

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Gönderimler");

	const fileName = `${formTitle} Yanıtlar.xlsx`;
	XLSX.writeFile(workbook, fileName);
}
