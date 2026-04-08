import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

export default class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error("ErrorBoundary caught:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
					<div className="w-full max-w-md text-center">
						<div className="mb-4 text-5xl">!</div>
						<h1 className="mb-2 font-display text-xl font-bold text-gray-900">
							Beklenmeyen bir hata oluştu
						</h1>
						<p className="mb-6 text-sm text-gray-500">
							Uygulama beklenmedik bir hatayla karşılaştı. Lütfen sayfayı
							yenileyin.
						</p>
						<button
							type="button"
							onClick={() => {
								this.setState({ hasError: false });
								window.location.reload();
							}}
							className="rounded-lg bg-google-blue px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
						>
							Sayfayı Yenile
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
