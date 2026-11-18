import { useId, useState } from 'react';
import Icon from './Icon.jsx';

/**
 * A labelled input with accessible error/warning messaging.
 *
 * The message is wired to the input with `aria-describedby` and marked
 * `role="alert"`, so screen readers announce the problem when it appears rather
 * than leaving it as colour-only feedback. `aria-invalid` mirrors the visual
 * red border for the same reason.
 */
export default function Field({
  label,
  hint,
  error,
  warning,
  suggestion,
  valid,
  onApplySuggestion,
  asideLink,
  children,
  inputRef,
  className = '',
  ...inputProps
}) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error || warning || hint;
  const tone = error ? 'error' : warning ? 'warning' : 'hint';

  return (
    <div className={`field ${className}`.trim()}>
      {asideLink ? (
        <div className="field__label-row">
          <label className="field__label" htmlFor={id}>
            {label}
          </label>
          {asideLink}
        </div>
      ) : (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}

      <div className={`field__control${valid ? ' is-valid' : ''}`}>
        {children ? (
          // `inputRef` is a callback ref function (see useForm.registerRef), not
          // a ref object — nothing reads `.current` here, so passing it through
          // the render prop is safe.
          // eslint-disable-next-line react/refs
          children({ id, describedBy: message ? messageId : undefined, inputRef })
        ) : (
          <input
            id={id}
            ref={inputRef}
            className={`input input--lg${error ? ' has-error' : ''}${valid ? ' is-valid' : ''}`}
            aria-invalid={Boolean(error)}
            aria-describedby={message ? messageId : undefined}
            {...inputProps}
          />
        )}
        {valid && (
          <span className="field__tick" aria-hidden="true">
            <Icon name="check" size={12} />
          </span>
        )}
      </div>

      {message && (
        <p
          id={messageId}
          className={`field__message field__message--${tone}`}
          role={error || warning ? 'alert' : undefined}
        >
          {error && <span aria-hidden="true">↑ </span>}
          {message}
          {suggestion && onApplySuggestion && (
            <button
              type="button"
              className="field__fix"
              onClick={() => onApplySuggestion(suggestion)}
            >
              Use it
            </button>
          )}
        </p>
      )}
    </div>
  );
}

/** Text input with a Show/Hide toggle, as in the design. */
export function PasswordField({ label, error, warning, hint, inputRef, asideLink, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      label={label}
      error={error}
      warning={warning}
      hint={hint}
      asideLink={asideLink}
      inputRef={inputRef}
    >
      {({ id, describedBy, inputRef: ref }) => (
        <div className="input-affix">
          <input
            id={id}
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={`input input--lg${error ? ' has-error' : ''}`}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            {...props}
          />
          <button
            type="button"
            className="input-affix__action"
            aria-pressed={visible}
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
      )}
    </Field>
  );
}
