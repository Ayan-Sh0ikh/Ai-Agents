import React, { useState } from 'react';
import { UserProfile, EducationLevel } from '../types';
import { Check, ChevronRight, GraduationCap, Calendar, User, BookOpen } from 'lucide-react';

interface OnboardingPageProps {
  onComplete: (profile: UserProfile) => void;
}

const educationOptions: EducationLevel[] = [
  '1st to 10th',
  '11th to 12th',
  'Diploma',
  'Bachelor\'s',
  'Master\'s',
  'PhD'
];

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [education, setEducation] = useState<EducationLevel | null>(null);
  const [step, setStep] = useState(1); // For simple animation staggering

  const isFormValid = name.trim() !== '' && birthDate !== '' && education !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && education) {
        onComplete({
            name,
            birthDate,
            educationLevel: education
        });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] flex items-center justify-center relative overflow-hidden font-sans text-zinc-100 p-4">
       {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-lg bg-[#0c0c0e] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="mb-8">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 block">Account Setup</span>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Tell us about yourself</h1>
            <p className="text-zinc-500">C5 adapts its reasoning engine based on your profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Input */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                    <User className="w-3 h-3" /> Full Name
                </label>
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Sterling"
                    className="w-full bg-[#18181b] border border-zinc-800 text-zinc-100 rounded-xl p-3.5 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder-zinc-700"
                />
            </div>

            {/* Birth Date Input */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Birth Date
                </label>
                <input 
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-[#18181b] border border-zinc-800 text-zinc-100 rounded-xl p-3.5 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all [color-scheme:dark]"
                />
            </div>

            {/* Education Level Selection */}
            <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                    <GraduationCap className="w-3 h-3" /> Education Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {educationOptions.map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => setEducation(level)}
                            className={`p-3 rounded-xl text-sm font-medium border text-left transition-all relative overflow-hidden ${
                                education === level 
                                    ? 'bg-zinc-100 text-black border-zinc-100 shadow-lg shadow-white/10' 
                                    : 'bg-[#18181b] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
                            }`}
                        >
                            {level}
                            {education === level && (
                                <div className="absolute top-2 right-2 text-emerald-600">
                                    <Check className="w-3 h-3" strokeWidth={4} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={!isFormValid}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all shadow-xl ${
                        isFormValid 
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-900/20' 
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                >
                    Complete Setup <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
