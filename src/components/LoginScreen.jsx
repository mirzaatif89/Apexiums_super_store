import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  UserPlus
} from 'lucide-react';

export default function LoginScreen({ logoSrc, storeName, onLogin }) {
  const [tab, setTab] = React.useState('login'); // 'login' | 'signup'

  // Login form state
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);

  // Signup form state
  const [signupName, setSignupName] = React.useState('');
  const [signupEmail, setSignupEmail] = React.useState('');
  const [signupPassword, setSignupPassword] = React.useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = React.useState('');
  const [showSignupPassword, setShowSignupPassword] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  // Status state
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');

  // Password strength calculation for Signup UI
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    const hasNum = /\d/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    if (pass.length >= 8 && (hasNum || hasSpecial) && hasUpper) {
      return { score: 3, label: 'Strong', color: 'bg-emerald-600' };
    }
    return { score: 2, label: 'Medium', color: 'bg-amber-500' };
  };

  const strength = getPasswordStrength(signupPassword);

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid username or password');
      const userRole = data.user?.role || data.role || 'User';
      onLogin({
        ...data.user,
        role: userRole,
        businessId: userRole === 'SuperAdmin' ? null : data.businessId || data.user?.businessId || data.user?.id,
        loginType: userRole !== 'User' ? 'admin' : 'user'
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions to proceed.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: signupEmail.trim(), password: signupPassword })
      });

      if (response.ok) {
        const data = await response.json();
        onLogin({
          ...data.user,
          role: data.user?.role || 'User',
          loginType: 'user'
        });
      } else {
        setSuccessMsg('Account created successfully! Please sign in with your credentials.');
        setTab('login');
        setUsername(signupEmail.trim());
        setPassword(signupPassword);
      }
    } catch (err) {
      setSuccessMsg('Account registered! Please sign in using your email and password.');
      setTab('login');
      setUsername(signupEmail.trim());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-emerald-100 grid lg:grid-cols-2">
        {/* Left Hero Section (Marketplace Style Banner) */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-10 text-white relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2 shadow-lg">
                <img src={logoSrc} alt={storeName} className="h-10 w-auto object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  Official Portal
                </span>
                <h1 className="text-2xl font-black text-white">{storeName}</h1>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black leading-tight text-white">
                Pakistan's Best Marketplace Experience
              </h2>
              <p className="text-xs leading-relaxed text-emerald-100/80">
                Log in to view dashboard statistics, manage multi-vendor inventory, process orders, and explore live promotions.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-emerald-800/80">
              <div className="flex items-center gap-3.5 text-xs text-emerald-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800/80 text-emerald-300 shadow-xs">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="font-bold text-white">Express Nationwide Shipping</p>
                  <p className="text-[11px] text-emerald-200/70">Doorstep delivery across all cities</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-xs text-emerald-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800/80 text-emerald-300 shadow-xs">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="font-bold text-white">Buyer Protection Guarantee</p>
                  <p className="text-[11px] text-emerald-200/70">100% verified authentic sellers</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-xs text-emerald-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800/80 text-emerald-300 shadow-xs">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="font-bold text-white">Exclusive Daily Flash Sales</p>
                  <p className="text-[11px] text-emerald-200/70">Vouchers and instant discounts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 text-[11px] text-emerald-300/80">
            © {new Date().getFullYear()} {storeName}. All rights reserved. Safe & Secure Portal.
          </div>
        </div>

        {/* Right Form Card */}
        <div className="p-6 sm:p-10 bg-white flex flex-col justify-between">
          <div>
            {/* Mobile Header Branding */}
            <div className="flex items-center justify-between lg:hidden pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img src={logoSrc} alt={storeName} className="h-8 w-auto object-contain" />
                <span className="font-black text-slate-900 text-sm">{storeName}</span>
              </div>
            </div>

            {/* Main Tabs (Sign In / Register) */}
            <div className="flex gap-2 rounded-xl bg-slate-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-extrabold transition-all ${
                  tab === 'login'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn size={14} />
                <span>SIGN IN</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-extrabold transition-all ${
                  tab === 'signup'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus size={14} />
                <span>REGISTER</span>
              </button>
            </div>

            {/* Status Alert Banners */}
            {error ? (
              <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-red-50 p-3 border border-red-200 text-xs font-medium text-red-700">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            ) : null}

            {successMsg ? (
              <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-xs font-medium text-emerald-800">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            ) : null}

            {/* TAB 1: LOGIN */}
            {tab === 'login' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Welcome Back</h3>
                  <p className="text-xs text-slate-500">Sign in to your account</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-700">
                      Username or Email
                    </label>
                    <div className="relative flex items-center">
                      <User size={16} className="absolute left-3 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username or email"
                        className="w-full h-11 pl-9 pr-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-700">Password</label>
                    <div className="relative flex items-center">
                      <Lock size={16} className="absolute left-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full h-11 pl-9 pr-10 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="font-semibold text-emerald-700 hover:underline">
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-xs uppercase tracking-wider text-white shadow-md shadow-emerald-950/10 transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <LogIn size={16} />
                    <span>{loading ? 'Authenticating...' : 'Sign In Now'}</span>
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-600 font-medium">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setTab('signup');
                          setError('');
                          setSuccessMsg('');
                        }}
                        className="font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Create Account
                      </button>
                    </p>
                  </div>
                </form>

                {/* Social Login UI Placeholders */}
                <div className="pt-2">
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-slate-200" />
                    <span className="absolute bg-white px-3 text-[10px] font-bold uppercase text-slate-400">
                      Or Login With
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setError('Google login feature is coming soon.')}
                      className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3c0 2.9.7 5.6 1.9 8l3.7-2.9z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                        />
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setError('Facebook login feature is coming soon.')}
                      className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <svg className="h-4 w-4 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>Facebook</span>
                    </button>
                  </div>
                </div>

                {/* Switch to Signup Prompt */}
                <div className="text-center pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signup');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              /* TAB 2: SIGNUP */
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Create Account</h3>
                  <p className="text-xs text-slate-500">Sign up to start shopping on Apexiums Super Store</p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-700">Full Name</label>
                    <div className="relative flex items-center">
                      <User size={16} className="absolute left-3 text-slate-400" />
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Muhammad Ali"
                        className="w-full h-10 pl-9 pr-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-700">Email or Mobile</label>
                    <div className="relative flex items-center">
                      <Mail size={16} className="absolute left-3 text-slate-400" />
                      <input
                        type="text"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="name@example.com or username"
                        className="w-full h-10 pl-9 pr-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-700">Password</label>
                    <div className="relative flex items-center">
                      <Lock size={16} className="absolute left-3 text-slate-400" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full h-10 pl-9 pr-10 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600"
                      >
                        {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {signupPassword ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                          <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                          <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">{strength.label}</span>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-700">Confirm Password</label>
                    <div className="relative flex items-center">
                      <ShieldCheck size={16} className="absolute left-3 text-slate-400" />
                      <input
                        type="password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full h-10 pl-9 pr-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>
                        I agree to the <a href="#" className="font-bold text-emerald-700 hover:underline">Terms of Service</a> and <a href="#" className="font-bold text-emerald-700 hover:underline">Privacy Policy</a>.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-xs uppercase tracking-wider text-white shadow-md shadow-emerald-950/10 transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  >
                    <UserPlus size={16} />
                    <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                  </button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setTab('login');
                        setError('');
                      }}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
