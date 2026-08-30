import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';
import { Button, Card } from '../components/index.js';

export const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <Card>
        <div className="py-8 px-4 flex flex-col items-center">
          <HelpCircle size={48} aria-hidden="true" className="mb-4 text-accent" />
          <h1 className="mb-2 text-5xl font-extrabold text-primary">404</h1>
          <h2 className="mb-2 text-lg font-bold text-primary">
            Page Not Found
          </h2>
          <p className="mb-8 max-w-xs text-xs text-secondary sm:text-sm">
            The requested page does not exist or has been moved.
          </p>
          <Button as={Link} to="/" variant="primary" icon={Home}>
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};
