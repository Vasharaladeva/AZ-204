// Module 01 · Azure App Service — Home page with API health check
import { useHealth } from '../hooks/useHealth';

const MODULES = [
  { day: 1, num: '01', title: 'App Service Web Apps',         color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { day: 1, num: '02', title: 'Azure Functions',              color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { day: 2, num: '03', title: 'Blob Storage',                 color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { day: 2, num: '04', title: 'Cosmos DB',                    color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { day: 3, num: '05', title: 'Containerized Solutions',      color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { day: 3, num: '06', title: 'User Authentication',          color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { day: 3, num: '07', title: 'Secure Cloud Solutions',       color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { day: 4, num: '08', title: 'API Management',               color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { day: 4, num: '09', title: 'Event-Based Solutions',        color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { day: 4, num: '10', title: 'Message-Based Solutions',      color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { day: 5, num: '11', title: 'Application Insights',         color: 'bg-orange-50 border-orange-200 text-orange-700' },
];

export default function HomePage() {
  const { status, loading } = useHealth();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Azure Developer Course</h1>
        <p className="text-gray-500 text-sm mb-6">AZ-204 · 5-day full-stack project covering all 11 modules</p>

        {/* Module 01 · Health status badge */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Backend status:</span>
          {loading ? (
            <span className="badge bg-gray-100 text-gray-600">Checking…</span>
          ) : status?.status === 'ok' ? (
            <span className="badge-green">● Online — {status.environment}</span>
          ) : (
            <span className="badge-red">● Offline</span>
          )}
          {status?.version && (
            <span className="text-xs text-gray-400">v{status.version}</span>
          )}
        </div>
      </div>

      {/* Module grid */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Course modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES.map((m) => (
            <div key={m.num} className={`rounded-xl border p-4 ${m.color}`}>
              <div className="flex items-start justify-between">
                <span className="text-xs font-mono font-semibold opacity-60">MOD {m.num}</span>
                <span className="text-xs opacity-50">Day {m.day}</span>
              </div>
              <p className="mt-2 text-sm font-medium">{m.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
