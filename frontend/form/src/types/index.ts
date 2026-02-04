export type ObjectId = string;

export type FieldType =
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "multiselect"
    | "checkbox"
    | "radio"
    | "date";

export interface FieldValidation {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
}

export interface FormFieldSchema {
    fieldId: string;
    fieldType: FieldType;
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
    startDate?: string;
    deadline?: string;
    isActive: boolean;
}

export interface FormUpdate {
    title?: string;
    description?: string;
    questions?: FormFieldSchema[];
    startDate?: string;
    deadline?: string;
    isActive?: boolean;
}

export interface FormInDB extends FormCreate {
    id: ObjectId;
    createdAt: string;
    updatedAt?: string;
    viewCount: number;
    submissionCount: number;
}

export interface FormResponse {
    id: string;
    title: string;
    description?: string;
    questions: FormFieldSchema[];
    startDate?: string;
    deadline?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    viewCount: number;
    submissionCount: number;
}

export interface FormPreview {
    id: string;
    title: string;
    description?: string;
    startDate?: string;
    deadline?: string;
    isActive: boolean;
}

export interface SubmissionCreate {
    formId: ObjectId;

    /** must contain at least one answer */
    answers: Record<string, unknown>;

    /** must be a valid email address - validated by backend */
    respondentEmail: string;

    respondentName?: string;
}

export interface SubmissionInDB extends SubmissionCreate {
    id: ObjectId;
    submittedAt: string;
}

export interface SubmissionResponse {
    id: string;
    formId: string;
    answers: Record<string, unknown>;
    respondentEmail?: string;
    respondentName?: string;
    submittedAt: string;
}
