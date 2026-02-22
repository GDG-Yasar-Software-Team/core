import type { FieldConditionValue, FormFieldSchema } from "../types";

function normalizeString(value: string): string {
	return value.trim().toLocaleLowerCase("tr-TR");
}

function valuesMatch(left: unknown, right: FieldConditionValue): boolean {
	if (typeof left === "string" && typeof right === "string") {
		return normalizeString(left) === normalizeString(right);
	}

	return left === right;
}

function matchesAnyConditionValue(
	answer: unknown,
	expectedValues: FieldConditionValue[],
): boolean {
	if (answer === null || answer === undefined) {
		return false;
	}

	if (Array.isArray(answer)) {
		return answer.some((item) =>
			expectedValues.some((expected) => valuesMatch(item, expected)),
		);
	}

	return expectedValues.some((expected) => valuesMatch(answer, expected));
}

export function isQuestionVisible(
	question: FormFieldSchema,
	values: Record<string, unknown>,
): boolean {
	const condition = question.condition;
	if (!condition) {
		return true;
	}

	return matchesAnyConditionValue(
		values[condition.depends_on],
		condition.values ?? [],
	);
}
