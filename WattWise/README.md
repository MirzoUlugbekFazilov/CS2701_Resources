# WattWise

Front-end for an energy management website for community venues that run on
batteries or renewable power. Built for **Group B7, Sprint 1** (UN SDG 7 —
Affordable and Clean Energy).

The UI is a direct implementation of the team's Figma file
(`3XNfhnxX16hWry56Q9cUJg · WattWise`) — colours, type sizes, spacing and icon
geometry are taken from the design rather than approximated.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run lint     # oxlint
```

## Stack

React 19 + Vite. **No other runtime dependencies** — routing, charts, form
validation and the energy maths are all hand-rolled, so there is nothing extra
to install and no back end to run. The one network call in the app goes
straight from the browser to a public, key-free government API (see below).

## Pages

| Route       | Page                  | Sprint backlog |
| ----------- | --------------------- | -------------- |
| `/`         | Landing               | —              |
| `/signup`   | Create account        | AUTH-001       |
| `/signin`   | Sign in               | Home-001       |
| `/overview` | Energy overview       | Ovw-001        |
| `/devices`  | Devices & calculator  | Dev-001, CAL-001/002 |
| `/budget`   | Energy budget         | Bud-001, Bud-002 |
| `/plan`     | Emergency plan        | Plan-001       |
| `/profile`  | Profile               | —              |

## How it is put together

```
src/
  components/     AppShell (sidebar + top bar + mobile tabs), Icon, DonutChart,
                  AuthLayout, Logo, Toggle
  context/        WorkspaceProvider — devices, battery, target hours, profile
  data/           sampleData.js — the 6 devices and 20 kWh battery from the design
  lib/            energy.js (all calculations), router.js (hash router)
  pages/          one file per route
  styles/         design tokens in index.css; base / shell / pages / auth /
                  landing / print stylesheets
```

### Energy model

Everything on every page is derived from the device list and the battery, so
editing one device updates the whole workspace:

```
energy (kWh) = watts × quantity × hours ÷ 1,000
runtime (h)  = available energy (kWh) ÷ load (kW)
```

Devices at priority 1–2 count as **essential**. With the sample data this gives
exactly the figures in the design: 1.60 kW total, 12.8 kWh available, 8 hours of
runtime, 16 hours on essentials only, and a 3.2 kWh shortfall against a 10-hour
target.

### Form validation (`lib/validation.js`, `lib/useForm.js`)

Email is checked structurally rather than with one catch-all regex: the address
is split into local part and domain so the message can say *which* part is
wrong ("add the part after the @", "the domain needs a dot") instead of a
generic "invalid email". Rules follow the practical subset of RFC 5321/5322 that
real sign-up forms accept — total length ≤ 254, local part ≤ 64, ≥ 2 domain
labels, alphabetic TLD of 2+ characters, no leading/trailing/consecutive dots,
no hyphens at label edges.

A near-miss against a well-known domain (`gmial.com`, `gmail.con`) is shown as a
*non-blocking* suggestion with a one-click fix, because plenty of venues run a
domain that merely looks like a typo.

`useForm` handles the timing: validate on first blur, then re-validate on every
keystroke once a field has shown an error, and on submit validate everything and
move focus to the first problem. The error summary only appears after a submit
attempt (the GOV.UK pattern).

Also validated: UK phone numbers, names, device names (unique), and every
numeric field with explicit min/max/integer rules. Passwords get a live strength
meter with a requirement checklist and a common-password check.

### Interactivity

- Sortable table columns and All / Essential / Lower-priority filters on the overview
- Search across name, category and priority on the devices list
- Donut chart segments highlight on legend hover/focus, with the centre figure swapping to that slice
- Range slider *and* stepper for the backup-power target, both live-recalculating the whole budget
- Remove-with-Undo toasts instead of confirm dialogs
- Figures count up to new values (respecting `prefers-reduced-motion`)
- Roving-tabindex priority selector, `aria-sort` headers, live regions, focus management

### Live grid data (`lib/carbonIntensity.js`)

The budget page pulls current Great Britain carbon intensity and generation mix
from the **National Grid ESO Carbon Intensity API** — public, key-free and
CORS-enabled, so the browser calls it directly and no server of ours is
involved. The data is processed into a renewable share and a charging
recommendation ("good time to charge" / "hold off if you can"), plus the CO₂
avoided by running on stored power. Loading, stale, error and retry states are
all handled; the rest of the app never depends on the request.

### State

`WorkspaceProvider` holds everything in React state and mirrors it to
`localStorage`, so your edits survive a refresh. Sprint 2 can replace that one
write with API calls without touching any page.

### Offline plan (Plan-001-T2)

"Download plan" renders a print-only version of the plan and opens the browser's
print dialog, which saves a real PDF — no PDF library required.

### Responsive

Three breakpoints: full desktop (sidebar + top bar), tablet under 960px (sidebar
becomes a drawer behind the hamburger), and mobile under 760px (bottom tab bar,
single-column cards).
