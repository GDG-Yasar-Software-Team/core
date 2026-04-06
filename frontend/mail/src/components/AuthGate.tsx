import { Lock, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";

const TOKEN_KEY = "gdg_mail_admin_token";

export function getAdminToken(): string {
	return sessionStorage.getItem(TOKEN_KEY) ?? "";
}

export function clearAdminToken(): void {
	sessionStorage.removeItem(TOKEN_KEY);
}

interface AuthGateProps {
	children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
	const [isAuthorized, setIsAuthorized] = useState<boolean>(
		() => !!sessionStorage.getItem(TOKEN_KEY),
	);
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	if (isAuthorized) {
		return <>{children}</>;
	}

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!password.trim()) {
			setError("Lütfen admin token girin.");
			return;
		}

		sessionStorage.setItem(TOKEN_KEY, password);
		setIsAuthorized(true);
		setError(null);
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 flex flex-col items-center">
					<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-google-blue shadow-lg">
						<Mail className="h-7 w-7 text-white" />
					</div>
					<h1 className="font-display text-2xl font-bold text-gray-900">
						GDG Mail
					</h1>
				<p className="mt-1 text-sm text-gray-500">
					Admin paneline erişmek için token girin.
				</p>
				</div>

				<div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
					<label
							htmlFor="admin-password"
							className="mb-1 block text-sm font-medium text-gray-700"
						>
							Admin Token
						</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<input
									id="admin-password"
									type="password"
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										setError(null);
									}}
									autoComplete="current-password"
									placeholder="Token"
									className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 ${
										error
											? "border-red-400 focus:ring-red-200"
											: "border-gray-300 focus:border-google-blue focus:ring-blue-100"
									}`}
								/>
							</div>
						</div>

						<button
							type="submit"
							className="w-full rounded-lg bg-google-blue px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 active:bg-blue-700"
						>
							Giriş Yap
						</button>
					</form>

					{error && (
						<p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
							{error}
						</p>
					)}
				</div>

				<p className="mt-6 text-center text-xs text-gray-400">
					GDG on Campus Yaşar Üniversitesi
				</p>
			</div>
		</div>
	);
}
