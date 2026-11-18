import Icon from './Icon.jsx';
import { PASSWORD_RULES, passwordStrength } from '../lib/validation.js';

/**
 * Live strength meter with a requirement checklist.
 *
 * Showing *which* rules are still unmet is more useful than a bare
 * weak/strong bar — the user can see exactly what to add instead of guessing.
 */
export default function PasswordStrength({ value }) {
  if (!value) return null;

  const strength = passwordStrength(value);
  const percent = (Math.min(strength.score, strength.max) / strength.max) * 100;

  return (
    <div className="strength">
      <div className="strength__head">
        <div className="strength__track">
          <div
            className={`strength__fill strength__fill--${strength.tone}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={`strength__label strength__label--${strength.tone}`}>
          {strength.label}
        </span>
      </div>

      <ul className="strength__rules">
        {PASSWORD_RULES.map((rule) => {
          const met = strength.met.includes(rule.id);
          return (
            <li key={rule.id} className={met ? 'is-met' : ''}>
              <span className="strength__mark" aria-hidden="true">
                {met ? <Icon name="check" size={10} /> : <span className="strength__dot" />}
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>

      <p className="sr-only" aria-live="polite">
        Password strength: {strength.label}
      </p>
    </div>
  );
}
