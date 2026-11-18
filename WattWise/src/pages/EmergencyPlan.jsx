import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { useWorkspace } from '../context/useWorkspace.js';
import {
  deviceWatts,
  formatShortRuntime,
  formatWholeHours,
  priorityLabel,
} from '../lib/energy.js';

export default function EmergencyPlan() {
  const { energy, profile, contacts } = useWorkspace();
  const [printing, setPrinting] = useState(false);

  const essentialSorted = [...energy.essentialDevices].sort(
    (a, b) => a.priority - b.priority || deviceWatts(b) - deviceWatts(a),
  );
  const optionalNames = energy.optionalDevices.map((d) => d.name);

  /**
   * Plan-001-T2 — offline copy. Rendering the plan into a print stylesheet lets
   * the browser save a real PDF with no third-party library.
   */
  const downloadPlan = () => {
    setPrinting(true);
    window.requestAnimationFrame(() => {
      window.print();
      setPrinting(false);
    });
  };

  const listNames = (names) => {
    if (names.length === 0) return 'no lower-priority devices';
    if (names.length === 1) return `the ${names[0].toLowerCase()}`;
    const last = names[names.length - 1];
    return `the ${names
      .slice(0, -1)
      .map((n) => n.toLowerCase())
      .join(', ')} and ${last.toLowerCase()}`;
  };

  const steps = [
    {
      title: 'Check your backup supply',
      text: "Confirm battery availability and follow the venue's safety procedure.",
    },
    {
      title: 'Pause lower-priority devices',
      text: `Turn off ${listNames(optionalNames)} to save ${energy.optionalKW.toFixed(
        2,
      )} kW.`,
    },
    {
      title: 'Keep essential services powered',
      text: `Protect ${listNames(essentialSorted.map((d) => d.name))}.`,
    },
    {
      title: 'Monitor and escalate',
      text: 'Review remaining energy regularly; arrange more power if needed.',
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">PREPARED TODAY. PROTECTED TOMORROW.</p>
          <h1 className="page-title">Emergency plan</h1>
          <p className="page-sub">
            A practical plan to keep your most important services running.
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={downloadPlan}>
          ↓&nbsp;&nbsp;Download plan
        </button>
      </div>

      <section className="card card--green plan-summary">
        <div>
          <p className="eyebrow eyebrow--on-dark">{profile.venueName.toUpperCase()}</p>
          <h2 className="plan-summary__title">Essential services first.</h2>
          <p className="plan-summary__sub">
            Essential-only scenario · Review with your venue lead before use
          </p>
        </div>
        <div className="plan-summary__stats">
          <div className="plan-summary__stat">
            <span className="plan-summary__value">
              {formatShortRuntime(energy.essentialRuntimeHours)}
            </span>
            <span className="plan-summary__caption">Estimated runtime</span>
          </div>
          <div className="plan-summary__divider" />
          <div className="plan-summary__stat">
            <span className="plan-summary__value plan-summary__value--lime">
              {energy.essentialCount}
            </span>
            <span className="plan-summary__caption">Devices protected</span>
          </div>
        </div>
      </section>

      <div className="plan-grid">
        <div className="plan-col">
          <section className="card card--pad">
            <h2 className="card__title card__title--lg">When the power goes out</h2>
            <ol className="steps">
              {steps.map((step, index) => (
                <li key={step.title} className="steps__item">
                  <span className="steps__num">{index + 1}</span>
                  <div>
                    <p className="steps__title">{step.title}</p>
                    <p className="steps__text">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="card card--pad">
            <h2 className="card__title card__title--lg">Devices to keep running</h2>
            <div className="table-scroll">
              <table className="table table--plain">
                <thead>
                  <tr>
                    <th>DEVICE</th>
                    <th>PRIORITY</th>
                    <th>POWER</th>
                  </tr>
                </thead>
                <tbody>
                  {essentialSorted.map((device) => (
                    <tr key={device.id}>
                      <td className="table__name">{device.name}</td>
                      <td className="is-essential">{priorityLabel(device.priority)}</td>
                      <td className="table__muted">{deviceWatts(device)} W</td>
                    </tr>
                  ))}
                  {essentialSorted.length === 0 && (
                    <tr>
                      <td colSpan={3} className="table__empty">
                        No essential devices yet — mark a device priority 1 or 2.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="plan-total">
              <span>Essential-only draw</span>
              <strong>{energy.essentialKW.toFixed(2)} kW</strong>
            </div>
          </section>
        </div>

        <div className="plan-col">
          <section className="card card--pad">
            <h2 className="card__title card__title--lg">Keep a copy offline</h2>
            <p className="card__sub">Access your plan even without internet.</p>

            <div className="pdf-preview">
              <div className="pdf-sheet" aria-hidden="true">
                <span className="pdf-sheet__brand">WattWise</span>
                <span className="pdf-sheet__rule" />
                <span className="pdf-sheet__title">
                  Emergency
                  <br />
                  energy plan
                </span>
                <span className="pdf-sheet__line" style={{ width: '72px' }} />
                <span className="pdf-sheet__line" style={{ width: '64px' }} />
                <span className="pdf-sheet__line" style={{ width: '56px' }} />
                <span className="pdf-sheet__line" style={{ width: '48px' }} />
              </div>
              <div className="pdf-preview__meta">
                <p className="pdf-preview__name">
                  {profile.venueName.split(' ')[0]} energy plan
                </p>
                <p className="pdf-preview__type">PDF document</p>
                <p className="pdf-preview__contents">
                  Action steps · Device priorities
                  <br />
                  Energy estimates · Contacts
                </p>
              </div>
            </div>

            <button type="button" className="btn btn--primary btn--block" onClick={downloadPlan}>
              ↓&nbsp;&nbsp;Download PDF
            </button>
            <p className="card__note">Save to your phone or print for the venue.</p>
          </section>

          <section className="card card--amber card--pad contacts">
            <h2 className="contacts__title">Before you share this plan</h2>
            <p className="contacts__sub">
              Add local contacts and confirm the plan with staff.
            </p>
            <div className="contacts__row">
              <span>Venue emergency lead</span>
              <span className="contacts__status">
                {contacts.emergencyLead || 'Not added'}
              </span>
            </div>
            <div className="contacts__row">
              <span>Backup energy supplier</span>
              <span className="contacts__status">
                {contacts.energySupplier || 'Not added'}
              </span>
            </div>
            <a className="link-arrow" href="#/profile">
              +&nbsp;&nbsp;Add emergency contacts
            </a>
          </section>
        </div>
      </div>

      <p className="footnote">
        Sample plan · Estimates exclude solar input and battery losses. This is not a
        substitute for your venue&rsquo;s emergency procedures.
      </p>

      {/* Printable version — hidden on screen, used for "Download PDF". */}
      <div className={`print-plan${printing ? ' is-printing' : ''}`} aria-hidden="true">
        <header className="print-plan__head">
          <Icon name="bolt" />
          <div>
            <p className="print-plan__brand">WattWise · Emergency energy plan</p>
            <p className="print-plan__venue">{profile.venueName}</p>
          </div>
        </header>

        <dl className="print-plan__facts">
          <div>
            <dt>Available energy</dt>
            <dd>{energy.availableKWh.toFixed(1)} kWh</dd>
          </div>
          <div>
            <dt>Essential-only draw</dt>
            <dd>{energy.essentialKW.toFixed(2)} kW</dd>
          </div>
          <div>
            <dt>Estimated runtime</dt>
            <dd>{formatWholeHours(energy.essentialRuntimeHours)}</dd>
          </div>
          <div>
            <dt>Devices protected</dt>
            <dd>{energy.essentialCount}</dd>
          </div>
        </dl>

        <h2>When the power goes out</h2>
        <ol>
          {steps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong> — {step.text}
            </li>
          ))}
        </ol>

        <h2>Devices to keep running</h2>
        <table>
          <thead>
            <tr>
              <th>Device</th>
              <th>Priority</th>
              <th>Power</th>
            </tr>
          </thead>
          <tbody>
            {essentialSorted.map((device) => (
              <tr key={device.id}>
                <td>{device.name}</td>
                <td>{priorityLabel(device.priority)}</td>
                <td>{deviceWatts(device)} W</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Emergency contacts</h2>
        <p>Venue emergency lead: {contacts.emergencyLead || 'Not added'}</p>
        <p>Backup energy supplier: {contacts.energySupplier || 'Not added'}</p>

        <p className="print-plan__note">
          Estimates exclude solar input and battery losses. This is not a substitute for
          your venue&rsquo;s emergency procedures.
        </p>
      </div>
    </>
  );
}
