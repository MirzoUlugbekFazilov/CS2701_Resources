import { useMemo, useState } from 'react';
import AnimatedNumber from '../components/AnimatedNumber.jsx';
import DonutChart from '../components/DonutChart.jsx';
import { useWorkspace } from '../context/useWorkspace.js';
import { navigate } from '../lib/router.js';
import {
  deviceWatts,
  formatPercent,
  formatWholeHours,
  isEssential,
  loadShare,
  priorityLabel,
} from '../lib/energy.js';

const COLUMNS = [
  { key: 'name', label: 'DEVICE', get: (d) => d.name.toLowerCase() },
  { key: 'power', label: 'POWER DRAW', get: (d) => deviceWatts(d), numeric: true },
  { key: 'priority', label: 'PRIORITY', get: (d) => d.priority, numeric: true },
  { key: 'use', label: 'EST. USE', get: (d) => deviceWatts(d), numeric: true },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'essential', label: 'Essential' },
  { id: 'optional', label: 'Lower priority' },
];

export default function Overview() {
  const { energy, devices } = useWorkspace();
  // Every column header is a sort control, not just the Power button.
  const [sort, setSort] = useState({ key: 'power', desc: true });
  const [filter, setFilter] = useState('all');
  const [activeSlice, setActiveSlice] = useState(null);

  const runtimeHours = Math.floor(energy.runtimeHours);
  const essentialHours = Math.floor(energy.essentialRuntimeHours);
  const slices = useMemo(() => loadShare(energy), [energy]);

  const sorted = useMemo(() => {
    const column = COLUMNS.find((c) => c.key === sort.key) ?? COLUMNS[1];
    return devices
      .filter((device) => {
        if (filter === 'essential') return isEssential(device);
        if (filter === 'optional') return !isEssential(device);
        return true;
      })
      .sort((a, b) => {
        const left = column.get(a);
        const right = column.get(b);
        const order = column.numeric
          ? left - right
          : String(left).localeCompare(String(right));
        return sort.desc ? -order : order;
      });
  }, [devices, filter, sort]);

  const toggleSort = (key) =>
    setSort((current) =>
      // First click on a new column sorts descending for numbers, ascending for
      // text — the order people expect from a spreadsheet.
      current.key === key
        ? { key, desc: !current.desc }
        : { key, desc: key !== 'name' },
    );

  // Runtime bars are scaled against the longer of the two scenarios.
  const barScale = Math.max(energy.essentialRuntimeHours, energy.runtimeHours) || 1;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">YOUR ENERGY AT A GLANCE</p>
          <h1 className="page-title">Energy overview</h1>
          <p className="page-sub">
            A clear picture of your power. A better plan for your community.
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/devices')}>
          +&nbsp;&nbsp;Add device
        </button>
      </div>

      {energy.deviceCount > 0 && (
        <div className="notice">
          <span className="notice__bang" aria-hidden="true">
            !
          </span>
          <div className="notice__body">
            <p className="notice__title">Planning for an outage?</p>
            <p className="notice__text">
              Your current load will last {formatWholeHours(energy.runtimeHours)}.
              Prioritising essential devices can extend this to{' '}
              {formatWholeHours(energy.essentialRuntimeHours)}.
            </p>
          </div>
          <a className="notice__action" href="#/budget">
            Review budget&nbsp;&nbsp;→
          </a>
        </div>
      )}

      <div className="stat-grid">
        <article className="card card--green stat">
          <p className="stat__label">Battery available</p>
          <p className="stat__value">
            <AnimatedNumber value={energy.availableKWh} decimals={1} />
            <span className="stat__unit">kWh</span>
          </p>
          <div className="meter meter--on-dark">
            <div
              className="meter__fill"
              style={{ width: `${Math.min(100, energy.chargePercent)}%` }}
            />
          </div>
          <p className="stat__foot">
            {Math.round(energy.chargePercent)}% of {energy.capacityKWh} kWh capacity
          </p>
        </article>

        <article className="card stat">
          <p className="stat__label">Current power draw</p>
          <p className="stat__value">
            <AnimatedNumber value={energy.totalKW} decimals={2} />
            <span className="stat__unit">kW</span>
          </p>
          <p className="stat__foot">
            {energy.deviceCount} {energy.deviceCount === 1 ? 'device' : 'devices'} in your
            workspace
          </p>
        </article>

        <article className="card stat">
          <p className="stat__label">Estimated runtime</p>
          <p className="stat__value">
            <AnimatedNumber value={runtimeHours} />
            <span className="stat__unit">hours</span>
          </p>
          <p className="stat__foot">At the current power draw</p>
        </article>

        <article className="card stat">
          <p className="stat__label">Essential devices</p>
          <p className="stat__value">
            <AnimatedNumber value={energy.essentialCount} />
            <span className="stat__unit">of {energy.deviceCount}</span>
          </p>
          <p className="stat__foot">
            Priority 1–2 · {energy.essentialKW.toFixed(2)} kW
          </p>
        </article>
      </div>

      <div className="panel-grid">
        <section className="card card--pad">
          <h2 className="card__title">Where your energy goes</h2>
          <p className="card__sub">Share of current power draw</p>

          <div className="share">
            <DonutChart
              title="Share of current power draw by device"
              slices={slices}
              activeId={activeSlice}
              centerValue={
                activeSlice
                  ? formatPercent(
                      slices.find((s) => s.id === activeSlice)?.percent ?? 0,
                    )
                  : energy.totalKW.toFixed(2)
              }
              centerLabel={
                activeSlice
                  ? slices.find((s) => s.id === activeSlice)?.label
                  : 'kW total'
              }
            />
            <ul className="legend">
              {slices.map((slice) => (
                <li key={slice.id}>
                  {/* Hovering or focusing a legend row highlights its segment
                      and swaps the centre figure to that slice's share. */}
                  <button
                    type="button"
                    className={`legend__row${activeSlice === slice.id ? ' is-active' : ''}`}
                    onMouseEnter={() => setActiveSlice(slice.id)}
                    onMouseLeave={() => setActiveSlice(null)}
                    onFocus={() => setActiveSlice(slice.id)}
                    onBlur={() => setActiveSlice(null)}
                    onClick={() =>
                      setActiveSlice((current) => (current === slice.id ? null : slice.id))
                    }
                  >
                    <span
                      className="legend__swatch"
                      style={{ background: slice.color }}
                      aria-hidden="true"
                    />
                    <span className="legend__label">{slice.label}</span>
                    <span className="legend__value">{formatPercent(slice.percent)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card card--pad">
          <div className="card__head">
            <h2 className="card__title">Make your energy last longer</h2>
            <span className="chip chip--tint">ESTIMATE</span>
          </div>

          <div className="runtime">
            <div className="runtime__row">
              <span className="runtime__label">Current load</span>
              <span className="runtime__value">{formatWholeHours(energy.runtimeHours)}</span>
            </div>
            <div className="bar">
              <div
                className="bar__fill bar__fill--soft"
                style={{ width: `${(energy.runtimeHours / barScale) * 100}%` }}
              />
            </div>

            <div className="runtime__row">
              <span className="runtime__label">Essential devices only</span>
              <span className="runtime__value runtime__value--green">
                {formatWholeHours(energy.essentialRuntimeHours)}
              </span>
            </div>
            <div className="bar">
              <div
                className="bar__fill"
                style={{ width: `${(energy.essentialRuntimeHours / barScale) * 100}%` }}
              />
            </div>
          </div>

          <p className="card__note">
            {energy.optionalDevices.length > 0
              ? `Turn off ${energy.optionalDevices.length} lower-priority ${
                  energy.optionalDevices.length === 1 ? 'device' : 'devices'
                } to gain ${essentialHours - runtimeHours} extra hours.`
              : 'Every device in your workspace is already marked essential.'}
          </p>
          <a className="link-arrow" href="#/budget">
            Explore energy budget&nbsp;&nbsp;→
          </a>
        </section>
      </div>

      <section className="card card--table">
        <div className="card__head card__head--pad">
          <div className="card__head-left">
            <h2 className="card__title">Your devices</h2>
            <span className="card__count">
              {sorted.length === energy.deviceCount
                ? `${energy.deviceCount} ${energy.deviceCount === 1 ? 'device' : 'devices'}`
                : `${sorted.length} of ${energy.deviceCount} devices`}
            </span>
          </div>

          <div className="card__head-tools">
            <div className="sort-group" role="group" aria-label="Filter devices">
              {FILTERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`sort-group__item${filter === option.id ? ' is-active' : ''}`}
                  aria-pressed={filter === option.id}
                  onClick={() => setFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => toggleSort('power')}
            >
              Power: {sort.key === 'power' && !sort.desc ? 'low to high' : 'high to low'}
              &nbsp;&nbsp;{sort.key === 'power' && !sort.desc ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          Showing {sorted.length} devices, sorted by{' '}
          {COLUMNS.find((c) => c.key === sort.key)?.label.toLowerCase()},{' '}
          {sort.desc ? 'highest first' : 'lowest first'}.
        </p>

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                {COLUMNS.map((column) => {
                  const active = sort.key === column.key;
                  return (
                    <th
                      key={column.key}
                      aria-sort={active ? (sort.desc ? 'descending' : 'ascending') : 'none'}
                    >
                      <button
                        type="button"
                        className={`th-sort${active ? ' is-active' : ''}`}
                        onClick={() => toggleSort(column.key)}
                      >
                        {column.key === 'use'
                          ? `EST. USE / ${runtimeHours}H`
                          : column.label}
                        <span className="th-sort__arrow" aria-hidden="true">
                          {active ? (sort.desc ? '↓' : '↑') : '↕'}
                        </span>
                      </button>
                    </th>
                  );
                })}
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((device) => (
                <tr key={device.id}>
                  <td className="table__name">{device.name}</td>
                  <td>{deviceWatts(device)} W</td>
                  <td className={isEssential(device) ? 'is-essential' : 'is-optional'}>
                    {priorityLabel(device.priority)}
                  </td>
                  <td className="table__muted">
                    {((deviceWatts(device) * runtimeHours) / 1000).toFixed(1)} kWh
                  </td>
                  <td className="table__status">●&nbsp;&nbsp;Included</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="table__empty">
                    {devices.length === 0
                      ? 'No devices yet — add your first one from the Devices page.'
                      : 'No devices match this filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="footnote">
        Estimates use sample data and assume a constant load, with no solar input or
        battery losses.
      </p>
    </>
  );
}
