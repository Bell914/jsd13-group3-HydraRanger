import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';
import { Button, Card } from '../components/index.js';

export const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <Card>
        <div className="py-8 px-4 flex flex-col items-center">
          <HelpCircle size={48} className="text-rose-400 mb-4" />
          <h1 className="text-5xl font-extrabold text-slate-100 mb-2">404</h1>
          <h2 className="text-lg font-bold text-slate-300 mb-2">
            Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-xs">
            The requested page does not exist or has been moved.
          </p>
          <Link to="/">
            <Button variant="primary" icon={Home}>
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
