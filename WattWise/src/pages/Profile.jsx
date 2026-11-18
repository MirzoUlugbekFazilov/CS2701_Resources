import { useMemo, useState } from 'react';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import Toggle from '../components/Toggle.jsx';
import { useWorkspace } from '../context/useWorkspace.js';
import { ROLES } from '../data/sampleData.js';
import { useToast } from '../lib/toast.js';
import useForm from '../lib/useForm.js';
import {
  validateEmail,
  validateName,
  validateNumber,
  validatePhone,
  validateRequired,
} from '../lib/validation.js';

export default function Profile() {
  const { profile, battery, alerts, plans, energy, setProfile, setBattery, toggleAlert } =
    useWorkspace();
  const toast = useToast();
  const [saved, setSaved] = useState(false);

  const initialValues = useMemo(
    () => ({
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
      phone: profile.phone,
      venueName: profile.venueName,
      capacityKWh: String(battery.capacityKWh),
    }),
    [profile, battery.capacityKWh],
  );

  const form = useForm({
    initialValues,
    validators: {
      fullName: (value) => validateName(value),
      email: (value) => validateEmail(value, { label: 'work email' }),
      role: (value) => validateRequired(value, 'your role'),
      phone: (value) => validatePhone(value),
      venueName: (value) => validateRequired(value, 'your venue name'),
      capacityKWh: (value) =>
        validateNumber(value, { label: 'Battery capacity', min: 0, max: 2000 }),
    },
    onSubmit: (values) => {
      setProfile({
        fullName: values.fullName,
        email: values.email,
        role: values.role,
        phone: values.phone,
        venueName: values.venueName,
      });
      if (values.capacityKWh !== battery.capacityKWh) {
        // Keep the stored energy the same and recalculate the percentage, so
        // adding headroom does not pretend the battery magically filled up.
        setBattery({
          capacityKWh: values.capacityKWh,
          chargePercent: Math.min(100, (energy.availableKWh / values.capacityKWh) * 100),
        });
      }
      setSaved(true);
      toast.success('Profile saved.');
    },
  });

  // Re-sync the form when the stored profile changes from elsewhere.
  const [syncedFrom, setSyncedFrom] = useState(initialValues);
  if (syncedFrom !== initialValues) {
    setSyncedFrom(initialValues);
    form.reset(initialValues);
  }

  const dirty = useMemo(
    () => Object.keys(initialValues).some((key) => form.values[key] !== initialValues[key]),
    [form.values, initialValues],
  );

  const initials = useMemo(
    () =>
      form.values.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'WW',
    [form.values.fullName],
  );

  const completedSteps = [
    Boolean(form.values.fullName.trim()),
    Boolean(form.values.email.trim()),
    Boolean(form.values.venueName.trim()),
    Boolean(form.values.phone.trim()),
    profile.twoStepEnabled,
  ].filter(Boolean).length;

  const fullName = form.field('fullName');
  const email = form.field('email');
  const role = form.field('role');
  const phone = form.field('phone');
  const venueName = form.field('venueName');
  const capacity = form.field('capacityKWh');

  const discard = () => {
    form.reset(initialValues);
    setSaved(false);
  };

  return (
    <form
      onSubmit={(event) => {
        setSaved(false);
        form.handleSubmit(event);
      }}
    >
      <div className="page-head">
        <div>
          <p className="eyebrow eyebrow--green">YOUR ACCOUNT</p>
          <h1 className="page-title page-title--lg">Profile</h1>
          <p className="page-sub">
            Manage your details, venue information and alert preferences.
          </p>
        </div>
        <div className="page-head__actions">
          <button type="button" className="btn btn--ghost" onClick={discard} disabled={!dirty}>
            Discard
          </button>
          <button type="submit" className="btn btn--dark" disabled={form.submitting}>
            {form.submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <section className="welcome">
        <span className="welcome__check" aria-hidden="true">
          <Icon name="check" />
        </span>
        <div className="welcome__body">
          <p className="welcome__title" aria-live="polite">
            {saved
              ? 'Your profile has been saved.'
              : `Welcome to WattWise, ${profile.fullName.split(' ')[0]}!`}
          </p>
          <p className="welcome__text">
            Finish setting up your profile to get accurate outage estimates.
          </p>
        </div>
        <div className="welcome__progress">
          <span className="welcome__steps">{completedSteps} of 5 steps complete</span>
          <div
            className="meter meter--wide"
            role="progressbar"
            aria-valuenow={completedSteps}
            aria-valuemin={0}
            aria-valuemax={5}
            aria-label="Profile setup progress"
          >
            <div className="meter__fill" style={{ width: `${(completedSteps / 5) * 100}%` }} />
          </div>
        </div>
      </section>

      <div className="profile-grid">
        <section className="card card--pad identity">
          <div className="identity__avatar">
            <span className="avatar avatar--lg">{initials}</span>
            <span className="identity__badge" aria-hidden="true">
              +
            </span>
          </div>
          <p className="identity__name">{form.values.fullName || 'Your name'}</p>
          <span className="chip chip--tint identity__role">{form.values.role}</span>
          <p className="identity__email">{form.values.email}</p>

          <div className="identity__rule" />

          <p className="eyebrow eyebrow--xs">VENUE</p>
          <p className="identity__fact">{form.values.venueName}</p>
          <p className="eyebrow eyebrow--xs">MEMBER SINCE</p>
          <p className="identity__fact">{profile.memberSince}</p>

          <button type="button" className="btn btn--ghost btn--block">
            Change photo
          </button>
        </section>

        <div className="profile-col">
          <section className="card card--pad">
            <h2 className="card__title card__title--lg">Personal details</h2>
            <p className="card__sub">Used for alerts and emergency contacts.</p>

            <div className="field-row">
              <Field
                label="Full name"
                className="field--compact"
                autoComplete="name"
                value={fullName.value}
                error={fullName.error}
                valid={fullName.valid}
                inputRef={fullName.inputRef}
                onChange={(event) => fullName.onChange(event.target.value)}
                onBlur={fullName.onBlur}
              />
              <Field
                label="Work email"
                className="field--compact"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck="false"
                autoCapitalize="off"
                value={email.value}
                error={email.error}
                warning={email.warning}
                suggestion={email.suggestion}
                valid={email.valid}
                inputRef={email.inputRef}
                onApplySuggestion={(fixed) => form.setValue('email', fixed)}
                onChange={(event) => email.onChange(event.target.value)}
                onBlur={email.onBlur}
              />
            </div>

            <div className="field-row">
              <Field
                label="Role"
                className="field--compact"
                error={role.error}
                inputRef={role.inputRef}
              >
                {({ id, describedBy, inputRef }) => (
                  <div className="select-wrap">
                    <select
                      id={id}
                      ref={inputRef}
                      className="input"
                      value={role.value}
                      aria-describedby={describedBy}
                      onChange={(event) => role.onChange(event.target.value)}
                      onBlur={role.onBlur}
                    >
                      {ROLES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </Field>

              <Field
                label="Phone (optional)"
                className="field--compact"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                hint="UK numbers only, used for outage alerts."
                value={phone.value}
                error={phone.error}
                valid={phone.valid}
                inputRef={phone.inputRef}
                onChange={(event) => phone.onChange(event.target.value)}
                onBlur={phone.onBlur}
              />
            </div>
          </section>

          <section className="card card--pad">
            <h2 className="card__title card__title--lg">Venue &amp; energy system</h2>
            <p className="card__sub">Helps estimate runtime and priorities during outages.</p>

            <div className="field-row">
              <Field
                label="Venue name"
                className="field--compact"
                autoComplete="organization"
                value={venueName.value}
                error={venueName.error}
                valid={venueName.valid}
                inputRef={venueName.inputRef}
                onChange={(event) => venueName.onChange(event.target.value)}
                onBlur={venueName.onBlur}
              />

              <Field
                label="Backup battery capacity"
                className="field--compact"
                hint={`Currently holding ${energy.availableKWh.toFixed(1)} kWh.`}
                error={capacity.error}
                inputRef={capacity.inputRef}
              >
                {({ id, describedBy, inputRef }) => (
                  <div className="input-affix">
                    <input
                      id={id}
                      ref={inputRef}
                      className={`input${capacity.error ? ' has-error' : ''}`}
                      type="number"
                      min="1"
                      step="0.5"
                      inputMode="decimal"
                      value={capacity.value}
                      aria-invalid={Boolean(capacity.error)}
                      aria-describedby={describedBy}
                      onChange={(event) => capacity.onChange(event.target.value)}
                      onBlur={capacity.onBlur}
                    />
                    <span className="chip chip--tint input-affix__chip">kWh</span>
                  </div>
                )}
              </Field>
            </div>
          </section>
        </div>
      </div>

      <div className="profile-grid profile-grid--thirds">
        <section className="card card--pad">
          <h2 className="card__title card__title--lg">Alert preferences</h2>
          <div className="prefs">
            <div className="prefs__row">
              <span>Low battery warning</span>
              <Toggle
                checked={alerts.lowBattery}
                onChange={() => toggleAlert('lowBattery')}
                label="Low battery warning"
              />
            </div>
            <div className="prefs__row">
              <span>Almost over budget</span>
              <Toggle
                checked={alerts.almostOverBudget}
                onChange={() => toggleAlert('almostOverBudget')}
                label="Almost over budget"
              />
            </div>
            <div className="prefs__row">
              <span>Weekly energy summary</span>
              <Toggle
                checked={alerts.weeklySummary}
                onChange={() => toggleAlert('weeklySummary')}
                label="Weekly energy summary"
              />
            </div>
          </div>
        </section>

        <section className="card card--pad">
          <h2 className="card__title card__title--lg">Saved emergency plans</h2>
          <ul className="plans">
            {plans.map((plan) => (
              <li key={plan.id} className="plans__row">
                <span className="plans__icon" aria-hidden="true">
                  <Icon name="doc" />
                </span>
                <div>
                  <p className="plans__name">{plan.name}</p>
                  <p className="plans__meta">{plan.updated}</p>
                </div>
                <a className="plans__download" href="#/plan" aria-label={`Open ${plan.name}`}>
                  ↓
                </a>
              </li>
            ))}
          </ul>
          <a className="link-arrow" href="#/plan">
            + Create a new plan
          </a>
        </section>

        <section className="card card--pad">
          <h2 className="card__title card__title--lg">Security</h2>
          <div className="security__row">
            <div>
              <p className="security__name">Password</p>
              <p className="security__meta">Last changed {profile.passwordChanged}</p>
            </div>
            <button type="button" className="btn btn--ghost btn--sm">
              Change
            </button>
          </div>
          <div className="security__rule" />
          <div className="security__row">
            <div>
              <p className="security__name">Two-step verification</p>
              <p className="security__meta">
                {profile.twoStepEnabled ? 'Enabled' : 'Not enabled'}
              </p>
            </div>
            <button
              type="button"
              className="btn btn--dark btn--sm"
              onClick={() => {
                setProfile({ twoStepEnabled: !profile.twoStepEnabled });
                toast.success(
                  profile.twoStepEnabled
                    ? 'Two-step verification turned off.'
                    : 'Two-step verification enabled.',
                );
              }}
            >
              {profile.twoStepEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
          <button type="button" className="link-btn link-btn--danger">
            Delete account
          </button>
        </section>
      </div>
    </form>
  );
}
