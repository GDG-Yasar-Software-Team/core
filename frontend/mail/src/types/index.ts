export type CampaignStatus =
	| "scheduled"
	| "in_progress"
	| "completed"
	| "partially_completed"
	| "failed";

export interface ScheduledSend {
	time: string;
	subject: string | null;
}

export interface ExecutionRecord {
	scheduled_time: string | null;
	subject_used: string;
	started_at: string;
	completed_at: string | null;
	sent_count: number;
	failed_count: number;
	recipient_emails: string[];
	failed_emails: string[];
	is_manual_trigger: boolean;
}

export interface CampaignCreate {
	subject: string;
	body_html: string;
	scheduled_sends?: ScheduledSend[];
	use_custom_subjects?: boolean;
}

export interface CampaignUpdate {
	subject?: string;
	body_html?: string;
	scheduled_sends?: ScheduledSend[];
	use_custom_subjects?: boolean;
}

export interface CampaignResponse {
	id: string;
	subject: string;
	body_html: string;
	scheduled_sends: ScheduledSend[];
	use_custom_subjects: boolean;
	status: CampaignStatus;
	executions: ExecutionRecord[];
	executed_times: string[];
	created_at: string;
	updated_at: string | null;
	current_progress: ExecutionProgress | null;
}

export interface CampaignListItem {
	id: string;
	subject: string;
	status: CampaignStatus;
	scheduled_sends_count: number;
	executions_count: number;
	created_at: string;
}

export interface TriggerStartResponse {
	campaign_id: string;
	total_recipients: number;
	status: string;
}

export interface RecipientPreviewResponse {
	total_recipients: number;
	estimated_seconds: number;
	estimated_minutes: number;
	rate_per_second: number;
}

export interface ExecutionProgress {
	total_recipients: number;
	sent_count: number;
	failed_count: number;
	started_at: string;
	is_complete: boolean;
}

export interface TestMailRequest {
	emails: string[];
	subject: string;
	body_html: string;
}

export interface TestMailResult {
	email: string;
	success: boolean;
	error: string | null;
}

export interface TestMailResponse {
	results: TestMailResult[];
	sent_count: number;
	failed_count: number;
}
