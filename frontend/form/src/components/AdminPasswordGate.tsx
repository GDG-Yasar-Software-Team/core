import { type FormEvent, useState } from "react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { verifyToken } from "../services/formService";

interface AdminTokenGateProps {
	children: React.ReactNode;
}

const AdminTokenGate = ({ children }: AdminTokenGateProps) => {
	const { isAuthorized, authorize } = useAdminAuth();
	const [token, setToken] = useState("");
	const [authError, setAuthError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const onUnlock = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedToken = token.trim();
		if (!trimmedToken) {
			setAuthError("Geçersiz API token.");
			return;
		}

		setIsLoading(true);
		setAuthError(null);

		const result = await verifyToken(trimmedToken);

		if (!result.valid) {
			setAuthError(result.error || "Geçersiz API token.");
			setIsLoading(false);
			return;
		}

		authorize(trimmedToken);
		setIsLoading(false);
	};

	if (isAuthorized) {
		return <>{children}</>;
	}

	return (
		<div className="min-h-screen bg-slate-100 px-4 py-16">
			<div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
				<h1 className="text-xl font-semibold text-slate-900">
					Yönetici Erişimi
				</h1>
				<p className="mt-2 text-sm text-slate-500">
					Devam etmek için API token girin.
				</p>

				<form onSubmit={onUnlock} className="mt-6 space-y-4">
					<div>
						<label
							htmlFor="admin-token"
							className="block text-sm font-medium text-slate-700"
						>
							API Token
						</label>
						<input
							id="admin-token"
							type="password"
							value={token}
							onChange={(event) => setToken(event.target.value)}
							autoComplete="off"
							className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
							placeholder="Token"
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-lg bg-[#4285F4] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#3367D6] disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{isLoading ? "Doğrulanıyor..." : "Panele Gir"}
					</button>
				</form>

				{authError && (
					<p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
						{authError}
					</p>
				)}
			</div>
		</div>
	);
};

export default AdminTokenGate;

// Backward compatible alias
export { AdminTokenGate as AdminPasswordGate };
