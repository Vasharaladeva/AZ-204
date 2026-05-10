// Module 08 · API Management + Module 11 · Application Insights
// Dashboard showing API metrics and telemetry summary
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useHealth } from '../hooks/useHealth';

// Simulated App Insights summary — in production query the
// Azure Monitor REST API or use the App Insights SDK queries
function useInsightsSummary() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // In a real implementation you'd call:
    // GET https://api.applicationinsights.io/v1/apps/{appId}/metrics/...
    // For now we simulate the structure so you can wire it up
    setData({
      requests:   { count: 142, failed: 3 },
      exceptions: { count: 3 },
      performance: { avgDuration: 87 },
      customEvents: [
        { name: 'noteCreated',  count: 28 },
        { name: 'fileUploaded', count: 14 },
      ],
    });
  }, []);

  return data;
}

function StatCard({ label, value, sub, color = 'text-gray-900' }) {
  return (
    <div className="card">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { status } = useHealth();
  const insights = useInsightsSummary();

  const errorRate = insights
    ? ((insights.requests.failed / insights.requests.count) * 100).toFixed(1)
    : '—';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Module 08 · API Management — Module 11 · Application Insights</p>
      </div>

      {/* Module 01 · App Service info */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">App Service — Module 01</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Status"      value={status?.status === 'ok' ? '● Online' : '● Offline'} color={status?.status === 'ok' ? 'text-green-600' : 'text-red-600'} />
          <StatCard label="Environment" value={status?.environment || '—'} />
          <StatCard label="Version"     value={status?.version || '—'} />
          <StatCard label="Timestamp"   value={status?.timestamp ? new Date(status.timestamp).toLocaleTimeString() : '—'} />
        </div>
      </section>

      {/* Module 11 · App Insights metrics */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Application Insights — Module 11</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total requests"  value={insights?.requests.count ?? '—'} />
          <StatCard label="Failed requests" value={insights?.requests.failed ?? '—'} color="text-red-600" />
          <StatCard label="Error rate"      value={`${errorRate}%`} color={parseFloat(errorRate) > 5 ? 'text-red-600' : 'text-green-600'} />
          <StatCard label="Avg duration"    value={insights ? `${insights.performance.avgDuration} ms` : '—'} />
        </div>
      </section>

      {/* Custom events */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Custom events — Module 11</h2>
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Event</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Count (last 24 h)</th>
              </tr>
            </thead>
            <tbody>
              {(insights?.customEvents || []).map((ev) => (
                <tr key={ev.name} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-azure-700">{ev.name}</td>
                  <td className="px-5 py-3 text-right font-semibold">{ev.count}</td>
                </tr>
              ))}
              {!insights && (
                <tr><td colSpan={2} className="px-5 py-6 text-center text-gray-400 text-sm">Loading telemetry…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Module 08 · APIM hint */}
      <section>
        <div className="rounded-xl border border-azure-100 bg-azure-50 px-5 py-4">
          <h3 className="font-semibold text-azure-700 text-sm mb-1">Module 08 · API Management</h3>
          <p className="text-azure-600 text-sm">
            In production, all <code className="bg-azure-100 px-1 rounded text-xs">/api/*</code> calls route through an
            Azure API Management gateway. APIM adds rate limiting, request caching, JWT validation policies,
            and a developer portal. Deploy your backend, then create an APIM instance and import the API
            using the OpenAPI spec at <code className="bg-azure-100 px-1 rounded text-xs">/api-docs</code>.
          </p>
        </div>
      </section>
    </div>
  );
}
