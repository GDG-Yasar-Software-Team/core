import Banner from "../components/Banner";

const FormSubmissionPage = () => {
	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-6 py-16 font-sans">
			<div className="w-full max-w-xl">
				<Banner />
				<div className="rounded-3xl shadow-2xl border border-gray-100 overflow-hidden bg-white">
					{/* Form Content */}
					<div className="p-12">
						<form className="space-y-6">
							<div>
								<label
									htmlFor="fullname"
									className="block text-xs font-semibold text-gray-400 uppercase mb-2"
								>
									👤 Ad Soyad
								</label>
								<input
									id="fullname"
									type="text"
									className="w-full bg-gray-100 rounded-lg px-4 py-3 border-l-4 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
								/>
							</div>
							<div>
								<label
									htmlFor="email"
									className="block text-xs font-semibold text-gray-400 uppercase mb-2"
								>
									📧 E-posta
								</label>
								<input
									id="email"
									type="email"
									className="w-full bg-gray-100 rounded-lg px-4 py-3 border-l-4 border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
								/>
							</div>
							<div>
								<label
									htmlFor="studentid"
									className="block text-xs font-semibold text-gray-400 uppercase mb-2"
								>
									🎓 Öğrenci No
								</label>
								<input
									id="studentid"
									type="text"
									className="w-full bg-gray-100 rounded-lg px-4 py-3 border-l-4 border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
								/>
							</div>
							<div>
								<label
									htmlFor="department"
									className="block text-xs font-semibold text-gray-400 uppercase mb-2"
								>
									📚 Bölüm
								</label>
								<input
									id="department"
									type="text"
									className="w-full bg-gray-100 rounded-lg px-4 py-3 border-l-4 border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
								/>
							</div>
							<div>
								<label
									htmlFor="grade"
									className="block text-xs font-semibold text-gray-400 uppercase mb-2"
								>
									📖 Sınıf
								</label>
								<select
									id="grade"
									defaultValue=""
									className="w-full bg-gray-100 rounded-lg px-4 py-3 border-l-4 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition appearance-none"
								>
									<option value="" disabled>
										Sınıfınızı Seçin
									</option>
									<option value="1">Hazırlık</option>
									<option value="2">1. Sınıf</option>
									<option value="3">2. Sınıf</option>
									<option value="4">3. Sınıf</option>
									<option value="5">4. Sınıf</option>
									<option value="grad">Mezun / Yüksek Lisans</option>
								</select>
							</div>
							<div>
								<label
									htmlFor="phone"
									className="block text-xs font-semibold text-gray-400 uppercase mb-2"
								>
									📱 Telefon Numarası
								</label>
								<input
									id="phone"
									type="tel"
									className="w-full bg-gray-100 rounded-lg px-4 py-3 border-l-4 border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition"
								/>
							</div>
							<div className="pt-4 flex flex-row gap-4">
								<button
									className="w-full md:w-1/2 py-3 bg-white text-blue-800 font-semibold rounded-xl border border-blue-800 hover:bg-blue-50 transition shadow-md hover:shadow-lg"
									type="submit"
								>
									Gönder
								</button>
								<button
									className="w-full md:w-1/2 py-3 bg-white text-blue-800 font-semibold rounded-xl border border-blue-800 hover:bg-blue-50 transition shadow-md hover:shadow-lg"
									type="reset"
								>
									Formu Temizle
								</button>
							</div>
						</form>
						<div className="mt-8 pt-4 border-t border-gray-100 text-center">
							<a
								href="/kvkk"
								className="text-xs text-gray-400 hover:text-indigo-600 transition"
							>
								Gizlilik Politikası & KVKK Metni
							</a>
						</div>
					</div>
				</div>
				<div className="flex justify-center space-x-3 mt-8 opacity-40">
					<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
					<div className="w-2 h-2 bg-red-500 rounded-full"></div>
					<div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
					<div className="w-2 h-2 bg-green-500 rounded-full"></div>
				</div>
			</div>
		</div>
	);
};

export default FormSubmissionPage;
