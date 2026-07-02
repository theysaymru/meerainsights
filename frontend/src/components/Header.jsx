import { useState } from 'react';
import MeeshoLogoSVG from '../MeeshoLogoSVG';
import LanguageSwitcher from './LanguageSwitcher';

// Place your logo at: frontend/src/assets/logo.png
let realLogo = null;
try {
  realLogo = new URL('../assets/logo.png.png', import.meta.url).href;
} catch {
  realLogo = null;
}

export default function Header({ language, onLanguageChange, t, onHome }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showRealLogo = realLogo && !imgFailed;

  return (
    <header className="bg-meesho-purple shadow-lg sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <button onClick={onHome} className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity cursor-pointer">
          {showRealLogo ? (
            <img
              src={realLogo}
              alt="Meesho"
              className="w-10 h-10 flex-shrink-0 rounded-xl ring-2 ring-meesho-orange/40 object-contain"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <MeeshoLogoSVG className="w-10 h-10 flex-shrink-0 rounded-xl ring-2 ring-meesho-orange/40" />
          )}
          <div className="min-w-0">
            <h1 className="text-white font-bold text-lg sm:text-xl leading-tight truncate">
              {t.appName}
            </h1>
            <p className="text-purple-300 text-xs font-medium">{t.byMeesho}</p>
          </div>
        </button>
        <LanguageSwitcher language={language} onChange={onLanguageChange} t={t} />
      </div>
    </header>
  );
}
