import AnimatedNumber from '../components/AnimatedNumber.jsx';
import GridPanel from '../components/GridPanel.jsx';
import { useWorkspace } from '../context/useWorkspace.js';
import { useToast } from '../lib/toast.js';
import {
  deviceWatts,
  formatHoursMinutes,
  formatWholeHours,
  priorityLabel,
} from '../lib/energy.js';

export default function Budget() {
  const { energy, targetHours, setTargetHours, applyEssentialOnlyPlan, restoreDevices } =
    useWorkspace();
  const toast = useToast();

  const total = energy.neededKWh || 1;
  const essentialPct = (energy.essentialAllocationKWh / total) * 100;
  const optionalPct = (energy.optionalAllocationKWh / total) * 100;
  const overPct = (energy.overBudgetKWh / total) * 100;

  const shortfallHours = Math.round(energy.hoursBelowTarget);
  const beyondHours = Math.round(energy.hoursBeyondTarget);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">PLAN AHEAD. STAY POWERED.</p>
          <h1 className="page-title">Energy budget</h1>
          <p className="page-sub">
            Balance your available energy with the services your community needs.
          </p>
        </div>
        <a className="btn btn--ghost" href="#/plan">
          View emergency plan&nbsp;&nbsp;→
        </a>
      </div>

      <section className="card target">
        <div>
          <h2 className="card__title card__title--sm">
            How long do you need backup power?
          </h2>
          <p className="card__sub">
            Set a target to see whether your current devices fit your budget.
          </p>
        </div>
        <div className="target__controls">
          {/* Slider for quick exploration, stepper for exact values — the
              slider is the fast way to see the shortfall move, the +/- keeps
              it precise. Both write to the same state. */}
          <input
            type="range"
            className="slider"
            min="1"
            max="24"
            step="1"
            value={targetHours}
            aria-label="Hours of backup power needed"
            onChange={(event) => setTargetHours(Number(event.target.value))}
          />
          <div className="stepper">
            <span className="stepper__value">{targetHours}</span>
            <span className="stepper__unit">hours</span>
            <button
              type="button"
              className="stepper__btn"
              onClick={() => setTargetHours(targetHours - 1)}
              aria-label="Decrease target by one hour"
            >
              −
            </button>
            <button
              type="button"
              className="stepper__btn"
              onClick={() => setTargetHours(targetHours + 1)}
              aria-label="Increase target by one hour"
            >
              +
            </button>
          </div>
        </div>
      </section>

      <div className="budget-stats">
        <article className="card card--green stat stat--wide">
          <p className="stat__label">Available energy</p>
          <p className="stat__value stat__value--inline">
            <AnimatedNumber value={energy.availableKWh} decimals={1} /> kWh
          </p>
          <p className="stat__foot">{Math.round(energy.chargePercent)}% battery remaining</p>
        </article>

        <article className="card stat stat--wide">
          <p className="stat__label">Energy needed for {targetHours}h</p>
          <p className="stat__value stat__value--inline">
            <AnimatedNumber value={energy.neededKWh} decimals={1} /> kWh
          </p>
          <p className="stat__foot">
            At your current {energy.totalKW.toFixed(2)} kW load
          </p>
        </article>

        <article
          className={`card stat stat--wide ${
            energy.withinBudget ? 'card--tint' : 'card--amber'
          }`}
        >
          <p className="stat__label">
            {energy.withinBudget ? 'Energy to spare' : 'Energy shortfall'}
          </p>
          <p className="stat__value stat__value--inline">
            <AnimatedNumber
              value={Math.abs(energy.availableKWh - energy.neededKWh)}
              decimals={1}
            />{' '}
            kWh
          </p>
          <p className={`stat__foot${energy.withinBudget ? '' : ' stat__foot--amber'}`}>
            {energy.withinBudget
              ? `${beyondHours} hours beyond your target`
              : `${shortfallHours} ${shortfallHours === 1 ? 'hour' : 'hours'} below your target`}
          </p>
        </article>
      </div>

      <div className="budget-grid">
        <section className="card card--pad">
          <h2 className="card__title card__title--lg">
            Your {targetHours}-hour energy plan
          </h2>
          <p className={energy.withinBudget ? 'card__sub card__sub--green' : 'card__sub card__sub--amber'}>
            {energy.withinBudget
              ? 'Your current devices fit inside the energy available.'
              : 'Current load exceeds the energy available.'}
          </p>

          <div className="alloc">
            <div className="alloc__scale">
              <span className="alloc__scale-strong">
                {energy.availableKWh.toFixed(1)} kWh available
              </span>
              <span>{energy.neededKWh.toFixed(1)} kWh needed</span>
            </div>

            <div className="alloc__bar">
              <div className="alloc__seg alloc__seg--essential" style={{ width: `${essentialPct}%` }}>
                <span>{energy.essentialAllocationKWh.toFixed(1)} kWh</span>
              </div>
              <div className="alloc__seg alloc__seg--optional" style={{ width: `${optionalPct}%` }}>
                <span>{energy.optionalAllocationKWh.toFixed(1)} kWh</span>
              </div>
              {overPct > 0 && (
                <div className="alloc__seg alloc__seg--over" style={{ width: `${overPct}%` }}>
                  <span>{energy.overBudgetKWh.toFixed(1)}</span>
                </div>
              )}
            </div>

            <ul className="alloc__legend">
              <li>
                <span className="legend__swatch legend__swatch--sq alloc__key--essential" />
                Essential
              </li>
              <li>
                <span className="legend__swatch legend__swatch--sq alloc__key--optional" />
                Lower priority
              </li>
              <li>
                <span className="legend__swatch legend__swatch--sq alloc__key--over" />
                Over budget
              </li>
            </ul>
          </div>

          <div className="alloc__rule" />

          <div className="alloc__summary">
            <span className="alloc__summary-label">With essential devices only</span>
            <span className="alloc__summary-value">
              {formatWholeHours(energy.essentialRuntimeHours)}
            </span>
          </div>
          <p className="card__note">
            {energy.availableKWh.toFixed(1)} kWh ÷ {energy.essentialKW.toFixed(2)} kW ·{' '}
            {beyondHours} hours beyond your target
          </p>
        </section>

        <section className="card card--pad">
          <h2 className="card__title card__title--lg">Keep what matters running</h2>
          <p className="card__sub">Consider turning off these lower-priority devices.</p>

          <ul className="suggest">
            {energy.optionalDevices
              .slice()
              .sort((a, b) => deviceWatts(b) - deviceWatts(a))
              .map((device) => (
                <li key={device.id} className="suggest__row">
                  <div>
                    <p className="suggest__name">{device.name}</p>
                    <p className="suggest__meta">{priorityLabel(device.priority)}</p>
                  </div>
                  <span className="suggest__watts">{deviceWatts(device)} W</span>
                </li>
              ))}
            {energy.optionalDevices.length === 0 && (
              <li className="suggest__empty">
                Every device is marked essential — nothing left to switch off.
              </li>
            )}
          </ul>

          {energy.optionalDevices.length > 0 && (
            <>
              <p className="card__note card__note--green">
                Reduce draw by {energy.optionalKW.toFixed(2)} kW. Gain{' '}
                {Math.round(energy.gainedHours)} hours.
              </p>
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={() => {
                  const removed = energy.optionalDevices;
                  applyEssentialOnlyPlan();
                  toast.success(
                    `Switched off ${removed.length} lower-priority ${
                      removed.length === 1 ? 'device' : 'devices'
                    }.`,
                    {
                      action: {
                        label: 'Undo',
                        onClick: () => restoreDevices(removed),
                      },
                    },
                  );
                }}
              >
                Use essential-only plan&nbsp;&nbsp;→
              </button>
            </>
          )}
        </section>
      </div>

      <section className="callout">
        <span className="callout__bang" aria-hidden="true">
          !
        </span>
        <div>
          <h2 className="callout__title">When to seek more power</h2>
          <p className="callout__text">
            If priority 1 devices cannot meet your target, reducing optional loads is not
            enough.
          </p>
          <p className="callout__text">
            Arrange additional battery capacity or contact your venue&rsquo;s emergency
            lead before supplies run low.
          </p>
          <p className="callout__strong">
            Your current priority 1 load is {energy.criticalKW.toFixed(2)} kW — enough for
            approximately {formatHoursMinutes(energy.criticalRuntimeHours)}.
          </p>
        </div>
      </section>

      <GridPanel />

      <p className="footnote">
        Illustrative estimates only. Confirm critical requirements and equipment ratings
        with your venue&rsquo;s responsible staff.
      </p>
    </>
  );
}
