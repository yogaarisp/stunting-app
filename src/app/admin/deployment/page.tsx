'use client';

import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  ArrowLeft, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  Cloud,
  Key,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface EnvCheckResult {
  success: boolean;
  environment: string;
  platform: string;
  variables: Record<string, { exists: boolean; value: string }>;
  missing: string[];
  message: string;
}

export default function DeploymentPage() {
  const [envCheck, setEnvCheck] = useState<EnvCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, { loading: boolean; message: string; success: boolean | null }>>({
    gemini: { loading: false, message: '', success: null },
    supabase: { loading: false, message: '', success: null }
  });

  const checkEnvironment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/check-env');
      const data = await response.json();
      setEnvCheck(data);
    } catch (error) {
      console.error('Failed to check environment:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (service: 'gemini' | 'supabase') => {
    setTestResults(prev => ({ ...prev, [service]: { ...prev[service], loading: true, message: '' } }));
    
    try {
      const response = await fetch('/api/admin/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, config: {} }),
      });

      const data = await response.json();
      setTestResults(prev => ({ 
        ...prev, 
        [service]: { loading: false, message: data.message, success: data.success } 
      }));
    } catch (err: any) {
      setTestResults(prev => ({ 
        ...prev, 
        [service]: { loading: false, message: 'Terjadi kesalahan sistem.', success: false } 
      }));
    }
  };

  const testAll = async () => {
    setTesting(true);
    await Promise.all([
      testConnection('gemini'),
      testConnection('supabase')
    ]);
    setTesting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen pb-20">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-surface-400 hover:text-primary-600 transition-colors mb-2">
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </Link>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-surface-800 flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
            <Cloud className="text-white" size={24} />
          </div>
          Deployment <span className="gradient-text">Status</span>
        </h1>
        <p className="text-surface-500 mt-1 max-w-md">Monitoring konfigurasi dan status deployment aplikasi di production.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start animate-fade-in-up animate-delay-100">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Environment Check */}
          <div className="glass-card p-8 border-surface-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-surface-800 flex items-center gap-2 uppercase tracking-wider">
                <Database size={18} className="text-blue-500" />
                Environment Variables
              </h3>
              <button 
                onClick={checkEnvironment}
                disabled={loading}
                className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full border border-blue-100 transition-all flex items-center gap-1.5"
              >
                {loading ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : envCheck ? (
              <div className="space-y-4">
                {/* Platform Info */}
                <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
                  <div className="text-sm">
                    <span className="font-bold text-surface-600">Platform:</span> {envCheck.platform}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-surface-600">Environment:</span> {envCheck.environment}
                  </div>
                </div>

                {/* Variables Status */}
                <div className="space-y-3">
                  {Object.entries(envCheck.variables).map(([name, config]) => (
                    <div key={name} className={`p-4 rounded-xl border ${config.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {config.exists ? (
                            <CheckCircle2 size={16} className="text-green-600" />
                          ) : (
                            <AlertCircle size={16} className="text-red-600" />
                          )}
                          <span className="font-mono text-sm font-bold text-surface-800">{name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${config.exists ? 'text-green-600' : 'text-red-600'}`}>
                            {config.exists ? 'SET' : 'MISSING'}
                          </span>
                          {config.exists && (
                            <button 
                              onClick={() => copyToClipboard(config.value)}
                              className="p-1 text-surface-400 hover:text-surface-600 transition-colors"
                            >
                              <Copy size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      {config.exists && (
                        <p className="text-xs text-surface-500 font-mono mt-2 bg-white/50 p-2 rounded">
                          {config.value}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Overall Status */}
                <div className={`p-4 rounded-xl border ${envCheck.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-3">
                    {envCheck.success ? (
                      <CheckCircle2 size={20} className="text-green-600" />
                    ) : (
                      <AlertCircle size={20} className="text-red-600" />
                    )}
                    <p className={`font-bold text-sm ${envCheck.success ? 'text-green-700' : 'text-red-700'}`}>
                      {envCheck.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-surface-500">Gagal memuat status environment variables.</p>
              </div>
            )}
          </div>

          {/* Connection Tests */}
          <div className="glass-card p-8 border-surface-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-surface-800 flex items-center gap-2 uppercase tracking-wider">
                <Key size={18} className="text-amber-500" />
                Connection Tests
              </h3>
              <button 
                onClick={testAll}
                disabled={testing}
                className="text-[10px] font-bold text-amber-600 hover:bg-amber-50 px-3 py-1 rounded-full border border-amber-100 transition-all flex items-center gap-1.5"
              >
                {testing ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                Test All
              </button>
            </div>

            <div className="space-y-4">
              {/* Gemini Test */}
              <div className="p-4 bg-surface-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-surface-800">Google Gemini AI</h4>
                  <button 
                    onClick={() => testConnection('gemini')}
                    disabled={testResults.gemini.loading}
                    className="text-xs font-bold text-primary-600 hover:bg-primary-50 px-3 py-1 rounded-full border border-primary-100 transition-all flex items-center gap-1.5"
                  >
                    {testResults.gemini.loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    Test
                  </button>
                </div>
                {testResults.gemini.message && (
                  <p className={`text-xs font-bold px-3 py-2 rounded-lg ${testResults.gemini.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {testResults.gemini.message}
                  </p>
                )}
              </div>

              {/* Supabase Test */}
              <div className="p-4 bg-surface-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-surface-800">Supabase Database</h4>
                  <button 
                    onClick={() => testConnection('supabase')}
                    disabled={testResults.supabase.loading}
                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full border border-blue-100 transition-all flex items-center gap-1.5"
                  >
                    {testResults.supabase.loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    Test
                  </button>
                </div>
                {testResults.supabase.message && (
                  <p className={`text-xs font-bold px-3 py-2 rounded-lg ${testResults.supabase.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {testResults.supabase.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Troubleshooting Guide */}
          <div className="glass-card p-8 border-surface-200 bg-amber-50/30">
            <h3 className="text-sm font-bold text-surface-800 flex items-center gap-2 mb-6 uppercase tracking-wider">
              <AlertCircle size={18} className="text-amber-500" />
              Troubleshooting
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-800 mb-2">❌ Error: "supabaseKey is required"</h4>
                <p className="text-sm text-amber-700 mb-3">Environment variable SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di Vercel.</p>
                <div className="text-xs text-amber-600 space-y-1">
                  <p>1. Buka Vercel Dashboard → Settings → Environment Variables</p>
                  <p>2. Tambahkan SUPABASE_SERVICE_ROLE_KEY dengan value dari .env.local</p>
                  <p>3. Redeploy aplikasi</p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-800 mb-2">❌ Error: "API Key tidak valid"</h4>
                <p className="text-sm text-amber-700 mb-3">Google Gemini API Key belum dikonfigurasi atau salah.</p>
                <div className="text-xs text-amber-600 space-y-1">
                  <p>1. Pastikan GOOGLE_GEMINI_API_KEY sudah ditambahkan di Vercel</p>
                  <p>2. Verifikasi API Key di Google AI Studio</p>
                  <p>3. Aktifkan Generative Language API di Google Cloud</p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-800 mb-2">⚠️ Error: "Quota exceeded"</h4>
                <p className="text-sm text-amber-700 mb-3">API Key Gemini sudah mencapai quota limit.</p>
                <div className="text-xs text-amber-600 space-y-1">
                  <p>1. Tunggu quota reset (24 jam)</p>
                  <p>2. Upgrade ke paid plan di Google Cloud Console</p>
                  <p>3. Monitor usage di Google AI Studio</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="glass-card p-6 border-surface-200 bg-white shadow-xl">
            <h3 className="text-sm font-bold text-surface-800 flex items-center gap-2 mb-4">
              <ExternalLink size={18} className="text-primary-500" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <a 
                href="https://vercel.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-left px-4 py-3 bg-surface-50 hover:bg-surface-100 rounded-xl text-sm font-medium text-surface-700 transition-colors"
              >
                🚀 Vercel Dashboard
              </a>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-left px-4 py-3 bg-surface-50 hover:bg-surface-100 rounded-xl text-sm font-medium text-surface-700 transition-colors"
              >
                🤖 Google AI Studio
              </a>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-left px-4 py-3 bg-surface-50 hover:bg-surface-100 rounded-xl text-sm font-medium text-surface-700 transition-colors"
              >
                🗄️ Supabase Dashboard
              </a>
              <Link 
                href="/admin/settings"
                className="block w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-xl text-sm font-medium text-primary-700 transition-colors"
              >
                ⚙️ App Settings
              </Link>
            </div>
          </div>

          {envCheck && !envCheck.success && (
            <div className="glass-card p-6 border-red-200 bg-red-50">
              <h3 className="text-sm font-bold text-red-800 mb-3">⚠️ Action Required</h3>
              <p className="text-xs text-red-700 mb-4">
                {envCheck.missing.length} environment variable(s) belum dikonfigurasi.
              </p>
              <a 
                href="https://vercel.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary w-full text-center px-4 py-2 text-xs"
              >
                Fix di Vercel
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}