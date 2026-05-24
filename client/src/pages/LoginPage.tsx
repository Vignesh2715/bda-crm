import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
            <Briefcase size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">BDA CRM</h1>
          <p className="text-slate-400 mt-1 text-sm">Sales Pipeline Management System</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label text-slate-300">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                required
                className="input bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="label text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="input bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-primary-500 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-2.5 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" />Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 p-4 bg-slate-800/60 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400 font-medium mb-2">Demo credentials:</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p><span className="text-slate-300">Admin:</span> admin@bdacrm.com / Admin@123</p>
              <p><span className="text-slate-300">Manager:</span> manager@bdacrm.com / Manager@123</p>
              <p><span className="text-slate-300">BDA:</span> bda@bdacrm.com / Bda@123</p>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
