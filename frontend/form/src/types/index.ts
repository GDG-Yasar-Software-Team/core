export type ObjectId = string;

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date';

export interface FieldValidation {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
}

export interface FormFieldSchema {
  field_id: string;
  field_type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: FieldValidation;
}

export interface FormCreate {
  title: string;
  description: string;
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
  answers: Record<string, unknown>;
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

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}
