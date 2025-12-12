import React, { useState } from 'react';
import { Github, Mail, Phone, ArrowRight, Smartphone, User, Calendar } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [loginId, setLoginId] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  const handleAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] flex items-center justify-center relative overflow-hidden font-sans text-zinc-100 p-4">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse duration-[4000ms]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-[#0c0c0e]/90 backdrop-blur-3xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl relative z-10 animate-fade-in ring-1 ring-white/5">
        
        {/* Header */}
        <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-zinc-100 to-zinc-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                <span className="font-bold text-black text-xl">C5</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                {isLogin ? 'Welcome Back' : 'Join C5 NextGen'}
            </h1>
            <p className="text-zinc-500 text-sm">
                {isLogin ? 'Login to access your research space.' : 'Create your cognitive profile.'}
            </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-zinc-900/80 p-1.5 rounded-xl mb-6 border border-zinc-800/50">
            <button 
                onClick={() => setIsLogin(true)}
                className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${isLogin ? 'bg-zinc-800 text-white shadow-md shadow-black/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
            >
                Login
            </button>
            <button 
                onClick={() => setIsLogin(false)}
                className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${!isLogin ? 'bg-zinc-800 text-white shadow-md shadow-black/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
            >
                Sign Up
            </button>
        </div>

        {/* Social Login Stack */}
        <div className="grid grid-cols-1 gap-3 mb-6">
            <button onClick={() => handleAuth()} className="w-full flex items-center justify-center gap-3 bg-[#18181b] hover:bg-[#202023] border border-zinc-800 text-zinc-200 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
                 Continue with Google
            </button>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleAuth()} className="w-full flex items-center justify-center gap-2 bg-[#18181b] hover:bg-[#202023] border border-zinc-800 text-zinc-200 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                </button>
                <button onClick={() => handleAuth()} className="w-full flex items-center justify-center gap-2 bg-[#18181b] hover:bg-[#202023] border border-zinc-800 text-zinc-200 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                    <svg className="w-4 h-4 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                </button>
            </div>
            <button onClick={() => handleAuth()} className="w-full flex items-center justify-center gap-3 bg-[#18181b] hover:bg-[#202023] border border-zinc-800 text-zinc-200 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                Continue with Phone
            </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800/50"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-[#0c0c0e] px-2 text-zinc-600 font-semibold">Or continue with email</span>
            </div>
        </div>

        {/* Dynamic Form Content */}
        <form onSubmit={handleAuth} className="space-y-4">
            
            {isLogin ? (
                // --- Login View ---
                <div key="login-fields" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Email or Phone Number"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="w-full bg-[#18181b] border border-zinc-800 text-zinc-100 text-sm rounded-xl block pl-10 p-3.5 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder-zinc-600 shadow-inner"
                        />
                    </div>
                </div>
            ) : (
                // --- Signup View ---
                <div key="signup-fields" className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors">
                            <User className="w-4 h-4" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#18181b] border border-zinc-800 text-zinc-100 text-sm rounded-xl block pl-10 p-3.5 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder-zinc-600 shadow-inner"
                        />
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input 
                            type="email" 
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#18181b] border border-zinc-800 text-zinc-100 text-sm rounded-xl block pl-10 p-3.5 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder-zinc-600 shadow-inner"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors">
                            <Smartphone className="w-4 h-4" />
                        </div>
                        <input 
                            type="tel" 
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-[#18181b] border border-zinc-800 text-zinc-100 text-sm rounded-xl block pl-10 p-3.5 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder-zinc-600 shadow-inner"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <input 
                            type="date" 
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full bg-[#18181b] border border-zinc-800 text-zinc-100 text-sm rounded-xl block pl-10 p-3.5 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder-zinc-600 shadow-inner [color-scheme:dark]"
                        />
                    </div>
                </div>
            )}

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-zinc-100 to-zinc-300 hover:from-white hover:to-zinc-200 text-black py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-zinc-900/50 transform active:scale-[0.99] mt-2"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-600 rounded-full animate-spin" />
                ) : (
                    <>
                        {isLogin ? 'Login' : 'Sign Up'} 
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </form>

        <div className="mt-6 text-center">
             <p className="text-[10px] text-zinc-600 mb-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
                {isLogin ? (
                    <span>Don't have an account? <strong className="text-zinc-200 underline decoration-zinc-600 underline-offset-2">Create one</strong></span>
                ) : (
                    <span>Already have an account? <strong className="text-zinc-200 underline decoration-zinc-600 underline-offset-2">Login</strong></span>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;