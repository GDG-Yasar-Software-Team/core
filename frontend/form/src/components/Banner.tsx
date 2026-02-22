const Banner = () => (
	<div className="relative overflow-hidden border-b border-slate-200 bg-slate-50/70 px-5 py-5 sm:px-8 sm:py-6">
		<div className="pointer-events-none absolute inset-0">
			<div className="absolute -top-10 left-8 h-36 w-36 rounded-full bg-[#4285F4]/12 blur-3xl" />
			<div className="absolute top-4 right-6 h-32 w-32 rounded-full bg-[#34A853]/10 blur-3xl" />
			<div className="absolute bottom-0 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[#FBBC04]/12 blur-2xl" />
		</div>

		<div className="relative mx-auto max-w-5xl rounded-3xl border border-slate-200/90 bg-white/90 shadow-[0_10px_40px_-22px_rgba(15,23,42,0.35)] backdrop-blur">
			<div className="px-4 py-4 sm:px-6">
				<div className="flex items-center justify-between sm:hidden">
					<div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm">
						<img
							src="/gdg-logo.png"
							alt="GDG on Campus"
							className="h-9 w-9 object-contain"
						/>
					</div>

					<div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
						<img
							src="/yasar-logo.png"
							alt="Yaşar Üniversitesi"
							className="h-9 w-9 object-contain"
						/>
					</div>
				</div>

				<div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex min-w-0 items-center gap-3 sm:gap-4">
						<div className="relative hidden h-14 w-14 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid">
							<img
								src="/gdg-logo.png"
								alt="GDG on Campus"
								className="h-9 w-9 object-contain"
							/>
						</div>

						<div className="min-w-0">
							<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
								GDG on Campus Yaşar Üniversitesi
							</p>
							<h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
								Etkinlik Katılım Formu
							</h2>
							<div className="mt-2 flex items-center gap-1.5">
								<span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
								<span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
								<span className="h-1.5 w-1.5 rounded-full bg-[#FBBC04]" />
								<span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />
							</div>
						</div>
					</div>

					<div className="hidden max-w-full items-center justify-end rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:inline-flex">
						<img
							src="/yasar-logo.png"
							alt="Yaşar Üniversitesi"
							className="h-10 w-auto max-w-[240px] object-contain"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
);

export default Banner;
