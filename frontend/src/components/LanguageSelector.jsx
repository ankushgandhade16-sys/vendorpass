import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ className = "" }) => {
  const { language, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'kn', name: 'ಕನ್ನಡ' }
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="w-4 h-4 text-slate-400" />
      <select 
        value={language} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer hover:text-slate-900 transition-colors outline-none"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white">
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
