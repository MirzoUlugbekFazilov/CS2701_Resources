/**
 * Sample workspace used across the prototype. The numbers reproduce the figures
 * shown in the Figma design: 6 devices drawing 1.60 kW against a 20 kWh battery
 * at 64% charge (12.8 kWh available → 8 hours of runtime).
 */

export const PRIORITY_LABELS = {
  1: 'Critical',
  2: 'High',
  3: 'Standard',
  4: 'Low',
  5: 'Optional',
};

/** Devices at priority 1–2 are treated as essential services. */
export const ESSENTIAL_MAX_PRIORITY = 2;

export const CATEGORIES = [
  'Lighting',
  'Refrigeration',
  'Heating',
  'Office equipment',
  'Audio visual',
  'Communications',
  'Medical equipment',
  'Catering',
  'Other',
];

export const ROLES = [
  'Venue manager',
  'Facilities lead',
  'Duty manager',
  'Trustee',
  'Volunteer',
  'Other',
];

export const SAMPLE_DEVICES = [
  {
    id: 'dev-fridge',
    name: 'Cold storage fridge',
    category: 'Refrigeration',
    watts: 450,
    quantity: 1,
    hours: 8,
    priority: 1,
  },
  {
    id: 'dev-lighting',
    name: 'Essential lighting',
    category: 'Lighting',
    watts: 200,
    quantity: 1,
    hours: 8,
    priority: 1,
  },
  {
    id: 'dev-router',
    name: 'Wi-Fi router',
    category: 'Communications',
    watts: 50,
    quantity: 1,
    hours: 8,
    priority: 1,
  },
  {
    id: 'dev-charging',
    name: 'Charging station',
    category: 'Office equipment',
    watts: 100,
    quantity: 1,
    hours: 8,
    priority: 2,
  },
  {
    id: 'dev-projector',
    name: 'Projector',
    category: 'Audio visual',
    watts: 200,
    quantity: 1,
    hours: 8,
    priority: 4,
  },
  {
    id: 'dev-heater',
    name: 'Portable heater',
    category: 'Heating',
    watts: 600,
    quantity: 1,
    hours: 8,
    priority: 5,
  },
];

export const SAMPLE_BATTERY = {
  capacityKWh: 20,
  chargePercent: 64,
};

export const SAMPLE_PROFILE = {
  fullName: 'Amira Hassan',
  email: 'amira.hassan@riverside.org',
  role: 'Venue manager',
  phone: '+44 7000 000000',
  venueName: 'Riverside Community Centre',
  memberSince: '18 November 2026',
  passwordChanged: '18 Nov 2026',
  twoStepEnabled: false,
};

export const SAMPLE_ALERTS = {
  lowBattery: true,
  almostOverBudget: true,
  weeklySummary: false,
};

export const SAMPLE_PLANS = [
  { id: 'plan-winter', name: 'Winter outage plan', updated: 'Updated 2 days ago' },
  { id: 'plan-event', name: 'Event night plan', updated: 'Updated 1 week ago' },
];

export const SAMPLE_CONTACTS = {
  emergencyLead: '',
  energySupplier: '',
};

export const DEFAULT_TARGET_HOURS = 10;
