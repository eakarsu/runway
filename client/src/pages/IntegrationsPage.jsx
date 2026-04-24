import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link2, X, Check, ExternalLink } from 'lucide-react';

const integrationCategories = {
  Accounting: [
    { id: 'quickbooks', name: 'QuickBooks', logo: 'QB', color: '#2CA01C', desc: 'Sync GL, AP, AR data' },
    { id: 'xero', name: 'Xero', logo: 'XR', color: '#13B5EA', desc: 'Import financial statements' },
    { id: 'netsuite', name: 'NetSuite', logo: 'NS', color: '#1E3A5F', desc: 'ERP & financial data sync' },
    { id: 'sage', name: 'Sage Intacct', logo: 'SI', color: '#00DC00', desc: 'Multi-entity consolidation' },
    { id: 'freshbooks', name: 'FreshBooks', logo: 'FB', color: '#0075DD', desc: 'Invoice & expense tracking' },
  ],
  Billing: [
    { id: 'stripe', name: 'Stripe', logo: 'ST', color: '#635BFF', desc: 'Payment & subscription data', fields: ['API Key', 'Webhook Secret'] },
    { id: 'chargebee', name: 'Chargebee', logo: 'CB', color: '#FF6633', desc: 'Subscription analytics' },
    { id: 'recurly', name: 'Recurly', logo: 'RC', color: '#F5446C', desc: 'Recurring billing metrics' },
    { id: 'zuora', name: 'Zuora', logo: 'ZU', color: '#003B5C', desc: 'Revenue recognition' },
    { id: 'paddle', name: 'Paddle', logo: 'PD', color: '#FFCE00', desc: 'SaaS billing & taxes' },
  ],
  CRM: [
    { id: 'salesforce', name: 'Salesforce', logo: 'SF', color: '#00A1E0', desc: 'Pipeline & forecast data' },
    { id: 'hubspot', name: 'HubSpot', logo: 'HS', color: '#FF7A59', desc: 'Deals & revenue tracking', fields: ['API Key', 'Portal ID'] },
    { id: 'pipedrive', name: 'Pipedrive', logo: 'PD', color: '#26292C', desc: 'Sales pipeline analytics' },
    { id: 'close', name: 'Close', logo: 'CL', color: '#2B3944', desc: 'Revenue forecasting' },
  ],
  HRIS: [
    { id: 'rippling', name: 'Rippling', logo: 'RP', color: '#FCD900', desc: 'Headcount & payroll sync' },
    { id: 'gusto', name: 'Gusto', logo: 'GU', color: '#F45D48', desc: 'Payroll & benefits data' },
    { id: 'bamboo', name: 'BambooHR', logo: 'BB', color: '#73C41D', desc: 'Employee & comp data' },
    { id: 'deel', name: 'Deel', logo: 'DL', color: '#15357A', desc: 'Global payroll data' },
    { id: 'workday', name: 'Workday', logo: 'WD', color: '#F68D2E', desc: 'HR & workforce planning' },
  ],
  'Data Warehouse': [
    { id: 'snowflake', name: 'Snowflake', logo: 'SF', color: '#29B5E8', desc: 'Query warehouse data' },
    { id: 'bigquery', name: 'BigQuery', logo: 'BQ', color: '#4285F4', desc: 'Google Cloud analytics' },
    { id: 'redshift', name: 'Redshift', logo: 'RS', color: '#8C4FFF', desc: 'AWS data warehouse' },
    { id: 'databricks', name: 'Databricks', logo: 'DB', color: '#FF3621', desc: 'Lakehouse analytics' },
  ],
  Productivity: [
    { id: 'sheets', name: 'Google Sheets', logo: 'GS', color: '#0F9D58', desc: 'Import spreadsheet data' },
    { id: 'excel', name: 'Excel Online', logo: 'EX', color: '#217346', desc: 'Microsoft 365 data' },
    { id: 'airtable', name: 'Airtable', logo: 'AT', color: '#FCBF49', desc: 'Structured data sync' },
    { id: 'notion', name: 'Notion', logo: 'NT', color: '#000000', desc: 'Database & docs sync' },
    { id: 'slack', name: 'Slack', logo: 'SL', color: '#4A154B', desc: 'Alerts & notifications' },
    { id: 'jira', name: 'Jira', logo: 'JR', color: '#0052CC', desc: 'Project tracking data' },
  ],
};

export default function IntegrationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [connected, setConnected] = useState({});
  const [setupModal, setSetupModal] = useState(null);

  const tabs = ['All', ...Object.keys(integrationCategories)];

  const allIntegrations = Object.entries(integrationCategories).flatMap(([cat, items]) =>
    items.map(item => ({ ...item, category: cat }))
  );

  const filtered = allIntegrations.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'All' || i.category === activeTab;
    return matchSearch && matchTab;
  });

  const handleConnect = (integration) => {
    setSetupModal(integration);
  };

  const handleConfirmConnect = () => {
    if (setupModal) {
      setConnected(c => ({ ...c, [setupModal.id]: true }));
      setSetupModal(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 rounded-xl">
              <Link2 className="w-6 h-6 text-cyan-400" />
            </div>
            Integrations
          </h1>
          <p className="text-text-muted mt-1 text-sm">Connect your financial tools and data sources</p>
        </div>
        <div className="text-sm text-text-muted">
          <span className="font-semibold text-accent-light">{Object.keys(connected).length}</span> / {allIntegrations.length} connected
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="space-y-3">
        <div className="max-w-md">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search integrations..."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-100 transition-all shadow-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab ? 'bg-accent/15 text-accent-light' : 'text-text-muted hover:bg-gray-100'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(integration => (
          <div key={integration.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-accent/30 transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: integration.color }}>
                {integration.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">{integration.name}</h3>
                <p className="text-xs text-text-muted">{integration.desc}</p>
              </div>
              {connected[integration.id] ? (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                  <Check className="w-3 h-3" /> Connected
                </span>
              ) : (
                <button onClick={() => handleConnect(integration)}
                  className="text-xs font-medium text-accent-light hover:text-accent bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-lg transition-all">
                  Connect
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-gray-100">
              <span className="uppercase tracking-wide">{integration.category}</span>
              {connected[integration.id] && <span className="text-green-600">Last sync: 2 min ago</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Setup Modal */}
      {setupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSetupModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="h-1.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${setupModal.color}, ${setupModal.color}88)` }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: setupModal.color }}>
                  {setupModal.logo}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Connect {setupModal.name}</h3>
                  <p className="text-sm text-text-muted">{setupModal.desc}</p>
                </div>
                <button onClick={() => setSetupModal(null)} className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1.5">API Key <span className="text-red-400">*</span></label>
                  <input type="password" placeholder="Enter your API key" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1.5">Environment</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50">
                    <option>Production</option>
                    <option>Sandbox</option>
                  </select>
                </div>
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700">Your credentials are encrypted and stored securely. We only request read-only access to your data.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setSetupModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-text-muted bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleConfirmConnect} className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all" style={{ backgroundColor: setupModal.color }}>
                  Connect {setupModal.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
