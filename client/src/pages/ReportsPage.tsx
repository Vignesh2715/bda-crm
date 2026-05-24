import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { Loader2, TrendingUp, Award, Target } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => { const { data } = await api.get('/dashboard/stats'); return data; },
  });

  const charts = data?.charts || {};
  const stats = data?.stats || {};

  const bySourceData = (charts.bySource || []).map((d: any) => ({ name: d._id, value: d.count }));
  const byStatusData = (charts.byStatus || []).map((d: any) => ({ name: d._id, count: d.count }));
  const monthlyData = (charts.monthlyData || []).map((d: any) => ({
    name: MONTHS[(d._id?.month || 1) - 1],
    Leads: d.count,
    Won: d.won,
    Revenue: d.revenue / 100000, // in lakhs
  }));
  const teamData = (charts.teamPerformance || []).map((d: any) => ({
    name: d.name?.split(' ')[0],
    Total: d.total,
    Won: d.won,
    Rate: Math.round(d.rate || 0),
  }));

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="text-sm text-slate-500">Company-wide performance overview</p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue (Won)', value: formatCurrency(stats.revenue || 0), icon: '💰', trend: '+12%' },
          { label: 'Conversion Rate', value: `${stats.conversionRate || 0}%`, icon: '📈', trend: '+2%' },
          { label: 'Total Won Deals', value: stats.wonLeads || 0, icon: '🏆', trend: '+8' },
          { label: 'Active Pipeline', value: stats.activeLeads || 0, icon: '🎯', trend: `${stats.totalLeads || 0} total` },
        ].map(k => (
          <div key={k.label} className="card p-5">
            <div className="text-2xl mb-2">{k.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
            <p className="text-xs text-green-600 font-medium mt-1">{k.trend}</p>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary-500" /> Revenue & Lead Trend (Last 6 Months)
        </h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}L`} />
              <Tooltip formatter={(val, name) => name === 'Revenue' ? `₹${val}L` : val} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="Leads" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="Won" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="Revenue" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data available</div>}
      </div>

      {/* Two charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Pipeline Distribution</h3>
          {byStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={byStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {byStatusData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data</div>}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Lead Sources</h3>
          {bySourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={bySourceData} cx="50%" cy="50%" outerRadius={90} innerRadius={40} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {bySourceData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data</div>}
        </div>
      </div>

      {/* Team Leaderboard */}
      {teamData.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award size={16} className="text-amber-500" /> Team Leaderboard
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Rank</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">BDA</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Total Leads</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Won</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {teamData.map((t: any, i: number) => (
                  <tr key={i} className={`border-b border-slate-100 dark:border-slate-800 ${i === 0 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : 'text-amber-700'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">{t.name}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{t.Total}</td>
                    <td className="py-3 px-3 text-green-600 font-semibold">{t.Won}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 max-w-[80px]">
                          <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${Math.min(t.Rate, 100)}%` }} />
                        </div>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">{t.Rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
