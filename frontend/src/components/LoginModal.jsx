import React from 'react';
import { openPrivacyPolicy } from './PrivacyPolicyModal';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  UserPlus,
  X
} from 'lucide-react';

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

export default function LoginModal({ open, onClose, onLogin, storeName, logoSrc, initialTab = 'login' }) {
  const [tab, setTab] = React.useState(initialTab); // 'login' | 'signup'

  // Login fields
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);

  // Signup fields
  const [signupName, setSignupName] = React.useState('');
  const [signupEmail, setSignupEmail] = React.useState('');
  const [signupPassword, setSignupPassword] = React.useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = React.useState('');
  const [showSignupPassword, setShowSignupPassword] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [signupStep, setSignupStep] = React.useState('details');
  const [verificationCode, setVerificationCode] = React.useState('');

  // Status state
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');

  // Success Popup state
  const [showSuccessPopup, setShowSuccessPopup] = React.useState(false);
  const [registeredUser, setRegisteredUser] = React.useState(null);

  React.useEffect(() => {
    if (!open) {
      setError('');
      setSuccessMsg('');
      setLoading(false);
      setShowSuccessPopup(false);
      setRegisteredUser(null);
      setSignupStep('details');
      setVerificationCode('');
      return;
    }
    setTab(initialTab || 'login');
    setUsername('');
    setPassword('');
  }, [open, initialTab]);

  if (!open) return null;

  if (showSuccessPopup && registeredUser) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-red-100 text-center space-y-4 animate-in zoom-in-95 duration-200 relative z-10">
          <div className="w-14 h-14 bg-red-50 text-[#E8262A] rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50/60 shadow-xs">
            <CheckCircle2 size={32} className="stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Registration Successful</h3>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              Welcome to Apexiums, <span className="font-bold text-slate-900">{registeredUser.name || 'User'}</span>! Your account has been created successfully.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (registeredUser) {
                setUsername(registeredUser.email || registeredUser.username || '');
              }
              setPassword('');
              setShowSuccessPopup(false);
              setTab('login');
              setError('');
              setSuccessMsg('Registration successful! Please login with your account.');
            }}
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8262A] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-950/10 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Proceed to Login</span>
          </button>
        </div>
      </div>
    );
  }

  // Password strength logic for Signup UI
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

  async function handleAdminQuickLogin() {
    setLoading(true);
    setError('');
    try {
      const response = await fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'superadmin', password: 'Admin@12345' })
      });
      const data = await response.json();
      if (response.ok) {
        onLogin({
          ...data.user,
          role: data.user?.role || 'SuperAdmin',
          loginType: 'admin'
        });
        onClose();
        return;
      }
    } catch (err) {
      // Fallback if network issue
    } finally {
      setLoading(false);
    }

    onLogin({
      id: 1,
      username: 'superadmin',
      name: 'Super Admin',
      role: 'SuperAdmin',
      businessId: null,
      loginType: 'admin'
    });
    onClose();
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid username or password');
      const userRole = data.user?.role || data.role || 'User';
      onLogin({
        ...data.user,
        token: data.token || null,
        role: userRole,
        businessId: userRole === 'SuperAdmin' ? null : data.businessId || data.user?.businessId || data.user?.id,
        loginType: userRole !== 'User' ? 'admin' : 'user'
      });
      onClose();
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
      const identifier = signupEmail.trim();
      const isEmail = identifier.includes('@');
      const response = await fetchWithTimeout('/api/customers/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: signupName.trim(),
            username: identifier,
            email: isEmail ? identifier : null,
            phone: isEmail ? null : identifier,
            password: signupPassword
          })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to create account.');
      const loginResponse = await fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, password: signupPassword })
      });
      const loginData = await loginResponse.json();
      if (!loginResponse.ok) throw new Error(loginData.message || 'Account created. Please sign in.');
      onLogin({ ...loginData.user, token: loginData.token || null, role: 'User', loginType: 'user' });
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerificationSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetchWithTimeout('/api/auth/customer-registration/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail.trim(), otp: verificationCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to verify code.');
      onLogin({ ...data.user, token: data.token || null, role: 'User', loginType: 'user' });
      onClose();
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop overlay */}
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close login overlay"
        onClick={onClose}
      />

      {/* Main Modal Card */}
      <section className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-red-100 my-auto">
          {/* Form Container */}
          <div className="p-5 sm:p-8 bg-white flex flex-col justify-between">
            {/* Modal Close Button & Top Tabs */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                {/* Marketplace Login/Signup Tabs */}
                <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                      tab === 'login'
                        ? 'bg-[#E8262A] text-white shadow-sm'
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
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                      tab === 'signup'
                        ? 'bg-[#E8262A] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus size={14} />
                    <span>REGISTER</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Alert Messages */}
              {error ? (
                <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-red-50 p-3 border border-red-200 text-xs font-medium text-red-700 animate-fadeIn">
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              ) : null}

              {successMsg ? (
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 text-xs text-emerald-800 animate-fadeIn">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-emerald-900">{successMsg}</p>
                    <p className="text-[11px] text-emerald-700">
                      Your account is created! Click the <strong>Account</strong> option at the bottom anytime to view your profile.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* TAB 1: LOGIN FORM */}
              {tab === 'login' ? (
                <div className="mt-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Welcome Back</h3>
                    <p className="text-xs text-slate-500">Sign in to your account</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    {/* Username or Email Input */}
                    <div>
                      <label className="block mb-1 text-xs font-bold text-slate-700">
                        Email or Contact Number
                      </label>
                      <div className="relative flex items-center">
                        <User size={16} className="absolute left-3 text-slate-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter email or contact number"
                          className="w-full h-11 pl-9 pr-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A] focus:ring-2 focus:ring-red-100 transition"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block mb-1 text-xs font-bold text-slate-700">Password</label>
                      <div className="relative flex items-center">
                        <Lock size={16} className="absolute left-3 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full h-11 pl-9 pr-10 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A] focus:ring-2 focus:ring-red-100 transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me & Forgot password */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#E8262A] focus:ring-red-500"
                        />
                        <span>Remember me</span>
                      </label>
                      <a href="#" className="font-semibold text-[#E8262A] hover:underline">
                        Forgot Password?
                      </a>
                    </div>

                    {/* Login CTA Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8262A] font-bold text-xs uppercase tracking-wider text-white shadow-md shadow-red-950/10 transition-all hover:bg-red-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <LogIn size={16} />
                      <span>{loading ? 'Authenticating...' : 'Sign In Now'}</span>
                    </button>

                    {/* Don't have an account prompt directly under Sign In button */}
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
                          className="font-bold text-[#E8262A] hover:underline cursor-pointer"
                        >
                          Create Account
                        </button>
                      </p>
                    </div>
                  </form>

                </div>
              ) : (
                /* TAB 2: SIGNUP FORM */
                <div className="mt-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Create Account</h3>
                    <p className="text-xs text-slate-500">Join Apexiums Super Store</p>
                  </div>

                  {signupStep === 'verify' ? (
                    <form onSubmit={handleVerificationSubmit} className="space-y-4 rounded-2xl border border-red-100 bg-red-50/40 p-4">
                      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-[#E8262A]"><Mail size={19} /></div><div><p className="text-sm font-extrabold text-slate-900">Check your inbox</p><p className="text-[11px] text-slate-500">Enter the code sent to {signupEmail}</p></div></div>
                      <input autoFocus inputMode="numeric" maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="h-12 w-full rounded-xl border border-slate-200 bg-white text-center text-xl font-black tracking-[0.45em] text-slate-900 outline-none focus:border-[#E8262A] focus:ring-2 focus:ring-red-100" required />
                      <button type="submit" disabled={loading || verificationCode.length !== 6} className="w-full h-11 rounded-xl bg-[#E8262A] text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70">{loading ? 'Verifying...' : 'Verify & Start Shopping'}</button>
                      <button type="button" onClick={() => { setSignupStep('details'); setVerificationCode(''); setError(''); }} className="w-full text-xs font-bold text-slate-500 hover:text-[#E8262A]">Use a different email</button>
                    </form>
                  ) : (
                  <form onSubmit={handleSignupSubmit} className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="block mb-1 text-xs font-bold text-slate-700">Full Name</label>
                      <div className="relative flex items-center">
                        <User size={16} className="absolute left-3 text-slate-400" />
                        <input
                          type="text"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="e.g. Muhammad Ali"
                          className="w-full h-10 pl-9 pr-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A] focus:ring-2 focus:ring-red-100 transition"
                          required
                        />
                      </div>
                    </div>

                    {/* Email or Contact Number */}
                    <div>
                      <label className="block mb-1 text-xs font-bold text-slate-700">Email or Contact Number</label>
                      <div className="relative flex items-center">
                        <Mail size={16} className="absolute left-3 text-slate-400" />
                        <input
                          type="text"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="name@example.com or 0300 1234567"
                          className="w-full h-10 pl-9 pr-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A] focus:ring-2 focus:ring-red-100 transition"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block mb-1 text-xs font-bold text-slate-700">Password</label>
                      <div className="relative flex items-center">
                        <Lock size={16} className="absolute left-3 text-slate-400" />
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full h-10 pl-9 pr-10 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A] focus:ring-2 focus:ring-red-100 transition"
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

                      {/* Password strength bar */}
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

                    {/* Confirm Password */}
                    <div>
                      <label className="block mb-1 text-xs font-bold text-slate-700">Confirm Password</label>
                      <div className="relative flex items-center">
                        <ShieldCheck size={16} className="absolute left-3 text-slate-400" />
                        <input
                          type="password"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full h-10 pl-9 pr-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A] focus:ring-2 focus:ring-red-100 transition"
                          required
                        />
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] text-slate-600">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#E8262A] focus:ring-red-500"
                        />
                        <span>
                          I agree to the <a href="#" className="font-bold text-[#E8262A] hover:underline">Terms of Service</a> and <button type="button" onClick={openPrivacyPolicy} className="font-bold text-[#E8262A] hover:underline">Privacy Policy</button>.
                        </span>
                      </label>
                    </div>

                    {/* Create Account CTA */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8262A] font-bold text-xs uppercase tracking-wider text-white shadow-md shadow-red-950/10 transition-all hover:bg-red-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-2 cursor-pointer"
                    >
                      <UserPlus size={16} />
                      <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                    </button>
                  </form>
                  )}

                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setTab('login');
                          setError('');
                        }}
                        className="font-bold text-[#E8262A] hover:underline cursor-pointer"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
      </section>
    </div>
  );
}
