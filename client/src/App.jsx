// === Batch 11 Gaps & Frontend Mounts ===
import GapAutoSubtitlesPage from './pages/gap/GapAutoSubtitlesPage'
import GapMusicRecommenderPage from './pages/gap/GapMusicRecommenderPage'
import GapSceneTransitionSuggesterPage from './pages/gap/GapSceneTransitionSuggesterPage'
import GapEngagementPredictorPage from './pages/gap/GapEngagementPredictorPage'
import GapBrandStyleCheckerPage from './pages/gap/GapBrandStyleCheckerPage'
import GapRealtimeCollabPage from './pages/gap/GapRealtimeCollabPage'
import GapReviewApprovalPage from './pages/gap/GapReviewApprovalPage'
import GapDiffRestoreUiPage from './pages/gap/GapDiffRestoreUiPage'
import GapPlatformPublishPage from './pages/gap/GapPlatformPublishPage'
import GapTeamPermissionsPage from './pages/gap/GapTeamPermissionsPage'
import GapUsageAnalyticsPage from './pages/gap/GapUsageAnalyticsPage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectNewPage from './pages/ProjectNewPage';
import TemplatesPage from './pages/TemplatesPage';
import TemplateDetailPage from './pages/TemplateDetailPage';
import TemplateNewPage from './pages/TemplateNewPage';
import ExportsPage from './pages/ExportsPage';
import ExportDetailPage from './pages/ExportDetailPage';
import ExportNewPage from './pages/ExportNewPage';
import SettingsPage from './pages/SettingsPage';
import SpreadsheetsPage from './pages/SpreadsheetsPage';
import SpreadsheetDetailPage from './pages/SpreadsheetDetailPage';
import SpreadsheetNewPage from './pages/SpreadsheetNewPage';
import SpreadsheetUploadPage from './pages/SpreadsheetUploadPage';
import RevenuePlanPage from './pages/planning/RevenuePlanPage';
import HeadcountPlanPage from './pages/planning/HeadcountPlanPage';
import ExpensePlanPage from './pages/planning/ExpensePlanPage';
import ScenariosPage from './pages/ScenariosPage';
import IntegrationsPage from './pages/IntegrationsPage';
import KPIDashboardPage from './pages/reports/KPIDashboardPage';
import VarianceReportPage from './pages/reports/VarianceReportPage';
import AutoSubtitlePage from './pages/ai/AutoSubtitlePage';
import MusicRecommendationPage from './pages/ai/MusicRecommendationPage';
import SceneTransitionPage from './pages/ai/SceneTransitionPage';
import PerformancePredictorPage from './pages/ai/PerformancePredictorPage';
import PlatformExportOptimizerPage from './pages/ai/PlatformExportOptimizerPage';
import UsageAnalyticsPage from './pages/ai/UsageAnalyticsPage';
import BrandConsistencyPage from './pages/ai/BrandConsistencyPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Planning */}
            <Route path="spreadsheets" element={<SpreadsheetsPage />} />
            <Route path="spreadsheets/new" element={<SpreadsheetNewPage />} />
            <Route path="spreadsheets/upload" element={<SpreadsheetUploadPage />} />
            <Route path="spreadsheets/:id" element={<SpreadsheetDetailPage />} />
            <Route path="planning/revenue" element={<RevenuePlanPage />} />
            <Route path="planning/headcount" element={<HeadcountPlanPage />} />
            <Route path="planning/expenses" element={<ExpensePlanPage />} />

            {/* Modeling */}
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/new" element={<ProjectNewPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="scenarios" element={<ScenariosPage />} />

            {/* Reporting */}
            <Route path="exports" element={<ExportsPage />} />
            <Route path="exports/new" element={<ExportNewPage />} />
            <Route path="exports/:id" element={<ExportDetailPage />} />
            <Route path="dashboards" element={<KPIDashboardPage />} />
            <Route path="reports/variance" element={<VarianceReportPage />} />

            {/* Config */}
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="templates/new" element={<TemplateNewPage />} />
            <Route path="templates/:id" element={<TemplateDetailPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* AI Tools */}
            <Route path="ai/auto-subtitle" element={<AutoSubtitlePage />} />
            <Route path="ai/music-recommendation" element={<MusicRecommendationPage />} />
            <Route path="ai/scene-transitions" element={<SceneTransitionPage />} />
            <Route path="ai/performance-predictor" element={<PerformancePredictorPage />} />
            <Route path="ai/platform-export-optimizer" element={<PlatformExportOptimizerPage />} />
            <Route path="ai/usage-analytics" element={<UsageAnalyticsPage />} />
            <Route path="ai/brand-consistency" element={<BrandConsistencyPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
              {/* === Batch 11 Gaps & Frontend Mounts === */}
        <Route path="/gap/auto-subtitles" element={<GapAutoSubtitlesPage />} />
        <Route path="/gap/music-recommender" element={<GapMusicRecommenderPage />} />
        <Route path="/gap/scene-transition-suggester" element={<GapSceneTransitionSuggesterPage />} />
        <Route path="/gap/engagement-predictor" element={<GapEngagementPredictorPage />} />
        <Route path="/gap/brand-style-checker" element={<GapBrandStyleCheckerPage />} />
        <Route path="/gap/realtime-collab" element={<GapRealtimeCollabPage />} />
        <Route path="/gap/review-approval" element={<GapReviewApprovalPage />} />
        <Route path="/gap/diff-restore-ui" element={<GapDiffRestoreUiPage />} />
        <Route path="/gap/platform-publish" element={<GapPlatformPublishPage />} />
        <Route path="/gap/team-permissions" element={<GapTeamPermissionsPage />} />
        <Route path="/gap/usage-analytics" element={<GapUsageAnalyticsPage />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
