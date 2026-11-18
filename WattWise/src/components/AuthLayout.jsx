import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

const BENEFITS = [
  'Estimate battery runtime and energy use',
  'Rank devices and set priorities from 1 to 5',
  'Download an emergency plan for offline use',
];

export default function AuthLayout({ eyebrow, headline, highlight, intro, children }) {
  return (
    <div className="auth">
      <section className="auth__aside">
        <Logo size="md" tone="light" />

        <div className="auth__pitch">
          <p className="auth__eyebrow">{eyebrow}</p>
          <h1 className="auth__headline">
            {headline}
            <span className="auth__headline-accent">{highlight}</span>
          </h1>
          <p className="auth__intro">{intro}</p>

          <ul className="auth__benefits">
            {BENEFITS.map((benefit) => (
              <li key={benefit}>
                <span className="auth__check" aria-hidden="true">
                  <Icon name="check" size={13} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth__sdg">
          <span className="auth__sdg-dot" aria-hidden="true" />
          UN SDG 7 · Affordable and Clean Energy
        </p>

        <div className="auth__rings" aria-hidden="true" />
      </section>

      <section className="auth__panel">
        <div className="auth__panel-inner">{children}</div>
      </section>
    </div>
  );
}

export function AuthTabs({ active }) {
  return (
    <div className="auth-tabs" role="tablist" aria-label="Account">
      <a
        className={`auth-tabs__item${active === 'signup' ? ' is-active' : ''}`}
        href="#/signup"
        role="tab"
        aria-selected={active === 'signup'}
      >
        Create account
      </a>
      <a
        className={`auth-tabs__item${active === 'signin' ? ' is-active' : ''}`}
        href="#/signin"
        role="tab"
        aria-selected={active === 'signin'}
      >
        Sign in
      </a>
    </div>
  );
}
