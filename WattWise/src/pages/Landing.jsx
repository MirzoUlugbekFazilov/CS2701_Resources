import Icon from '../components/Icon.jsx';
import Logo from '../components/Logo.jsx';

const STEPS = [
  {
    title: 'Add your devices',
    text: "Enter each device's wattage, usage and a priority from 1 to 5.",
  },
  {
    title: 'See your overview',
    text: 'Track total usage, device count and the time your battery lasts.',
  },
  {
    title: 'Set priorities',
    text: 'Compare essentials against your available power and spot the gaps.',
  },
  {
    title: 'Prepare your plan',
    text: 'Download an emergency plan to follow offline during an outage.',
  },
];

const FEATURES = [
  {
    icon: 'featOverview',
    title: 'Energy overview',
    text: 'See energy use by appliance, total usage, device count and time remaining.',
  },
  {
    icon: 'featCalculator',
    title: 'Energy calculator',
    text: 'Estimate consumption from wattage and hours, and how long a device can run.',
  },
  {
    icon: 'featRanking',
    title: 'Device ranking',
    text: 'Add devices, then sort by highest or lowest consumption in one click.',
  },
  {
    icon: 'featPriority',
    title: 'Priority planner',
    text: 'Mark essential devices 1–5 and compare them against the electricity available.',
  },
  {
    icon: 'featBudget',
    title: 'Budget warnings',
    text: "Get alerted when you're nearly over budget and told what to switch off.",
  },
  {
    icon: 'featPlan',
    title: 'Emergency plan',
    text: 'View and download your plan, with contacts, for offline use if the site is unavailable.',
  },
];

const VENUES = [
  {
    title: 'Community centres',
    text: 'Keep lighting, heating and communications running.',
  },
  { title: 'Event halls', text: 'Protect sound, power and safety systems for guests.' },
  { title: 'Hospitals', text: 'Prioritise life-critical equipment during outages.' },
];

const STAYS_ON = [
  { priority: 'P1', name: 'Essential lighting', state: 'On' },
  { priority: 'P1', name: 'Cold storage', state: 'On' },
  { priority: 'P2', name: 'Communications', state: 'On' },
  { priority: 'P4', name: 'Café equipment', state: 'Switch off' },
];

/**
 * In-page section links. The app routes on the hash, so these scroll directly
 * rather than writing `#features` into the URL.
 */
