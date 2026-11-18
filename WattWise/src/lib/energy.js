/**
 * All of the energy maths for the prototype. Everything is derived from the
 * device list and the battery, so editing a device updates every page.
 *
 *   energy (kWh) = watts × quantity × hours ÷ 1,000
 *   runtime (h)  = available energy (kWh) ÷ load (kW)
 */

import { ESSENTIAL_MAX_PRIORITY, PRIORITY_LABELS } from '../data/sampleData.js';

export const deviceWatts = (device) => device.watts * device.quantity;

export const isEssential = (device) => device.priority <= ESSENTIAL_MAX_PRIORITY;

export const priorityLabel = (priority) =>
  `${priority} · ${PRIORITY_LABELS[priority] ?? 'Standard'}`;

/** watts × quantity × hours ÷ 1,000 — the calculator formula from the design. */
export const deviceEnergyKWh = (watts, quantity, hours) =>
  (Number(watts) || 0) * (Number(quantity) || 0) * (Number(hours) || 0) / 1000;

const sumWatts = (devices) => devices.reduce((total, d) => total + deviceWatts(d), 0);

/** Hours as a readable string, e.g. 18.2857 → "18 hours 17 minutes". */
export function formatHoursMinutes(hours) {
  if (!Number.isFinite(hours) || hours <= 0) return '0 minutes';
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (whole === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${whole} ${whole === 1 ? 'hour' : 'hours'}`;
  return `${whole} ${whole === 1 ? 'hour' : 'hours'} ${minutes} minutes`;
}

/** Compact runtime used on the plan summary, e.g. 6.67 → "6h 40m". */
export function formatShortRuntime(hours) {
  if (!Number.isFinite(hours) || hours <= 0) return '0m';
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (minutes === 0) return `${whole}h`;
  if (whole === 0) return `${minutes}m`;
  return `${whole}h ${minutes}m`;
}

/**
 * The single source of truth for every figure shown in the workspace.
 */
export function computeEnergy(devices, battery, targetHours) {
  const capacityKWh = Number(battery.capacityKWh) || 0;
  const chargePercent = Number(battery.chargePercent) || 0;
  const availableKWh = (capacityKWh * chargePercent) / 100;

  const essentialDevices = devices.filter(isEssential);
  const optionalDevices = devices.filter((d) => !isEssential(d));
  const criticalDevices = devices.filter((d) => d.priority === 1);

  const totalWatts = sumWatts(devices);
  const essentialWatts = sumWatts(essentialDevices);
  const optionalWatts = sumWatts(optionalDevices);
  const criticalWatts = sumWatts(criticalDevices);

  const totalKW = totalWatts / 1000;
  const essentialKW = essentialWatts / 1000;
  const optionalKW = optionalWatts / 1000;
  const criticalKW = criticalWatts / 1000;

  const runtimeHours = totalKW > 0 ? availableKWh / totalKW : 0;
  const essentialRuntimeHours = essentialKW > 0 ? availableKWh / essentialKW : 0;
  const criticalRuntimeHours = criticalKW > 0 ? availableKWh / criticalKW : 0;

  const target = Number(targetHours) || 0;
  const neededKWh = totalKW * target;
  const essentialNeededKWh = essentialKW * target;
  const shortfallKWh = Math.max(0, neededKWh - availableKWh);
  const hoursBelowTarget = Math.max(0, target - runtimeHours);
  const hoursBeyondTarget = Math.max(0, essentialRuntimeHours - target);

  // Allocation bar: essential demand first, then whatever available energy is
  // left covers lower-priority devices, and the remainder is over budget.
  const essentialAllocationKWh = Math.min(essentialNeededKWh, availableKWh);
  const optionalAllocationKWh = Math.max(0, availableKWh - essentialAllocationKWh);
  const overBudgetKWh = shortfallKWh;

  const gainedHours = Math.max(0, essentialRuntimeHours - runtimeHours);

  return {
    capacityKWh,
    chargePercent,
    availableKWh,

    devices,
    essentialDevices,
    optionalDevices,
    criticalDevices,
    deviceCount: devices.length,
    essentialCount: essentialDevices.length,

    totalWatts,
    essentialWatts,
    optionalWatts,
    criticalWatts,
    totalKW,
    essentialKW,
    optionalKW,
    criticalKW,

    runtimeHours,
    essentialRuntimeHours,
    criticalRuntimeHours,

    targetHours: target,
    neededKWh,
    shortfallKWh,
    hoursBelowTarget,
    hoursBeyondTarget,
    essentialAllocationKWh,
    optionalAllocationKWh,
    overBudgetKWh,
    gainedHours,

    withinBudget: shortfallKWh <= 0,
  };
}

/**
 * Donut slices for "Where your energy goes": essential devices are grouped into
 * one slice, then each lower-priority device gets its own.
 */
export function loadShare(energy) {
  const palette = [
    'var(--chart-2)',
    'var(--chart-3)',
    '#7f9f8c',
    '#c9a86a',
    '#9bb9a6',
    '#d9c48f',
  ];

  const slices = [];
  if (energy.essentialWatts > 0) {
    slices.push({
      id: 'essential',
      label: 'Essential devices',
      watts: energy.essentialWatts,
      color: 'var(--chart-1)',
    });
  }

  [...energy.optionalDevices]
    .sort((a, b) => deviceWatts(b) - deviceWatts(a))
    .forEach((device, index) => {
      slices.push({
        id: device.id,
        label: device.name,
        watts: deviceWatts(device),
        color: palette[index % palette.length],
      });
    });

  const total = slices.reduce((sum, slice) => sum + slice.watts, 0);
  return slices.map((slice) => ({
    ...slice,
    percent: total > 0 ? (slice.watts / total) * 100 : 0,
  }));
}

/** Formats a percentage the way the design does: 50%, 37.5%, 12.5%. */
export const formatPercent = (value) =>
  `${Number(value.toFixed(1)).toString()}%`;

export const formatKWh = (value, digits = 1) => `${value.toFixed(digits)} kWh`;

export const formatKW = (value) => `${value.toFixed(2)} kW`;

export const formatWholeHours = (hours) => {
  const rounded = Math.floor(hours);
  return `${rounded} ${rounded === 1 ? 'hour' : 'hours'}`;
};
