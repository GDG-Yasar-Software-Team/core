const TOKEN_KEY = "gdg_mail_admin_token";

export function getAdminToken(): string {
	return sessionStorage.getItem(TOKEN_KEY) ?? "";
}

export function setAdminToken(token: string): void {
	sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
	sessionStorage.removeItem(TOKEN_KEY);
}
