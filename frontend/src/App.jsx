import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl, isBackendConfigured } from './api';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const statusOptions = ['Reported', 'Under Review', 'In Progress', 'Resolved'];
const colors = ['#1f8d64', '#3eb489', '#6bc2a0', '#f39c12', '#d97706'];

function App({ dashboardOnly = false, insightsOnly = false, sdgOnly = false }) {
  const [openInsight, setOpenInsight] = useState(null);
  const [analytics, setAnalytics] = useState({
    summary: {},
    complaints_by_category: [],
    complaints_by_neighborhood: [],
    priority_distribution: [],
    daily_trend: [],
    weekly_trend: [],
    recent_activity: [],
  });
  const [complaints, setComplaints] = useState([]);
  const [modelEvaluation, setModelEvaluation] = useState({
    accuracy: 0,
    precision: 0,
    recall: 0,
    macro_f1: 0,
    classes: [],
  });
  const [adminKey, setAdminKey] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  const fetchAnalytics = async () => {
    const response = await fetch(apiUrl('/api/analytics'));
    const data = await response.json();
    setAnalytics(data);
  };

  const fetchComplaints = async () => {
    const response = await fetch(apiUrl('/api/complaints?per_page=10'));
    const data = await response.json();
    setComplaints(data.items || []);
  };

  const fetchModelEvaluation = async () => {
    const response = await fetch(apiUrl('/api/model/evaluation'));
    const data = await response.json();
    setModelEvaluation(data);
  };

  useEffect(() => {
    if (!isBackendConfigured) return;
    fetchAnalytics();
    fetchComplaints();
    fetchModelEvaluation();
  }, []);

  const summaryItems = useMemo(() => {
    const summary = analytics.summary || {};
    return [
      { label: 'Total complaints', value: summary.total_complaints || 0 },
      { label: 'Open complaints', value: summary.open_complaints || 0 },
      { label: 'Resolved complaints', value: summary.resolved_complaints || 0 },
      { label: 'Resolution rate', value: `${summary.resolution_rate || 0}%` },
    ];
  }, [analytics.summary]);

  const updateComplaintStatus = async (complaintId, status) => {
    if (!adminKey.trim()) {
      setAdminMessage('Enter the administrator API key to update complaint statuses.');
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/complaints/${complaintId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': adminKey,
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to update complaint status.');
      }
      setAdminMessage('');
      fetchAnalytics();
      fetchComplaints();
    } catch (error) {
      setAdminMessage(error.message);
    }
  };

  const insightData = analytics.complaints_by_category || [];
  const confidenceBreakdown = useMemo(() => {
    const buckets = [
      { name: 'High (>70%)', value: 0 },
      { name: 'Moderate (45-70%)', value: 0 },
      { name: 'Low (<45%)', value: 0 },
    ];
    complaints.forEach((item) => {
      const c = Number(item.confidence || 0);
      if (c >= 0.7) buckets[0].value += 1;
      else if (c >= 0.45) buckets[1].value += 1;
      else buckets[2].value += 1;
    });
    return buckets;
  }, [complaints]);

  const renderStatus = (status) => {
    const base = 'inline-flex rounded-full px-2.5 py-1 text-xs font-medium';
    if (status === 'Resolved') return `${base} bg-emerald-100 text-emerald-700`;
    if (status === 'In Progress') return `${base} bg-amber-100 text-amber-700`;
    if (status === 'Under Review') return `${base} bg-sky-100 text-sky-700`;
    return `${base} bg-slate-200 text-slate-700`;
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-soft">
              <img src={`${import.meta.env.BASE_URL}citycare-mark.svg`} alt="" className="h-10 w-10 rounded-xl" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">CityCare AI</div>
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Smarter Cities. Cleaner Tomorrow.</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!dashboardOnly && (
              <>
                <Link to="/features" className="secondary-button px-4 py-2">Features</Link>
                <Link to="/report" className="secondary-button px-4 py-2">Report</Link>
                <Link to="/dashboard" className="secondary-button px-4 py-2">Dashboard</Link>
                <Link to="/insights" className="secondary-button px-4 py-2">Insights</Link>
                <Link to="/sdg-11" className="secondary-button px-4 py-2">SDG 11</Link>
              </>
            )}
            {dashboardOnly && (
              <Link to="/" className="secondary-button px-4 py-2">Back to homepage</Link>
            )}
          </div>
        </div>
      </header>

      <main>
        {!isBackendConfigured && dashboardOnly && !sdgOnly && (
          <div className="mx-auto mt-6 max-w-7xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Live dashboard data requires a deployed backend. Configure the repository variable <code>VITE_API_BASE_URL</code> with its API URL.
          </div>
        )}
        {!dashboardOnly && (
          <>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Sustainable civic intelligence
              </div>
              <h1 className="flex max-w-xl items-start gap-3 text-4xl font-black tracking-tight text-slate-900 sm:gap-4 sm:text-5xl lg:text-6xl">
                <Building2 aria-hidden="true" className="mt-1 h-8 w-8 shrink-0 text-emerald-600 sm:h-10 sm:w-10 lg:mt-2 lg:h-12 lg:w-12" />
                <span>AI-powered solutions for cleaner, safer neighborhoods.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-600">
                Transform citizen feedback into actionable urban intelligence—classifying issues, prioritizing service work, and guiding smarter city decision-making.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/report" className="primary-button gap-2">
                  Submit a complaint <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/dashboard" className="secondary-button gap-2">
                  View analytics <BarChart3 className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white p-4 shadow-soft">
                  <div className="text-2xl font-black text-slate-900">1.2K</div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Demo reports</div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-soft">
                  <div className="text-2xl font-black text-slate-900">86%</div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">AI precision</div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-soft">
                  <div className="text-2xl font-black text-slate-900">42</div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Areas tracked</div>
                </div>
              </div>
            </div>

            <div className="card overflow-hidden p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-emerald-700">Live snapshot</div>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Urban operations</h2>
                </div>
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-emerald-700">Priority alerts</div>
                      <div className="mt-2 text-3xl font-black text-slate-900">18</div>
                    </div>
                    <BellRing className="h-8 w-8 text-emerald-700" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Waste</div>
                    <div className="mt-2 text-2xl font-black text-slate-900">34%</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Roads</div>
                    <div className="mt-2 text-2xl font-black text-slate-900">28%</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Drainage</div>
                    <div className="mt-2 text-2xl font-black text-slate-900">22%</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Air quality</div>
                    <div className="mt-2 text-2xl font-black text-slate-900">16%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">How it works</div>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">A practical civic issue workflow</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['Report', 'Residents submit issues with descriptions, location, and priority.'],
              ['Predict', 'The local ML engine classifies the complaint and estimates confidence.'],
              ['Resolve', 'Teams track progress and improve service response through data.'],
            ].map(([step, description], index) => (
              <div key={step} className="card p-6">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{step}</h3>
                <p className="mt-3 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>
          </>
        )}

        {dashboardOnly && !insightsOnly && !sdgOnly && (
          <>
        <section id="dashboard" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Dashboard</div>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">Operational analytics</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              Demo data labels shown where applicable
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {summaryItems.map(({ label, value }) => (
              <div key={label} className="card p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
                <div className="mt-4 text-3xl font-black text-slate-900">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <div className="card p-5">
              <div className="mb-4 text-lg font-bold text-slate-900">Complaints by category</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.complaints_by_category || []}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#1f8d64" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <div className="mb-4 text-lg font-bold text-slate-900">Priority distribution</div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={analytics.priority_distribution || []} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                    {(analytics.priority_distribution || []).map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <div className="card p-5">
              <div className="mb-4 text-lg font-bold text-slate-900">Daily reporting trend</div>
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart data={analytics.daily_trend || []}>
                  <defs>
                    <linearGradient id="fillTrend" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#1f8d64" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#1f8d64" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#1f8d64" fill="url(#fillTrend)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <div className="mb-4 text-lg font-bold text-slate-900">Confidence distribution</div>
              <ResponsiveContainer width="100%" height={270}>
                <LineChart data={confidenceBreakdown}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
          </>
        )}

        {dashboardOnly && insightsOnly && !sdgOnly && (
          <>
        <section id="insights" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Insights</div>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">Urban sustainability insights</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: 'Most reported issues',
                  body: insightData[0] ? `${insightData[0].name} leads with ${insightData[0].value} reports.` : 'Loading issue distribution…',
                },
                {
                  title: 'Neighborhood hotspots',
                  body: (analytics.complaints_by_neighborhood || [])[0] ? `${(analytics.complaints_by_neighborhood || [])[0].name} is currently highest in complaint volume.` : 'Neighborhood data will appear once reports are submitted.',
                },
                {
                  title: 'Waste trend',
                  body: 'Waste management consistently dominates the most recent reporting cycle, suggesting a need for more frequent collection or awareness campaigns.',
                },
              ].map(({ title, body }) => (
                <div key={title} className="card p-6">
                  <div className="mb-3 inline-flex rounded-full bg-emerald-50 p-2 text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-lg font-bold text-slate-900 transition-colors hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
                    aria-expanded={openInsight === title}
                    aria-controls={`insight-${title.toLowerCase().replaceAll(' ', '-')}`}
                    onClick={() => setOpenInsight((current) => current === title ? null : title)}
                  >
                    {title}
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-emerald-700 transition-transform ${openInsight === title ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  {openInsight === title && (
                    <p id={`insight-${title.toLowerCase().replaceAll(' ', '-')}`} className="mt-4 border-l-4 border-emerald-500 pl-4 text-slate-700">
                      {body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
          </>
        )}

        {dashboardOnly && sdgOnly && (
          <>
        <section id="sdg" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="card overflow-hidden p-6 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl bg-emerald-50 p-6">
                <div className="mb-3 inline-flex rounded-full bg-white p-2 text-emerald-700 shadow-soft">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">SDG 11</div>
                <h2 className="mt-4 text-3xl font-bold text-slate-900">Sustainable urban services</h2>
                <p className="mt-4 text-slate-600">
                  CityCare AI supports public service resilience by improving reporting, maintenance planning, and resource prioritization across neighborhoods.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Cleaner public spaces and waste monitoring', '/sdg-11/cleaner-public-spaces'],
                  ['Improved civic participation and transparency', '/sdg-11/civic-participation'],
                  ['More efficient infrastructure maintenance', '/sdg-11/infrastructure-maintenance'],
                  ['Data-driven municipal prioritization', '/sdg-11/municipal-prioritization'],
                ].map(([item, path]) => (
                  <Link
                    key={item}
                    to={path}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left font-medium text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
          </>
        )}

        {dashboardOnly && insightsOnly && !sdgOnly && (
          <>
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Model evaluation</div>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">Local ML assessment</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              ['Accuracy', (Number(modelEvaluation.accuracy || 0) * 100).toFixed(1) + '%'],
              ['Precision', (Number(modelEvaluation.precision || 0) * 100).toFixed(1) + '%'],
              ['Recall', (Number(modelEvaluation.recall || 0) * 100).toFixed(1) + '%'],
              ['Macro F1', (Number(modelEvaluation.macro_f1 || 0) * 100).toFixed(1) + '%'],
            ].map(([label, value]) => (
              <div key={label} className="card p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
                <div className="mt-4 text-3xl font-black text-slate-900">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Complaint management</div>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">Recent service queue</h2>
            </div>
            <div className="flex flex-col items-end gap-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                Admin API key
                <input
                  type="password"
                  autoComplete="off"
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  placeholder="Enter configured key"
                  className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                />
              </label>
              {adminMessage && <p role="alert" className="text-xs text-red-700">{adminMessage}</p>}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Title</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Confidence</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {complaints.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">{item.reference_id}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{item.title}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{item.predicted_category}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{item.location}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{item.priority}</td>
                      <td className="px-5 py-4 text-sm"><span className={renderStatus(item.status)}>{item.status}</span></td>
                      <td className="px-5 py-4 text-sm text-slate-700">{Number((item.confidence || 0) * 100).toFixed(1)}%</td>
                      <td className="px-5 py-4">
                        <select
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-700"
                          value={item.status}
                          disabled={!adminKey.trim()}
                          onChange={(event) => updateComplaintStatus(item.id, event.target.value)}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="text-lg font-bold text-slate-900">CityCare AI</div>
            <div className="mt-1">Smarter Cities. Cleaner Tomorrow.</div>
          </div>
          <div className="flex gap-6">
            <Link to="/features">Features</Link>
            <Link to="/report">Report</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/insights">Insights</Link>
            <Link to="/sdg-11">SDG 11</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