function SectionLink({ target, children }) {
  const scrollTo = (event) => {
    event.preventDefault();
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <button type="button" className="landing__link" onClick={scrollTo}>
      {children}
    </button>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing__nav">
        <div className="landing__container landing__nav-inner">
          <Logo size="md" />
          <nav className="landing__links" aria-label="Sections">
            <SectionLink target="features">Features</SectionLink>
            <SectionLink target="how-it-works">How it works</SectionLink>
            <SectionLink target="who-its-for">Who it&rsquo;s for</SectionLink>
          </nav>
          <div className="landing__nav-actions">
            <a className="landing__signin" href="#/signin">
              Sign in
            </a>
            <a className="btn btn--primary btn--sm" href="#/signup">
              Get started
            </a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="landing__container hero__inner">
          <div className="hero__copy">
            <p className="pill">
              <span className="pill__dot" aria-hidden="true" />
              RESILIENT ENERGY. STRONGER COMMUNITIES.
            </p>
            <h1 className="hero__title">
              Keep the lights on.
              <br />
              Keep your community going.
            </h1>
            <p className="hero__text">
              WattWise helps community venues see their available energy, rank what each
              device uses and decide what must stay on when the power drops.
            </p>
            <div className="hero__actions">
              <a className="btn btn--primary btn--lg" href="#/signup">
                Create free account
              </a>
              <a className="btn btn--ghost btn--lg" href="#/signin">
                Sign in
              </a>
            </div>
            <ul className="hero__points">
              <li>
                <Icon name="check" size={13} className="hero__check" />
                Built for community centres, event halls and hospitals
              </li>
              <li>
                <Icon name="check" size={13} className="hero__check" />
                Works on desktop, tablet and mobile screens
              </li>
            </ul>
          </div>

          <div className="hero__visual">
            <div className="hero__panel">
              <p className="hero__panel-eyebrow">YOUR COMMUNITY, CONNECTED</p>

              <div className="hero__tiles">
                <div className="hero__tile">
                  <Icon name="batteryWide" className="hero__tile-icon" />
                  <p className="hero__tile-value">12.8 kWh</p>
                  <p className="hero__tile-caption">ready when you need it</p>
                </div>
                <div className="hero__tile">
                  <p className="hero__tile-value hero__tile-value--sm">6h 40m</p>
                  <p className="hero__tile-caption">estimated runtime</p>
                </div>
              </div>

              <div className="hero__battery">
                <div className="hero__battery-row">
                  <span>Backup battery</span>
                  <strong>64%</strong>
                </div>
                <div className="meter meter--on-dark">
                  <div className="meter__fill" style={{ width: '64%' }} />
                </div>
              </div>

              <p className="hero__panel-eyebrow hero__panel-eyebrow--soft">WHAT STAYS ON</p>
              <ul className="hero__list">
                {STAYS_ON.map((row) => (
                  <li key={row.name} className="hero__list-row">
                    <span className="hero__pri">{row.priority}</span>
                    <span className="hero__list-name">{row.name}</span>
                    {row.state === 'On' ? (
                      <span className="hero__state">
                        <span className="hero__state-dot" aria-hidden="true" />
                        On
                      </span>
                    ) : (
                      <span className="hero__switch">Switch off</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hero__alert">
              <span className="hero__alert-bang" aria-hidden="true">
                !
              </span>
              <div>
                <p className="hero__alert-title">Almost over budget</p>
                <p className="hero__alert-text">Switch off 1 device to gain 1h 20m</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="landing__container band__inner">
          <h2 className="band__title">
            When the power drops,
            <br />
            <span className="band__accent">every watt has to count.</span>
          </h2>
          <p className="band__text">
            Community venues on batteries or renewable power must decide fast which
            services stay on. Without a clear plan, essential services like lighting, cold
            storage and communications can be lost.
          </p>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="landing__container">
          <p className="eyebrow eyebrow--green">HOW IT WORKS</p>
          <h2 className="section__title">From device list to outage plan in four steps</h2>
          <div className="steps-grid">
            {STEPS.map((step, index) => (
              <article key={step.title} className="step-card">
                <span className="step-card__num">{index + 1}</span>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__text">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="landing__container">
          <p className="eyebrow eyebrow--green">FEATURES</p>
          <h2 className="section__title">Everything a venue needs to ride out an outage</h2>
          <div className="feature-grid">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="feature-card">
                <span className="feature-card__icon" aria-hidden="true">
                  <Icon name={feature.icon} size={20} />
                </span>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__text">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="who-its-for">
        <div className="landing__container">
          <div className="venues">
            <h2 className="venues__title">Built for the places people rely on</h2>
            <p className="venues__sub">
              For staff at venues that run on batteries or renewable energy.
            </p>
            <div className="venues__grid">
              {VENUES.map((venue) => (
                <article key={venue.title} className="venue-card">
                  <h3 className="venue-card__title">{venue.title}</h3>
                  <p className="venue-card__text">{venue.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="landing__container">
          <div className="cta">
            <div>
              <h2 className="cta__title">Ready to plan for the next outage?</h2>
              <p className="cta__text">
                Create a free account and build your venue&rsquo;s energy plan.
              </p>
            </div>
            <div className="cta__actions">
              <a className="btn btn--dark" href="#/signup">
                Create account
              </a>
              <a className="btn btn--white" href="#/signin">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__container landing__footer-inner">
          <Logo size="md" />
          <nav className="landing__links" aria-label="Footer">
            <SectionLink target="how-it-works">How it works</SectionLink>
            <SectionLink target="features">Features</SectionLink>
            <a className="landing__link" href="#/signin">
              Sign in
            </a>
          </nav>
        </div>
        <div className="landing__container">
          <p className="landing__copy">
            © 2026 WattWise · Group B7 · Supporting UN SDG 7: Affordable and Clean Energy
          </p>
        </div>
      </footer>
    </div>
  );
}
