import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'bda' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4">
            <Briefcase size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join BDA CRM today</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label text-slate-300">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith" required className="input bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
            </div>
            <div>
              <label className="label text-slate-300">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com" required className="input bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
            </div>
            <div>
              <label className="label text-slate-300">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 characters" required minLength={6} className="input bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
            </div>
            <div>
              <label className="label text-slate-300">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="input bg-slate-800 border-slate-700 text-white">
                <option value="bda">BDA Executive</option>
                <option value="manager">Sales Manager</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-2.5 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" />Creating account...</> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
