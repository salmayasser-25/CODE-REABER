import React, { useState, useEffect } from 'react';
import {
  Activity,
  Stethoscope,
  Eye,
  EyeOff,
  AlertTriangle,
  Rocket,
  ShieldCheck,
  Radio,
  Lock,
  User,
  Mail,
  ArrowRight,
  Sparkles,
  Heart,
} from 'lucide-react';

export type UserRole = 'astronaut' | 'doctor';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  callsign?: string;
  credentialId?: string;
}

interface AuthPageProps {
  onLogin: (user: AuthUser) => void;
}

// Demo accounts for quick access
const DEMO_ACCOUNTS: AuthUser[] = [
  {
    id: 'ASTRO-74-SJ',
    name: 'Dr. Salma Johnson',
    email: 'salma.johnson@nasa.gov',
    role: 'astronaut',
    callsign: 'Nova',
  },
  {
    id: 'FS-9842',
    name: 'Dr. Marcus Vance, M.D., FACEP',
    email: 'marcus.vance@nasa.gov',
    role: 'doctor',
    credentialId: 'NASA-FS-9842',
  },
];

// Animated star field
function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 80 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${Math.random() * 2 + 0.5}px`,
            height: `${Math.random() * 2 + 0.5}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.7 + 0.1,
            animation: `pulse ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [callsignOrCredential, setCallsignOrCredential] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missionTime, setMissionTime] = useState('MET T+84:14:22:18');
  const [step, setStep] = useState<'role' | 'credentials'>('role');

  // Live mission clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const s = String(now.getSeconds()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const h = String((now.getHours() + 14) % 24).padStart(2, '0');
      setMissionTime(`MET T+84:${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    // Pre-fill demo credentials for quick access
    const demo = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (demo) {
      setEmail(demo.email);
      setPassword('nasa2026');
      if (mode === 'signup') {
        setName(demo.name);
        setCallsignOrCredential(role === 'astronaut' ? demo.callsign || '' : demo.credentialId || '');
      }
    }
    setStep('credentials');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setError(null);
    setIsLoading(true);

    // Simulate network auth delay
    await new Promise((r) => setTimeout(r, 1200));

    try {
      if (mode === 'signin') {
        // Demo auth — match by email
        const account = DEMO_ACCOUNTS.find(
          (a) => a.email.toLowerCase() === email.toLowerCase() && a.role === selectedRole
        );
        if (!account) {
          // Accept any login with the right role for demo purposes
          const user: AuthUser = {
            id: selectedRole === 'astronaut' ? 'ASTRO-74-SJ' : 'FS-9842',
            name: selectedRole === 'astronaut' ? 'Dr. Salma Johnson' : 'Dr. Marcus Vance, M.D.',
            email,
            role: selectedRole,
            callsign: selectedRole === 'astronaut' ? 'Nova' : undefined,
            credentialId: selectedRole === 'doctor' ? 'NASA-FS-9842' : undefined,
          };
          onLogin(user);
          return;
        }
        onLogin(account);
      } else {
        // Sign up — create new user
        if (!name.trim()) {
          setError('Full name is required.');
          setIsLoading(false);
          return;
        }
        const user: AuthUser = {
          id: `${selectedRole === 'astronaut' ? 'ASTRO' : 'FS'}-${Date.now()}`,
          name: name.trim(),
          email,
          role: selectedRole,
          callsign: selectedRole === 'astronaut' ? callsignOrCredential || 'Alpha' : undefined,
          credentialId: selectedRole === 'doctor' ? callsignOrCredential || 'NASA-FS-NEW' : undefined,
        };
        onLogin(user);
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('role');
    setSelectedRole(null);
    setError(null);
  };

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundImage: "url('/assets/aistudio/3d-rendering-dark-earth-space_2c80c4c8.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#050810',
      }}
    >
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-[#050810]/60 pointer-events-none" />

      {/* Animated stars */}
      <StarField />

      {/* Top status bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-[#FF8C00]/15 border-b border-[#FF8C00]/30 px-4 py-1.5 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#FF8C00]" />
          <span className="text-white font-bold tracking-wider">SIMULATED DEMONSTRATION DATA</span>
          <span className="text-slate-400 hidden sm:inline">·</span>
          <span className="text-slate-300 hidden sm:inline">NASA Space Apps Challenge — ASTROCARE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-slate-400">SECURE CHANNEL:</span>
          <span className="text-[#00E5FF] font-bold">{missionTime}</span>
        </div>
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md mt-12">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 shadow-[0_0_30px_rgba(0,229,255,0.4)] mb-4">
            <Activity className="w-8 h-8 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-black text-white font-['Chakra_Petch',sans-serif] tracking-widest">
            ASTROCARE
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Astronaut Smart Health Intelligence Platform
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
            <span className="text-xs font-mono text-emerald-400">SECURE CONNECTION ACTIVE</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-[#00E5FF]/30 bg-[#060b1c]/90 backdrop-blur-xl shadow-[0_0_60px_rgba(0,229,255,0.12)] overflow-hidden">
          {/* Mode Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => { setMode('signin'); setStep('role'); setSelectedRole(null); setError(null); }}
              className={`flex-1 py-3.5 text-sm font-bold font-mono tracking-wider transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-b-2 border-[#00E5FF]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => { setMode('signup'); setStep('role'); setSelectedRole(null); setError(null); }}
              className={`flex-1 py-3.5 text-sm font-bold font-mono tracking-wider transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-b-2 border-[#00E5FF]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              REGISTER
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Step 1: Role Selection */}
            {step === 'role' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="text-center">
                  <p className="text-sm font-mono text-slate-400">
                    {mode === 'signin' ? 'Select your mission role to authenticate' : 'Select your role to create an account'}
                  </p>
                </div>

                {/* Astronaut Card */}
                <button
                  onClick={() => handleRoleSelect('astronaut')}
                  className="w-full group relative p-5 rounded-xl border border-[#00E5FF]/30 bg-[#00E5FF]/5 hover:bg-[#00E5FF]/12 hover:border-[#00E5FF]/60 transition-all duration-200 text-left cursor-pointer hover:shadow-[0_0_30px_rgba(0,229,255,0.2)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all">
                      <Rocket className="w-6 h-6 text-[#00E5FF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                          ASTRONAUT
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] font-mono font-bold">
                          CREW
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        Personal health dashboard — vitals, body map, mental wellness & fitness
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {['Vital Signs', '3D Body Map', 'ASTRO AI', 'Fitness', 'Daily Check-in'].map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>

                {/* Doctor Card */}
                <button
                  onClick={() => handleRoleSelect('doctor')}
                  className="w-full group relative p-5 rounded-xl border border-[#FF8C00]/30 bg-[#FF8C00]/5 hover:bg-[#FF8C00]/12 hover:border-[#FF8C00]/60 transition-all duration-200 text-left cursor-pointer hover:shadow-[0_0_30px_rgba(255,140,0,0.2)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FF8C00]/15 border border-[#FF8C00]/40 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_20px_rgba(255,140,0,0.4)] transition-all">
                      <Stethoscope className="w-6 h-6 text-[#FF8C00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                          FLIGHT SURGEON
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF8C00]/20 border border-[#FF8C00]/40 text-[#FF8C00] font-mono font-bold">
                          MCC
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        Mission Control medical dashboard — crew monitoring, records & clinical tools
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#FF8C00] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {['Crew Vitals Matrix', 'Medical Alerts', 'Prescriptions', 'Analytics', 'Comms'].map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              </div>
            )}

            {/* Step 2: Credentials */}
            {step === 'credentials' && selectedRole && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Role badge + back */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                    selectedRole === 'astronaut'
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF]/40 text-[#00E5FF]'
                      : 'bg-[#FF8C00]/15 border-[#FF8C00]/40 text-[#FF8C00]'
                  }`}>
                    {selectedRole === 'astronaut' ? <Rocket className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
                    {selectedRole === 'astronaut' ? 'ASTRONAUT ACCESS' : 'FLIGHT SURGEON ACCESS'}
                  </div>
                  <button
                    onClick={handleBack}
                    className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    ← Change role
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Sign up only: Full name */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={selectedRole === 'astronaut' ? 'Dr. Salma Johnson' : 'Dr. Marcus Vance, M.D.'}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] focus:outline-none text-sm font-sans"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      NASA Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={selectedRole === 'astronaut' ? 'salma.johnson@nasa.gov' : 'marcus.vance@nasa.gov'}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] focus:outline-none text-sm font-sans"
                        required
                      />
                    </div>
                  </div>

                  {/* Sign up only: Callsign or Credential ID */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        {selectedRole === 'astronaut' ? 'Callsign' : 'Credential ID'}
                      </label>
                      <div className="relative">
                        {selectedRole === 'astronaut'
                          ? <Radio className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          : <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        }
                        <input
                          type="text"
                          value={callsignOrCredential}
                          onChange={(e) => setCallsignOrCredential(e.target.value)}
                          placeholder={selectedRole === 'astronaut' ? 'e.g. Nova' : 'e.g. NASA-FS-9842'}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] focus:outline-none text-sm font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Access Code
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] focus:outline-none text-sm font-sans"
                        required
                        minLength={4}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono animate-in fade-in">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Demo credentials hint */}
                  <div className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-500">
                    <span className="text-slate-400 font-bold">DEMO:</span> Any email · password: <span className="text-[#00E5FF]">nasa2026</span>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-xl font-mono font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                      selectedRole === 'astronaut'
                        ? 'bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 shadow-[0_0_25px_rgba(0,229,255,0.4)]'
                        : 'bg-[#FF8C00] text-black hover:bg-[#FF8C00]/90 shadow-[0_0_25px_rgba(255,140,0,0.4)]'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                        AUTHENTICATING…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        {mode === 'signin' ? 'ACCESS DASHBOARD' : 'CREATE ACCOUNT'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer credits */}
        <div className="mt-6 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>NASA SPACE APPS CHALLENGE · EXP-74 · ARTEMIS BIO-LAB</span>
          </div>
          <p className="text-[11px] font-mono text-slate-600">
            Powered by Gemini AI · Groq · Three.js · React
          </p>
        </div>
      </div>
    </div>
  );
};

