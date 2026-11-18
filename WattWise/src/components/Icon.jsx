/**
 * Icon set. Every path below is the exact geometry exported from the WattWise
 * Figma file; only the stroke colour is parameterised (to `currentColor`) so a
 * single icon can carry the active/inactive colours the design itself uses.
 */

const ICONS = {
  // Sidebar + chrome icons — 20x20, 1.7 stroke
  grid: {
    size: 20,
    paths: [
      'M3.33333 2.5H7.5C7.96024 2.5 8.33333 2.8731 8.33333 3.33333V7.5C8.33333 7.96024 7.96024 8.33333 7.5 8.33333H3.33333C2.8731 8.33333 2.5 7.96024 2.5 7.5V3.33333C2.5 2.8731 2.8731 2.5 3.33333 2.5Z',
      'M12.5 2.5H16.6667C17.1269 2.5 17.5 2.8731 17.5 3.33333V7.5C17.5 7.96024 17.1269 8.33333 16.6667 8.33333H12.5C12.0398 8.33333 11.6667 7.96024 11.6667 7.5V3.33333C11.6667 2.8731 12.0398 2.5 12.5 2.5Z',
      'M3.33333 11.6667H7.5C7.96024 11.6667 8.33333 12.0398 8.33333 12.5V16.6667C8.33333 17.1269 7.96024 17.5 7.5 17.5H3.33333C2.8731 17.5 2.5 17.1269 2.5 16.6667V12.5C2.5 12.0398 2.8731 11.6667 3.33333 11.6667Z',
      'M12.5 11.6667H16.6667C17.1269 11.6667 17.5 12.0398 17.5 12.5V16.6667C17.5 17.1269 17.1269 17.5 16.6667 17.5H12.5C12.0398 17.5 11.6667 17.1269 11.6667 16.6667V12.5C11.6667 12.0398 12.0398 11.6667 12.5 11.6667Z',
    ],
  },
  device: {
    size: 20,
    paths: [
      'M5.83333 2.5H14.1667C15.0871 2.5 15.8333 3.24619 15.8333 4.16667V15.8333C15.8333 16.7538 15.0871 17.5 14.1667 17.5H5.83333C4.91286 17.5 4.16667 16.7538 4.16667 15.8333V4.16667C4.16667 3.24619 4.91286 2.5 5.83333 2.5Z',
      'M4.16667 8.33333H15.8333M7.5 5V5.83333M7.5 10.8333V13.3333',
    ],
  },
  battery: {
    size: 20,
    paths: [
      'M3.33333 5H15C15.9205 5 16.6667 5.74619 16.6667 6.66667V13.3333C16.6667 14.2538 15.9205 15 15 15H3.33333C2.41286 15 1.66667 14.2538 1.66667 13.3333V6.66667C1.66667 5.74619 2.41286 5 3.33333 5Z',
      'M19.1667 8.33333V11.6667M5 8.33333V11.6667M8.33333 8.33333V11.6667M11.6667 8.33333V11.6667',
    ],
  },
  plan: {
    size: 20,
    paths: [
      'M16.6667 6.66667L11.6667 1.66667H5C4.55797 1.66667 4.13405 1.84226 3.82149 2.15482C3.50893 2.46738 3.33333 2.89131 3.33333 3.33333V16.6667C3.33333 17.1087 3.50893 17.5326 3.82149 17.8452C4.13405 18.1577 4.55797 18.3333 5 18.3333H15C15.442 18.3333 15.8659 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V6.66667ZM11.6667 1.66667V6.66667H16.6667M6.66667 10.8333H13.3333M6.66667 14.1667H10.8333',
    ],
  },
  help: {
    size: 20,
    paths: [
      'M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z',
      'M7.91667 7.5C7.91667 7.14488 8.00744 6.79566 8.18037 6.48549C8.3533 6.17532 8.60264 5.91451 8.90473 5.72781C9.20681 5.54111 9.5516 5.43473 9.90636 5.41877C10.2611 5.40281 10.6141 5.4778 10.9317 5.63661C11.2493 5.79542 11.5211 6.03279 11.7212 6.32618C11.9213 6.61956 12.043 6.95922 12.0749 7.3129C12.1068 7.66659 12.0478 8.02255 11.9034 8.347C11.759 8.67144 11.5341 8.9536 11.25 9.16667C10.4167 9.75 10 10 10 10.8333M10 14.1667H10.0083',
    ],
  },
  signout: {
    size: 20,
    paths: [
      'M7.5 3.33333H3.33333V16.6667H7.5M10.8333 5.83333L15 10L10.8333 14.1667M6.66667 10H16.6667',
    ],
  },
  chevron: {
    size: 20,
    paths: ['M6.66667 8.33333L10 11.6667L13.3333 8.33333'],
  },
  bell: {
    size: 20,
    paths: [
      'M8.33333 17.5H11.6667M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13113C12.5979 2.19345 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19345 6.46447 3.13113C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 12.5 2.5 14.1667H17.5C17.5 12.5 15 12.5 15 6.66667Z',
    ],
  },
  // Composed from the two vectors the Figma profile frame uses: a 15.5px head
  // ring and a 23.5x9.5 shoulder arc, kept at their exact relative positions.
  // The viewBox is square and oversized so neither stroke clips, and the stroke
  // scales to ~1.7 at 20px to match the rest of the sidebar set.
  profile: {
    size: 20,
    viewBox: '0 0 25 25',
    strokeWidth: 2.1,
    linecap: 'round',
    paths: [
      'M19.78 9.35C19.78 13.216 16.646 16.35 12.78 16.35C8.914 16.35 5.78 13.216 5.78 9.35C5.78 5.484 8.914 2.35 12.78 2.35C16.646 2.35 19.78 5.484 19.78 9.35Z',
      'M1.75 21.25C1.75 19.128 2.909 17.093 4.972 15.593C7.035 14.093 9.833 13.25 12.75 13.25C15.667 13.25 18.465 14.093 20.528 15.593C22.591 17.093 23.75 19.128 23.75 21.25',
    ],
  },

  // Logo bolt — 21x21, 1.7 stroke
  bolt: {
    size: 21,
    paths: ['M11.375 1.75L3.5 12.25H9.625L8.75 19.25L17.5 7.875H11.375V1.75Z'],
  },

  // Landing feature icons — native sizes, 2 stroke
  featOverview: {
    size: 22,
    strokeWidth: 2,
    paths: [
      'M11 1C9.02219 1 7.08878 1.58649 5.44429 2.6853C3.7998 3.78412 2.51808 5.34596 1.7612 7.17322C1.00432 9.00048 0.806303 11.0111 1.19216 12.9509C1.57801 14.8907 2.5304 16.6725 3.92893 18.071C5.32745 19.4696 7.10929 20.422 9.0491 20.8079C10.9889 21.1937 12.9996 20.9956 14.8268 20.2388C16.6541 19.4819 18.2159 18.2002 19.3147 16.5557C20.4135 14.9112 21 12.9778 21 11H11V1Z',
    ],
  },
  featCalculator: {
    width: 18,
    height: 22,
    strokeWidth: 2,
    viewBox: '0 0 18 22',
    paths: ['M5 6H13M5 13H13M1 1H17V21H1V1Z'],
  },
  featRanking: {
    width: 19,
    height: 21,
    strokeWidth: 3,
    viewBox: '0 0 19 21',
    paths: ['M1.5 19.5V11.5M9.5 19.5V1.5M17.5 19.5V7.5'],
  },
  featPriority: {
    width: 20,
    height: 14,
    strokeWidth: 2,
    viewBox: '0 0 20 14',
    paths: ['M1 1H19M1 7H13M1 13H7'],
  },
  featBudget: {
    width: 18,
    height: 20,
    strokeWidth: 2,
    viewBox: '0 0 18 20',
    paths: [
      'M7 19H11M1 15H17L15 12V7C15 5.4087 14.3678 3.88254 13.2426 2.75732C12.1174 1.63211 10.5913 1 9 1C7.4087 1 5.88261 1.63211 4.75739 2.75732C3.63217 3.88254 3 5.4087 3 7V12L1 15Z',
    ],
  },
  featPlan: {
    width: 16,
    height: 22,
    strokeWidth: 2,
    viewBox: '0 0 16 22',
    paths: ['M5 13H13M5 17H10M1 1H10L15 6V21H1V1Z'],
  },

  // Utility
  check: {
    width: 14,
    height: 11,
    strokeWidth: 2,
    viewBox: '0 0 14 11',
    paths: ['M1 6.00001L5 10L13 1.00001'],
  },
  batteryWide: {
    width: 24,
    height: 14,
    strokeWidth: 2,
    viewBox: '0 0 24 14',
    linecap: 'butt',
    paths: [
      'M4 1H20C21.6569 1 23 2.34315 23 4V10C23 11.6569 21.6569 13 20 13H4C2.34315 13 1 11.6569 1 10V4C1 2.34315 2.34315 1 4 1Z',
    ],
  },
  doc: {
    width: 13,
    height: 15,
    strokeWidth: 1.6,
    viewBox: '0 0 12.6 14.6',
    paths: ['M0.8 0.8H7.8L11.8 4.8V13.8H0.8V0.8Z'],
  },
  menu: {
    size: 22,
    strokeWidth: 2,
    viewBox: '0 0 22 22',
    paths: ['M3 6H19M3 11H19M3 16H19'],
  },
  close: {
    size: 22,
    strokeWidth: 2,
    viewBox: '0 0 22 22',
    paths: ['M5 5L17 17M17 5L5 17'],
  },
};

export default function Icon({ name, size, className = '', ...rest }) {
  const def = ICONS[name];
  if (!def) return null;

  const w = def.width ?? def.size;
  const h = def.height ?? def.size;
  const viewBox = def.viewBox ?? `0 0 ${w} ${h}`;
  const scale = size ? size / Math.max(w, h) : 1;

  return (
    <svg
      className={`icon ${className}`.trim()}
      width={w * scale}
      height={h * scale}
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {def.paths.map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth={def.strokeWidth ?? 1.7}
          strokeLinecap={def.linecap ?? 'round'}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
