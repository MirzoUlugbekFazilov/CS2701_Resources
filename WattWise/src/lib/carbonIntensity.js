/**
 * National Grid ESO Carbon Intensity API — https://api.carbonintensity.org.uk
 *
 * Public, key-free and CORS-enabled, so the browser calls it directly: there is
 * no WattWise server anywhere in this request path.
 *
 * Why this source: the assigned SDG is 7 (Affordable and Clean Energy), and the
 * decision our users actually face is *when* to top the battery up from the
 * grid. Live grid carbon intensity and the renewable share answer that, so the
 * data drives a recommendation rather than being decoration.
 */

const BASE = 'https://api.carbonintensity.org.uk';
const TIMEOUT_MS = 8000;

const RENEWABLE_FUELS = ['wind', 'solar', 'hydro', 'biomass'];

const FUEL_LABELS = {
  wind: 'Wind',
  solar: 'Solar',
  hydro: 'Hydro',
  biomass: 'Biomass',
  nuclear: 'Nuclear',
  gas: 'Gas',
  coal: 'Coal',
  imports: 'Imports',
  other: 'Other',
};

const FUEL_COLOURS = {
  wind: 'var(--chart-2)',
  solar: 'var(--chart-3)',
  hydro: '#7f9f8c',
  biomass: '#9cb58b',
  nuclear: '#8ca3b4',
  gas: '#b9a98c',
  coal: '#6f6a63',
  imports: '#c3bdb2',
  other: '#d5d0c6',
};

async function getJson(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Grid data service returned ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches both endpoints together and reduces them to the handful of figures
 * the UI actually shows.
 */
export async function fetchGridSnapshot() {
  const [intensityPayload, generationPayload] = await Promise.all([
    getJson('/intensity'),
    getJson('/generation'),
  ]);

  const period = intensityPayload?.data?.[0];
  const intensity = period?.intensity;
  if (!intensity) throw new Error('Grid data was not in the expected format.');

  // `actual` lags by a settlement period, so fall back to the forecast.
  const gramsPerKWh = intensity.actual ?? intensity.forecast;
  const index = intensity.index ?? 'unknown';

  const mix = (generationPayload?.data?.generationmix ?? [])
    .filter((entry) => entry.perc > 0)
    .sort((a, b) => b.perc - a.perc)
    .map((entry) => ({
      fuel: entry.fuel,
      label: FUEL_LABELS[entry.fuel] ?? entry.fuel,
      percent: entry.perc,
      colour: FUEL_COLOURS[entry.fuel] ?? '#c3bdb2',
      renewable: RENEWABLE_FUELS.includes(entry.fuel),
    }));

  const renewablePercent = mix
    .filter((entry) => entry.renewable)
    .reduce((total, entry) => total + entry.percent, 0);

  const lowCarbonPercent =
    renewablePercent + (mix.find((entry) => entry.fuel === 'nuclear')?.percent ?? 0);

  return {
    gramsPerKWh,
    index,
    renewablePercent: Number(renewablePercent.toFixed(1)),
    lowCarbonPercent: Number(lowCarbonPercent.toFixed(1)),
    mix,
    from: period.from,
    to: period.to,
    fetchedAt: Date.now(),
  };
}

/**
 * Turns the snapshot into the advice a venue manager needs: whether now is a
 * sensible moment to charge the backup battery from the grid.
 */
export function chargingAdvice(snapshot, { chargePercent }) {
  if (!snapshot) return null;

  const cleanGrid = snapshot.index === 'very low' || snapshot.index === 'low';
  const dirtyGrid = snapshot.index === 'high' || snapshot.index === 'very high';
  const batteryLow = chargePercent < 50;

  if (cleanGrid) {
    return {
      tone: 'good',
      headline: 'Good time to charge',
      detail: `The grid is ${snapshot.index} carbon and ${snapshot.renewablePercent}% renewable right now. Topping the battery up now stores cleaner energy for the next outage.`,
    };
  }

  if (dirtyGrid && !batteryLow) {
    return {
      tone: 'hold',
      headline: 'Hold off if you can',
      detail: `The grid is ${snapshot.index} carbon at ${snapshot.gramsPerKWh} gCO₂/kWh. With the battery at ${Math.round(chargePercent)}% you can afford to wait for a cleaner period.`,
    };
  }

  if (dirtyGrid && batteryLow) {
    return {
      tone: 'hold',
      headline: 'Charge anyway — resilience first',
      detail: `The grid is ${snapshot.index} carbon, but the battery is only at ${Math.round(chargePercent)}%. Keeping essential services covered matters more than the carbon saving.`,
    };
  }

  return {
    tone: 'neutral',
    headline: 'Grid is about average',
    detail: `${snapshot.gramsPerKWh} gCO₂/kWh with ${snapshot.renewablePercent}% renewables. No strong reason to change your charging plan.`,
  };
}

/** Carbon avoided by running the venue off a charged battery instead of the grid. */
export function carbonAvoided(snapshot, availableKWh) {
  if (!snapshot) return null;
  const grams = snapshot.gramsPerKWh * availableKWh;
  return {
    grams,
    kilograms: grams / 1000,
  };
}
