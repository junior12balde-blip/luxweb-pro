type LogoProps = {
  className?: string;
  variant?: "dark" | "light";
  showTagline?: boolean;
};

export default function Logo({
  className,
  variant = "dark",
  showTagline = true,
}: LogoProps) {
  const wordColor = variant === "light" ? "#FFFFFF" : "#0F1E57";
  const taglineColor = variant === "light" ? "#CBD8FF" : "#5B6B8C";

  return (
    <svg
      width="200"
      height="48"
      viewBox="0 0 220 56"
      className={className}
      role="img"
      aria-label="LuxWeb Pro"
    >
      <defs>
        <linearGradient id="lwp-icon-gradient-inline" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1857F5" />
          <stop offset="100%" stopColor="#00C2A8" />
        </linearGradient>
      </defs>

      <rect x="0" y="4" width="48" height="48" rx="14" fill="url(#lwp-icon-gradient-inline)" />

      <path
        d="M15 16 L15 34 C15 36.2 16.8 38 19 38 L27 38"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M31 16 L37 22 L31 28"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.95"
      />
      <circle cx="33.5" cy="34.5" r="3.5" fill="#FFFFFF" />

      <text x="62" y="30" fontFamily="var(--font-inter), Arial, sans-serif" fontSize="22" fontWeight="700" fill={wordColor}>
        LuxWeb
      </text>
      <text x="152" y="30" fontFamily="var(--font-inter), Arial, sans-serif" fontSize="22" fontWeight="700" fill="#00A1DE">
        Pro
      </text>
      {showTagline && (
        <text
          x="62"
          y="44"
          fontFamily="var(--font-inter), Arial, sans-serif"
          fontSize="10"
          fontWeight="500"
          letterSpacing="1.5"
          fill={taglineColor}
        >
          LUXEMBOURG
        </text>
      )}
    </svg>
  );
}
