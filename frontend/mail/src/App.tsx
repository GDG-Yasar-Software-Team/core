import { Navigate, Route, Routes } from "react-router-dom";
import AuthGate from "./components/AuthGate";
import Layout from "./components/Layout";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import DashboardPage from "./pages/DashboardPage";
import EditCampaignPage from "./pages/EditCampaignPage";

function App() {
	return (
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
				</Route>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</AuthGate>
	);
}

export default App;
