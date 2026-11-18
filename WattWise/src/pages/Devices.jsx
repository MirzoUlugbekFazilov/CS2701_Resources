import { useMemo, useState } from 'react';
import AnimatedNumber from '../components/AnimatedNumber.jsx';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import { useWorkspace } from '../context/useWorkspace.js';
import { CATEGORIES, PRIORITY_LABELS } from '../data/sampleData.js';
import { deviceEnergyKWh, deviceWatts, priorityLabel } from '../lib/energy.js';
import { useToast } from '../lib/toast.js';
import useForm from '../lib/useForm.js';
import {
  validateDeviceName,
  validateNumber,
  validateRequired,
} from '../lib/validation.js';

const EMPTY_DEVICE = {
  name: '',
  category: CATEGORIES[0],
  watts: '',
  quantity: '1',
  hours: '4',
  priority: 3,
};

const SORTS = {
  power: { label: 'Power', compare: (a, b) => deviceWatts(b) - deviceWatts(a) },
  priority: {
    label: 'Priority',
    compare: (a, b) => a.priority - b.priority || deviceWatts(b) - deviceWatts(a),
  },
  name: { label: 'Name', compare: (a, b) => a.name.localeCompare(b.name) },
};

export default function Devices() {
  const { devices, energy, battery, addDevice, updateDevice, removeDevice, setBattery } =
    useWorkspace();
  const toast = useToast();

  const [tab, setTab] = useState('device');
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  // The design lists this panel in priority order (critical first), unlike the
  // overview table which is ordered by power draw.
  const [sortKey, setSortKey] = useState('priority');

  /* ---------------- Device form ---------------- */

  const deviceForm = useForm({
    initialValues: EMPTY_DEVICE,
    validators: {
      name: (value) => validateDeviceName(value, devices, editingId),
      category: (value) => validateRequired(value, 'a category'),
      watts: (value) => validateNumber(value, { label: 'Rated power', min: 0, max: 50000 }),
      quantity: (value) =>
        validateNumber(value, {
          label: 'Quantity',
          min: 1,
          max: 999,
          integer: true,
          exclusiveMin: false,
        }),
      hours: (value) => validateNumber(value, { label: 'Usage duration', min: 0, max: 24 }),
      priority: (value) =>
        [1, 2, 3, 4, 5].includes(Number(value))
          ? { valid: true, value: Number(value) }
          : { valid: false, error: 'Choose a priority from 1 to 5.' },
    },
    onSubmit: (values) => {
      if (editingId) {
        updateDevice(editingId, values);
        toast.success(`${values.name} updated.`);
        setEditingId(null);
      } else {
        addDevice(values);
        toast.success(
          `${values.name} added — ${values.watts} W at priority ${values.priority}.`,
        );
      }
      deviceForm.reset(EMPTY_DEVICE);
    },
  });

  /* ---------------- Battery form ---------------- */

  const batteryForm = useForm({
    initialValues: { label: '', capacity: '' },
    validators: {
      label: (value) => validateRequired(value, 'a name for this battery'),
      capacity: (value) => validateNumber(value, { label: 'Capacity', min: 0, max: 2000 }),
    },
    onSubmit: (values) => {
      const previousAvailable = energy.availableKWh;
      const newCapacity = battery.capacityKWh + values.capacity;
      // New capacity arrives fully charged, so the percentage is recalculated
      // against the combined bank rather than simply added.
      setBattery({
        capacityKWh: newCapacity,
        chargePercent: ((previousAvailable + values.capacity) / newCapacity) * 100,
      });
      toast.success(`${values.label} added — ${values.capacity} kWh of extra capacity.`);
      batteryForm.reset({ label: '', capacity: '' });
      setTab('device');
    },
  });

  /* ---------------- Live estimate ---------------- */

  const { watts, quantity, hours } = deviceForm.values;
  const estimate = deviceEnergyKWh(watts, quantity, hours);
  const addedWatts = (Number(watts) || 0) * (Number(quantity) || 0);
  const batteryShare = energy.availableKWh > 0 ? (estimate / energy.availableKWh) * 100 : 0;
  const runtimeIfAlone = addedWatts > 0 ? (energy.availableKWh * 1000) / addedWatts : 0;

  /* ---------------- Device list ---------------- */

  const visibleDevices = useMemo(() => {
    const term = query.trim().toLowerCase();
    return devices
      .filter(
        (device) =>
          !term ||
          device.name.toLowerCase().includes(term) ||
          device.category.toLowerCase().includes(term) ||
          priorityLabel(device.priority).toLowerCase().includes(term),
      )
      .sort(SORTS[sortKey].compare);
  }, [devices, query, sortKey]);

  const startEdit = (device) => {
    setTab('device');
    setEditingId(device.id);
    deviceForm.reset({
      name: device.name,
      category: device.category,
      watts: String(device.watts),
      quantity: String(device.quantity),
      hours: String(device.hours),
      priority: device.priority,
    });
    document
      .getElementById('device-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    deviceForm.reset(EMPTY_DEVICE);
  };

  /** Remove with Undo rather than a confirm dialog — see ToastProvider. */
  const handleRemove = (device) => {
    removeDevice(device.id);
    if (editingId === device.id) cancelEdit();
    toast.warning(`${device.name} removed.`, {
      action: {
        label: 'Undo',
        onClick: () => {
          addDevice({
            name: device.name,
            category: device.category,
            watts: device.watts,
            quantity: device.quantity,
            hours: device.hours,
            priority: device.priority,
          });
          toast.success(`${device.name} restored.`);
        },
      },
    });
  };

  const name = deviceForm.field('name');
  const category = deviceForm.field('category');
  const wattsField = deviceForm.field('watts');
  const quantityField = deviceForm.field('quantity');
  const hoursField = deviceForm.field('hours');
  const priorityField = deviceForm.field('priority');

  const batteryLabel = batteryForm.field('label');
  const batteryCapacity = batteryForm.field('capacity');

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">BUILD YOUR ENERGY PICTURE</p>
          <h1 className="page-title">Devices &amp; calculator</h1>
          <p className="page-sub">Know what you use. Choose what matters.</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={() => setTab('battery')}>
          +&nbsp;&nbsp;Add battery
        </button>
      </div>

      <div className="devices-grid">
        <section className="card card--pad" id="device-form">
          <h2 className="card__title card__title--lg">
            {editingId ? 'Edit device' : 'Add a device'}
          </h2>
          <p className="card__sub">Enter the details to estimate its energy use.</p>

          <div className="segment" role="tablist" aria-label="What are you adding?">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'device'}
              className={`segment__item${tab === 'device' ? ' is-active' : ''}`}
              onClick={() => setTab('device')}
            >
              Electrical device
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'battery'}
              className={`segment__item${tab === 'battery' ? ' is-active' : ''}`}
              onClick={() => setTab('battery')}
            >
              Battery storage
            </button>
          </div>

          {tab === 'device' ? (
            <form className="form" onSubmit={deviceForm.handleSubmit} noValidate>
              {deviceForm.errorCount > 0 && (
                <p className="form-summary" role="alert">
                  {deviceForm.errorCount === 1
                    ? 'There is 1 problem below.'
                    : `There are ${deviceForm.errorCount} problems below.`}
                </p>
              )}

              <Field
                label="Device name *"
                className="field--compact"
                placeholder="e.g. Reception laptop"
                hint="Give each device a unique, recognisable name."
                value={name.value}
                error={name.error}
                valid={name.valid}
                inputRef={name.inputRef}
                onChange={(event) => name.onChange(event.target.value)}
                onBlur={name.onBlur}
              />

              <Field
                label="Category *"
                className="field--compact"
                error={category.error}
                inputRef={category.inputRef}
              >
                {({ id, describedBy, inputRef }) => (
                  <div className="select-wrap">
                    <select
                      id={id}
                      ref={inputRef}
                      className={`input${category.error ? ' has-error' : ''}`}
                      value={category.value}
                      aria-describedby={describedBy}
                      onChange={(event) => category.onChange(event.target.value)}
                      onBlur={category.onBlur}
                    >
                      {CATEGORIES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </Field>

              <div className="field-row">
                <Field
                  label="Rated power *"
                  className="field--compact"
                  error={wattsField.error}
                  inputRef={wattsField.inputRef}
                >
                  {({ id, describedBy, inputRef }) => (
                    <div className="input-affix">
                      <input
                        id={id}
                        ref={inputRef}
                        className={`input${wattsField.error ? ' has-error' : ''}`}
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        placeholder="60"
                        value={wattsField.value}
                        aria-invalid={Boolean(wattsField.error)}
                        aria-describedby={describedBy}
                        onChange={(event) => wattsField.onChange(event.target.value)}
                        onBlur={wattsField.onBlur}
                      />
                      <span className="input-affix__unit">W</span>
                    </div>
                  )}
                </Field>

                <Field
                  label="Quantity *"
                  className="field--compact"
                  error={quantityField.error}
                  inputRef={quantityField.inputRef}
                >
                  {({ id, describedBy, inputRef }) => (
                    <input
                      id={id}
                      ref={inputRef}
                      className={`input${quantityField.error ? ' has-error' : ''}`}
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={quantityField.value}
                      aria-invalid={Boolean(quantityField.error)}
                      aria-describedby={describedBy}
                      onChange={(event) => quantityField.onChange(event.target.value)}
                      onBlur={quantityField.onBlur}
                    />
                  )}
                </Field>
              </div>

              <div className="field-row">
                <Field
                  label="Usage duration *"
                  className="field--compact"
                  error={hoursField.error}
                  inputRef={hoursField.inputRef}
                >
                  {({ id, describedBy, inputRef }) => (
                    <div className="input-affix">
                      <input
                        id={id}
                        ref={inputRef}
                        className={`input${hoursField.error ? ' has-error' : ''}`}
                        type="number"
                        min="0.5"
                        max="24"
                        step="0.5"
                        inputMode="decimal"
                        value={hoursField.value}
                        aria-invalid={Boolean(hoursField.error)}
                        aria-describedby={describedBy}
                        onChange={(event) => hoursField.onChange(event.target.value)}
                        onBlur={hoursField.onBlur}
                      />
                      <span className="input-affix__unit">hrs</span>
                    </div>
                  )}
                </Field>
                <p className="field__formula">Energy = watts × quantity × hours ÷ 1,000</p>
              </div>

              <div className="field">
                <span className="field__label">Priority *</span>
                <div
                  className="priority"
                  role="radiogroup"
                  aria-label="Priority from 1 critical to 5 optional"
                >
                  {[1, 2, 3, 4, 5].map((level) => {
                    const active = Number(priorityField.value) === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        // Roving tabindex: one tab stop, arrow keys move within.
                        tabIndex={active ? 0 : -1}
                        className={`priority__item${active ? ' is-active' : ''}`}
                        onClick={() => priorityField.onChange(level)}
                        onKeyDown={(event) => {
                          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                            event.preventDefault();
                            priorityField.onChange(Math.min(5, level + 1));
                          }
                          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                            event.preventDefault();
                            priorityField.onChange(Math.max(1, level - 1));
                          }
                        }}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
                <div className="priority__scale">
                  <span>1 · Critical</span>
                  <span className="priority__current" aria-live="polite">
                    {Number(priorityField.value)} ·{' '}
                    {PRIORITY_LABELS[Number(priorityField.value)]}
                  </span>
                  <span>5 · Optional</span>
                </div>
                <p className="field__hint">
                  {Number(priorityField.value) <= 2
                    ? 'Priority 1–2 counts as essential and stays on in your emergency plan.'
                    : 'Priority 3–5 is switched off first when energy runs short.'}
                </p>
              </div>

              <div className="form__actions">
                <p className="footnote footnote--inline">
                  * Required fields. Estimates assume a constant load.
                </p>
                <div className="form__buttons">
                  <button type="button" className="btn btn--ghost" onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={deviceForm.submitting}
                  >
                    {editingId ? 'Save device' : '+  Add device'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form className="form" onSubmit={batteryForm.handleSubmit} noValidate>
              <Field
                label="Battery name *"
                className="field--compact"
                placeholder="e.g. Hall backup unit"
                value={batteryLabel.value}
                error={batteryLabel.error}
                valid={batteryLabel.valid}
                inputRef={batteryLabel.inputRef}
                onChange={(event) => batteryLabel.onChange(event.target.value)}
                onBlur={batteryLabel.onBlur}
              />

              <Field
                label="Usable capacity *"
                className="field--compact"
                hint={`Current total: ${battery.capacityKWh} kWh at ${Math.round(
                  energy.chargePercent,
                )}% charge.`}
                error={batteryCapacity.error}
                inputRef={batteryCapacity.inputRef}
              >
                {({ id, describedBy, inputRef }) => (
                  <div className="input-affix">
                    <input
                      id={id}
                      ref={inputRef}
                      className={`input${batteryCapacity.error ? ' has-error' : ''}`}
                      type="number"
                      min="0.5"
                      step="0.5"
                      inputMode="decimal"
                      placeholder="10"
                      value={batteryCapacity.value}
                      aria-invalid={Boolean(batteryCapacity.error)}
                      aria-describedby={describedBy}
                      onChange={(event) => batteryCapacity.onChange(event.target.value)}
                      onBlur={batteryCapacity.onBlur}
                    />
                    <span className="input-affix__unit">kWh</span>
                  </div>
                )}
              </Field>

              <div className="form__actions">
                <p className="footnote footnote--inline">
                  * Required fields. New capacity is assumed to be fully charged.
                </p>
                <div className="form__buttons">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      batteryForm.reset({ label: '', capacity: '' });
                      setTab('device');
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn--primary">
                    +&nbsp;&nbsp;Add battery
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>

        <div className="devices-side">
          <section className="card card--tint card--pad estimate" aria-live="polite">
            <p className="eyebrow eyebrow--green">DEVICE ENERGY ESTIMATE</p>
            <p className="estimate__value">
              <AnimatedNumber value={estimate} decimals={2} />
              <span className="estimate__unit">kWh</span>
            </p>
            <p className="estimate__caption">
              for {Number(quantity) || 0} {Number(quantity) === 1 ? 'device' : 'devices'}{' '}
              running for {Number(hours) || 0} hours
            </p>
            <div className="estimate__rule" />
            <div className="estimate__row">
              <span>Added power draw</span>
              <strong>{addedWatts} W</strong>
            </div>
            <div className="estimate__row">
              <span>Battery share for this session</span>
              <strong>{batteryShare.toFixed(1)}%</strong>
            </div>
            {addedWatts > 0 && (
              <div className="estimate__row">
                <span>Could run alone for</span>
                <strong>{runtimeIfAlone.toFixed(1)} hours</strong>
              </div>
            )}
          </section>

          <section className="card card--pad">
            <h2 className="card__title card__title--lg">Your devices</h2>
            <p className="card__sub">
              {energy.deviceCount} {energy.deviceCount === 1 ? 'device' : 'devices'} ·{' '}
              {energy.totalKW.toFixed(2)} kW combined
            </p>

            <div className="list-controls">
              <div className="search">
                <input
                  type="search"
                  className="input input--search"
                  placeholder="Search devices…"
                  aria-label="Search devices by name, category or priority"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    className="search__clear"
                    aria-label="Clear search"
                    onClick={() => setQuery('')}
                  >
                    <Icon name="close" size={13} />
                  </button>
                )}
              </div>

              <div className="sort-group" role="group" aria-label="Sort devices by">
                {Object.entries(SORTS).map(([key, { label }]) => (
                  <button
                    key={key}
                    type="button"
                    className={`sort-group__item${sortKey === key ? ' is-active' : ''}`}
                    aria-pressed={sortKey === key}
                    onClick={() => setSortKey(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <p className="sr-only" aria-live="polite">
              {visibleDevices.length} devices shown, sorted by {SORTS[sortKey].label}.
            </p>

            <ul className="device-list">
              {visibleDevices.map((device) => (
                <li
                  key={device.id}
                  className={`device-list__row${editingId === device.id ? ' is-editing' : ''}`}
                >
                  <div>
                    <p className="device-list__name">{device.name}</p>
                    <p className="device-list__meta">
                      {deviceWatts(device)} W&nbsp;&nbsp;·&nbsp;&nbsp;
                      {priorityLabel(device.priority)}
                      {device.quantity > 1 && (
                        <>&nbsp;&nbsp;·&nbsp;&nbsp;×{device.quantity}</>
                      )}
                    </p>
                  </div>
                  <div className="device-list__actions">
                    <button type="button" className="link-btn" onClick={() => startEdit(device)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="link-btn link-btn--remove"
                      onClick={() => handleRemove(device)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}

              {visibleDevices.length === 0 && (
                <li className="device-list__empty">
                  {devices.length === 0
                    ? 'No devices yet. Add your first one using the form.'
                    : `No devices match “${query}”.`}
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
