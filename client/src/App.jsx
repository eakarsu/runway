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
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
