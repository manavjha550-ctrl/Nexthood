import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function Legal() {
  useEffect(() => {
    document.title = "LEGAL — NEXTHOOD STUDIO";
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 container mx-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase mb-8">Legal Policies</h1>
        <div className="prose prose-invert font-outfit text-brand-off-white/80">
          <p className="mb-6">The comprehensive Legal, Privacy, and Returns policies will be published here in the upcoming commerce phase.</p>
          <Link to="/" className="text-brand-white underline underline-offset-4 hover:text-brand-off-white transition-colors uppercase tracking-widest text-xs font-bold">Return Home</Link>
        </div>
      </div>
    </div>
  );
}
