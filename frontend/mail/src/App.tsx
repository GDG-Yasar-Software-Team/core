import { Navigate, Route, Routes } from "react-router-dom";
import AuthGate from "./components/AuthGate";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import DashboardPage from "./pages/DashboardPage";
import EditCampaignPage from "./pages/EditCampaignPage";
import TestMailPage from "./pages/TestMailPage";

function App() {
	return (
		<ErrorBoundary>
			<AuthGate>
				<Routes>
					<Route element={<Layout />}>
						<Route path="/" element={<DashboardPage />} />
						<Route path="/campaigns/new" element={<CreateCampaignPage />} />
						<Route
							path="/campaigns/:campaignId"
							element={<CampaignDetailPage />}
						/>
						<Route
							path="/campaigns/:campaignId/edit"
							element={<EditCampaignPage />}
						/>
						<Route
							path="/test-send"
							element={<TestMailPage />}
						/>
					</Route>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</AuthGate>
		</ErrorBoundary>
	);
}

export default App;
