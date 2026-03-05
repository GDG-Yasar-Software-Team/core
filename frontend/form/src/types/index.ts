export type ObjectId = string;

export type FieldType =
	| "text"
	| "textarea"
	| "number"
	| "select"
	| "multiselect"
	| "checkbox"
	| "radio"
	| "date"
	| "department";

export interface FieldValidation {
	min_length?: number;
	max_length?: number;
	min_value?: number;
	max_value?: number;
	pattern?: string;
}

export type FieldConditionValue = string | number | boolean;

export interface FieldCondition {
	depends_on: string;
	values: FieldConditionValue[];
}

export interface FormFieldSchema {
	_key?: string;
	field_id: string;
	field_type: FieldType;
	label: string;
	placeholder?: string;
	required: boolean;
	options?: string[];
	validation?: FieldValidation;
	condition?: FieldCondition;
}

export interface FormCreate {
	title: string;
	description: string | null;
	questions: FormFieldSchema[];
	start_date?: string;
	deadline?: string;
	is_active: boolean;
}

export interface FormUpdate {
	title?: string;
	description?: string;
	questions?: FormFieldSchema[];
	start_date?: string;
	deadline?: string;
	is_active?: boolean;
}

export interface FormInDB extends FormCreate {
	id: ObjectId;
	created_at: string;
	updated_at?: string;
	view_count: number;
	submission_count: number;
}

export interface FormResponse {
	id: string;
	title: string;
	description?: string;
	questions: FormFieldSchema[];
	start_date?: string;
	deadline?: string;
	is_active: boolean;
	created_at: string;
	updated_at?: string;
	view_count: number;
	submission_count: number;
}

export interface FormPreview {
	id: string;
	title: string;
	description?: string;
	start_date?: string;
	deadline?: string;
	is_active: boolean;
}

export interface SubmissionCreate {
	form_id: ObjectId;

	/** must contain at least one answer */
	answers: Record<string, unknown>;

	/** must be a valid email address - validated by backend */
	respondent_email: string;

	respondent_name?: string;
}

export interface SubmissionInDB extends SubmissionCreate {
	id: ObjectId;
	submitted_at: string;
}

export interface SubmissionResponse {
	id: string;
	form_id: string;
	answers: Record<string, unknown>;
	respondent_email?: string;
	respondent_name?: string;
	submitted_at: string;
}

export interface PaginatedSubmissionsResponse {
	submissions: SubmissionResponse[];
	total: number;
	skip: number;
	limit: number;
}

export interface UserPayload {
	email: string;
	name?: string | null;
	is_yasar_student?: boolean | null;
	section?: string | null;
	grade?: string | null;
	turkish_identity_number?: string | null;
	is_subscribed?: boolean | null;
}

export interface UserCreateResponse {
	id: string;
	email: string;
}

export interface UserResponse {
	id: string;
	email: string;
	name: string | null;
	is_yasar_student: boolean;
	section: string | null;
	grade: string | null;
	turkish_identity_number: string | null;
	submitted_form_count: number;
	received_mail_count: number;
	is_subscribed: boolean;
	unsubscribed_at: string | null;
	created_at: string;
	updated_at: string | null;
}

export interface FormListResponse {
	forms: FormPreview[];
	total: number;
	skip: number;
	limit: number;
}
