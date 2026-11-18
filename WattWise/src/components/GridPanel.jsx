import { useCallback, useEffect, useRef, useState } from 'react';
import AnimatedNumber from './AnimatedNumber.jsx';
import { useWorkspace } from '../context/useWorkspace.js';
import {
  carbonAvoided,
  chargingAdvice,
  fetchGridSnapshot,
} from '../lib/carbonIntensity.js';

const REFRESH_MS = 5 * 60 * 1000; // the API publishes a new half-hourly period

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Live UK grid data (National Grid ESO), fetched straight from the browser.
 *
 * Every state is handled explicitly — loading, loaded, empty and failed — so a
 * flaky connection degrades to a clear message and a Retry button rather than
 * an empty card. The rest of the page never depends on this request.
 */
export default function GridPanel() {
  const { energy } = useWorkspace();
  const [status, setStatus] = useState('loading');
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setStatus('loading');
    try {
      const next = await fetchGridSnapshot();
      if (!mounted.current) return;
      setSnapshot(next);
      setError(null);
      setStatus('ready');
    } catch (caught) {
      if (!mounted.current) return;
      setError(
        caught.name === 'AbortError'
          ? 'The grid data service took too long to respond.'
          : 'Could not reach the grid data service.',
      );
      setStatus((current) => (current === 'ready' ? 'ready' : 'error'));
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    // Fetching from a third-party API is exactly the "synchronising with an
    // external system" case an effect is for; the state updates happen after
    // the await, not synchronously during the effect.
    // eslint-disable-next-line react/set-state-in-effect
    load({ quiet: true });
    const timer = setInterval(() => load({ quiet: true }), REFRESH_MS);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [load]);

  const advice = chargingAdvice(snapshot, { chargePercent: energy.chargePercent });
  const avoided = carbonAvoided(snapshot, energy.availableKWh);

  return (
    <section className="card card--pad grid-panel">
      <div className="card__head">
        <div>
          <h2 className="card__title card__title--lg">Grid right now</h2>
          <p className="card__sub">
            Live carbon intensity for Great Britain · National Grid ESO
          </p>
        </div>
        <div className="grid-panel__head-actions">
          {status === 'ready' && snapshot && (
            <span className={`chip chip--intensity is-${snapshot.index.replace(' ', '-')}`}>
              {snapshot.index.toUpperCase()}
            </span>
          )}
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => load()}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {status === 'loading' && !snapshot && (
        <div className="grid-panel__skeleton" aria-hidden="true">
          <span className="skeleton skeleton--value" />
          <span className="skeleton skeleton--bar" />
          <span className="skeleton skeleton--line" />
          <span className="skeleton skeleton--line skeleton--short" />
        </div>
      )}

      {status === 'error' && !snapshot && (
        <div className="grid-panel__error" role="alert">
          <p className="grid-panel__error-title">{error}</p>
          <p className="grid-panel__error-text">
            Your battery figures and emergency plan are unaffected — they are
            calculated on this device and do not need the internet.
          </p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => load()}>
            Try again
          </button>
        </div>
      )}

      {snapshot && (
        <>
          {error && (
            <p className="grid-panel__stale" role="status">
              Showing the last reading — {error}
            </p>
          )}

          <div className="grid-panel__figures">
            <div className="grid-panel__figure">
              <span className="grid-panel__value">
                <AnimatedNumber value={snapshot.gramsPerKWh} />
                <span className="grid-panel__unit">gCO₂/kWh</span>
              </span>
              <span className="grid-panel__caption">
                Grid carbon intensity · {formatTime(snapshot.from)}–{formatTime(snapshot.to)}
              </span>
            </div>
            <div className="grid-panel__figure">
              <span className="grid-panel__value grid-panel__value--green">
                <AnimatedNumber value={snapshot.renewablePercent} decimals={1} />
                <span className="grid-panel__unit">% renewable</span>
              </span>
              <span className="grid-panel__caption">
                {snapshot.lowCarbonPercent}% low carbon including nuclear
              </span>
            </div>
          </div>

          <div className="mix" role="img" aria-label="Generation mix by fuel">
            {snapshot.mix.map((entry) => (
              <span
                key={entry.fuel}
                className="mix__seg"
                style={{ width: `${entry.percent}%`, background: entry.colour }}
                title={`${entry.label} ${entry.percent}%`}
              />
            ))}
          </div>

          <ul className="mix__legend">
            {snapshot.mix.slice(0, 5).map((entry) => (
              <li key={entry.fuel}>
                <span className="legend__swatch" style={{ background: entry.colour }} />
                {entry.label}
                <strong>{entry.percent}%</strong>
              </li>
            ))}
          </ul>

          {advice && (
            <div className={`advice advice--${advice.tone}`}>
              <p className="advice__title">{advice.headline}</p>
              <p className="advice__text">{advice.detail}</p>
            </div>
          )}

          {avoided && (
            <p className="card__note">
              Running on your {energy.availableKWh.toFixed(1)} kWh of stored power instead
              of the grid at this intensity avoids about{' '}
              <strong>{avoided.kilograms.toFixed(1)} kg of CO₂</strong>.
            </p>
          )}
        </>
      )}
    </section>
  );
}
