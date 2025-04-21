import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="px-4 py-2 max-w-3xl mx-auto text-gray-700">
        {/* 
      <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        Terms of Service
      </h1>
      */}

      <p className="mb-4 text-base">
        Welcome to <span className="font-semibold text-indigo-600">ReadTime</span>! We're glad you're here.
      </p>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        By using our app, you agree to the following:
      </h2>

      <ul className="list-disc list-inside space-y-2 mb-5 text-sm sm:text-base">
        <li>You're responsible for your own reading activity and data.</li>
        <li>Don&apos;t misuse the app or attempt to harm its performance.</li>
        <li>We may update these terms occasionally — we'll notify you if anything major changes.</li>
      </ul>

      <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-sm p-3 rounded mb-5">
        ReadTime is built to help you track your reading in a way that’s easy, useful, and respectful of your time and privacy.
      </div>

      <p className="flex items-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Thank you for being part of ReadTime 💙
      </p>
    </div>
  );
};

export default TermsOfService;
