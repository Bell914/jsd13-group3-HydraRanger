import React from 'react';
import { Shield, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-1.5 rounded-lg flex">
            <Shield size={16} className="text-slate-950" />
          </div>
          <div>
            <span className="font-bold text-slate-200">HydraRanger</span>
            <span className="text-slate-500 ml-2">• Group 3 • JSD13</span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Crafted for Sprint 2 Full-Stack Deliverables
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-slate-200 transition-colors duration-150"
          >
            <Github size={16} />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};
