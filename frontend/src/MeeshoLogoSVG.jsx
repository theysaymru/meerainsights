/* Local SVG placeholder — place the actual uploaded logo at frontend/src/assets/logo.png
   and swap <MeeshoLogoSVG> for <img src={logo} alt="Meesho logo"> in Header.jsx */
export default function MeeshoLogoSVG({ className = 'w-10 h-10' }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Meesho logo"
    >
      <rect width="200" height="200" rx="44" fill="#5c0968" />
      {/* Two-arch lowercase m shape in Meesho orange */}
      <path
        d="M 34 158 L 34 94 Q 34 50 70 50 Q 92 50 100 74 Q 108 50 130 50 Q 166 50 166 94 L 166 158"
        stroke="#f97316"
        strokeWidth="26"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="100"
        y="188"
        textAnchor="middle"
        fill="white"
        fontSize="21"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontWeight="300"
        letterSpacing="6"
      >
        meesho
      </text>
    </svg>
  );
}
