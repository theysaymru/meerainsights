const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'HI', name: 'हिंदी' },
  { code: 'te', label: 'TE', name: 'తెలుగు' },
  { code: 'mr', label: 'MR', name: 'मराठी' },
  { code: 'bn', label: 'BN', name: 'বাংলা' },
];

export default function LanguageSwitcher({ language, onChange, t }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-purple-300 text-xs hidden sm:block font-medium">{t.language}</span>
      <select
        value={language}
        onChange={e => onChange(e.target.value)}
        className="bg-meesho-purple-mid text-white text-sm rounded-lg px-3 py-1.5 border border-purple-400 focus:outline-none focus:ring-2 focus:ring-meesho-pink cursor-pointer transition-colors hover:bg-meesho-purple"
        aria-label="Select language"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.label} — {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
