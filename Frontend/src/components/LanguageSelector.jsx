import React from 'react';
import { FiGlobe } from 'react-icons/fi';

const LanguageSelector = () => {
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    const googleSelect = document.querySelector('.goog-te-combo');
    if (googleSelect) {
      googleSelect.value = selectedLang;
      googleSelect.dispatchEvent(new Event('change'));
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700 hover:border-gray-600 transition-colors">
      <FiGlobe className="text-blue-500" />
      <select
        className="bg-transparent text-sm text-gray-200 focus:outline-none cursor-pointer font-medium appearance-none"
        onChange={handleLanguageChange}
      >
        <option value="en" className="bg-gray-900">English</option>
        <option value="mr" className="bg-gray-900">मराठी</option>
        <option value="hi" className="bg-gray-900">हिंदी</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
