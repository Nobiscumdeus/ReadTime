import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="px-4 py-2 max-w-3xl mx-auto text-gray-700">
        {/*}
      <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        Privacy Policy
      </h1>
*/}
      <p className="mb-4 text-base">
        At <span className="font-semibold text-indigo-600">ReadTime</span>, your privacy is important to us.
      </p>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        How we handle your data:
      </h2>

      <ul className="list-disc list-inside space-y-2 mb-5 text-sm sm:text-base">
        <li>We only collect essential information related to your reading activity.</li>
        <li>This data is used purely for statistics and improving your experience.</li>
        <li>Only the admin has access to anonymized, read-related stats — never your personal identity.</li>
        <li>We do not sell, share, or misuse your data. Ever.</li>
      </ul>

      <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-sm p-3 rounded mb-5">
        By using ReadTime, you agree to this simple and respectful privacy approach.
      </div>

      <p className="flex items-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Questions? We're always here to help.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
