/**
 * Form state with the validation timing real products use:
 *
 *   - never shout at a field the user has not finished with yet;
 *   - validate a field the first time it loses focus;
 *   - once a field has shown an error, re-validate on every keystroke so the
 *     error clears the moment it is fixed;
 *   - on submit, validate everything and move focus to the first problem.
 *
 * Validating only on submit makes users hunt for mistakes; validating on every
 * keystroke from the start flags "n" as an invalid email while they type. This
 * hybrid is the compromise both the Nielsen Norman Group and the GOV.UK Design
 * System recommend.
 */

import { useCallback, useMemo, useRef, useState } from 'react';

export default function useForm({ initialValues, validators, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [results, setResults] = useState({});
  const [submitting, setSubmitting] = useState(false);
  // The error summary only appears once the user has tried to submit — the
  // GOV.UK pattern. Showing it mid-typing is nagging rather than helpful.
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const fieldRefs = useRef({});

  const runValidator = useCallback(
    (field, nextValues) => {
      const validator = validators[field];
      if (!validator) return { valid: true };
      return validator(nextValues[field], nextValues) ?? { valid: true };
    },
    [validators],
  );

  const setValue = useCallback(
    (field, value) => {
      setValues((current) => {
        const next = { ...current, [field]: value };
        // Only re-validate live if this field has already been through a blur,
        // i.e. the user has seen feedback for it at least once.
        setResults((previous) =>
          previous[field] === undefined
            ? previous
            : { ...previous, [field]: runValidator(field, next) },
        );
        return next;
      });
    },
    [runValidator],
  );

  const handleBlur = useCallback(
    (field) => {
      setTouched((current) => ({ ...current, [field]: true }));
      setResults((current) => ({ ...current, [field]: runValidator(field, values) }));
    },
    [runValidator, values],
  );

  const registerRef = useCallback((field) => (node) => {
    fieldRefs.current[field] = node;
  }, []);

  const validateAll = useCallback(() => {
    const next = {};
    Object.keys(validators).forEach((field) => {
      next[field] = runValidator(field, values);
    });
    setResults(next);
    setTouched(
      Object.keys(validators).reduce((acc, field) => ({ ...acc, [field]: true }), {}),
    );
    return next;
  }, [runValidator, validators, values]);

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault?.();
      setSubmitAttempted(true);
      const next = validateAll();

      const firstInvalid = Object.keys(validators).find((field) => next[field]?.valid === false);
      if (firstInvalid) {
        const node = fieldRefs.current[firstInvalid];
        node?.focus?.();
        node?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        return;
      }

      setSubmitting(true);
      try {
        // Values are normalised by the validators (trimmed, lower-cased email).
        const clean = Object.keys(values).reduce((acc, field) => {
          const result = next[field];
          acc[field] = result && 'value' in result ? result.value : values[field];
          return acc;
        }, {});
        await onSubmit(clean);
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmit, validateAll, validators, values],
  );

  const reset = useCallback(
    (nextValues = initialValues) => {
      setValues(nextValues);
      setTouched({});
      setResults({});
      setSubmitAttempted(false);
    },
    [initialValues],
  );

  /** Everything a Field needs, in one spread. */
  const field = useCallback(
    (name) => {
      const result = results[name];
      return {
        name,
        value: values[name],
        error: result?.valid === false ? result.error : undefined,
        warning: result?.valid === true ? result.warning : undefined,
        suggestion: result?.valid === true ? result.suggestion : undefined,
        valid: result?.valid === true && !result.warning && Boolean(values[name]),
        inputRef: registerRef(name),
        onChange: (value) => setValue(name, value),
        onBlur: () => handleBlur(name),
      };
    },
    [handleBlur, registerRef, results, setValue, values],
  );

  const isValid = useMemo(
    () => Object.keys(validators).every((name) => results[name]?.valid !== false),
    [results, validators],
  );

  const errorCount = useMemo(
    () =>
      submitAttempted
        ? Object.values(results).filter((result) => result?.valid === false).length
        : 0,
    [results, submitAttempted],
  );

  return {
    values,
    setValue,
    setValues,
    field,
    touched,
    results,
    errorCount,
    submitAttempted,
    isValid,
    submitting,
    handleSubmit,
    validateAll,
    reset,
  };
}
