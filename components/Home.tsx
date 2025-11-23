import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  navigate: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      <div className="animate-fade-in-up">
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-16 tracking-tight">
          BENVENUTO
        </h1>

        <button
          onClick={() => navigate('/register')}
          className="group relative inline-flex items-center justify-center px-8 py-5 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500 hover:scale-105 shadow-lg shadow-indigo-500/50"
        >
          <span>Clicca qui per iscriverti a Jamm A Jam</span>
          <svg 
            className="w-6 h-6 ml-3 transition-transform duration-200 group-hover:translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="absolute -inset-3 rounded-full bg-indigo-400 opacity-20 group-hover:opacity-40 blur-lg transition-opacity duration-200" />
        </button>
      </div>
      
      <div className="absolute bottom-6 text-slate-500 text-sm">
        Jam Session Manager &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};