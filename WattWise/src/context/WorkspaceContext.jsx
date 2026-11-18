/**
 * Shared workspace state. Front-end only — everything lives in React state and
 * is mirrored into localStorage so a refresh keeps your edits. Sprint 2 can
 * swap `persist` for real API calls without touching the pages.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { WorkspaceContext } from './useWorkspace.js';
import {
  DEFAULT_TARGET_HOURS,
  SAMPLE_ALERTS,
  SAMPLE_BATTERY,
  SAMPLE_CONTACTS,
  SAMPLE_DEVICES,
  SAMPLE_PLANS,
  SAMPLE_PROFILE,
} from '../data/sampleData.js';
import { computeEnergy } from '../lib/energy.js';

const STORAGE_KEY = 'wattwise.workspace.v1';

const initialState = {
  signedIn: false,
  devices: SAMPLE_DEVICES,
  battery: SAMPLE_BATTERY,
  targetHours: DEFAULT_TARGET_HOURS,
  profile: SAMPLE_PROFILE,
  alerts: SAMPLE_ALERTS,
  plans: SAMPLE_PLANS,
  contacts: SAMPLE_CONTACTS,
};

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

export function WorkspaceProvider({ children }) {
  const [state, setState] = useState(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (private mode) — the app still works in memory */
    }
  }, [state]);

  const patch = useCallback((changes) => {
    setState((current) => ({ ...current, ...changes }));
  }, []);

  const addDevice = useCallback((device) => {
    setState((current) => ({
      ...current,
      devices: [...current.devices, { ...device, id: `dev-${Date.now()}` }],
    }));
  }, []);

  const updateDevice = useCallback((id, changes) => {
    setState((current) => ({
      ...current,
      devices: current.devices.map((device) =>
        device.id === id ? { ...device, ...changes } : device,
      ),
    }));
  }, []);

  /** Puts previously removed devices back, keeping the original order. */
  const restoreDevices = useCallback((restored) => {
    setState((current) => {
      const existing = new Set(current.devices.map((device) => device.id));
      const missing = restored.filter((device) => !existing.has(device.id));
      if (missing.length === 0) return current;
      return { ...current, devices: [...current.devices, ...missing] };
    });
  }, []);

  const removeDevice = useCallback((id) => {
    setState((current) => ({
      ...current,
      devices: current.devices.filter((device) => device.id !== id),
    }));
  }, []);

  const setBattery = useCallback(
    (changes) => {
      setState((current) => ({
        ...current,
        battery: { ...current.battery, ...changes },
      }));
    },
    [],
  );

  const setTargetHours = useCallback((hours) => {
    setState((current) => ({
      ...current,
      targetHours: Math.min(72, Math.max(1, hours)),
    }));
  }, []);

  const setProfile = useCallback((changes) => {
    setState((current) => ({ ...current, profile: { ...current.profile, ...changes } }));
  }, []);

  const toggleAlert = useCallback((key) => {
    setState((current) => ({
      ...current,
      alerts: { ...current.alerts, [key]: !current.alerts[key] },
    }));
  }, []);

  const signIn = useCallback(() => patch({ signedIn: true }), [patch]);
  const signOut = useCallback(() => patch({ signedIn: false }), [patch]);

  /** Drop lower-priority devices so only essential services stay on. */
  const applyEssentialOnlyPlan = useCallback(() => {
    setState((current) => ({
      ...current,
      devices: current.devices.filter((device) => device.priority <= 2),
    }));
  }, []);

  const resetSampleData = useCallback(() => {
    setState((current) => ({ ...initialState, signedIn: current.signedIn }));
  }, []);

  const energy = useMemo(
    () => computeEnergy(state.devices, state.battery, state.targetHours),
    [state.devices, state.battery, state.targetHours],
  );

  const value = useMemo(
    () => ({
      ...state,
      energy,
      addDevice,
      updateDevice,
      removeDevice,
      restoreDevices,
      setBattery,
      setTargetHours,
      setProfile,
      toggleAlert,
      signIn,
      signOut,
      applyEssentialOnlyPlan,
      resetSampleData,
    }),
    [
      state,
      energy,
      addDevice,
      updateDevice,
      removeDevice,
      restoreDevices,
      setBattery,
      setTargetHours,
      setProfile,
      toggleAlert,
      signIn,
      signOut,
      applyEssentialOnlyPlan,
      resetSampleData,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}
