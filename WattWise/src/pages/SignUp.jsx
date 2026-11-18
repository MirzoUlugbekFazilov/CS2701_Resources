import AuthLayout, { AuthTabs } from '../components/AuthLayout.jsx';
import Field, { PasswordField } from '../components/Field.jsx';
import PasswordStrength from '../components/PasswordStrength.jsx';
import { useWorkspace } from '../context/useWorkspace.js';
import { ROLES } from '../data/sampleData.js';
import { useToast } from '../lib/toast.js';
import { navigate } from '../lib/router.js';
import useForm from '../lib/useForm.js';
import {
  validateEmail,
  validateName,
  validatePassword,
  validateRequired,
} from '../lib/validation.js';

export default function SignUp() {
  const { signIn, setProfile } = useWorkspace();
  const toast = useToast();

  const form = useForm({
    initialValues: {
      fullName: '',
      email: '',
      venueName: '',
      role: '',
      password: '',
      terms: false,
    },
    validators: {
      fullName: (value) => validateName(value),
      email: (value) => validateEmail(value, { label: 'work email' }),
      venueName: (value) => validateRequired(value, 'your venue name'),
      role: (value) =>
        value ? { valid: true, value } : { valid: false, error: 'Select your role.' },
      password: (value) => validatePassword(value),
      terms: (value) =>
        value
          ? { valid: true, value }
          : { valid: false, error: 'Please accept the Terms of Use and Privacy Policy.' },
    },
    onSubmit: (values) => {
      setProfile({
        fullName: values.fullName,
        email: values.email,
        venueName: values.venueName,
        role: values.role,
      });
      signIn();
      toast.success(`Welcome to WattWise, ${values.fullName.split(' ')[0]}.`);
      navigate('/overview');
    },
  });

  const fullName = form.field('fullName');
  const email = form.field('email');
  const venueName = form.field('venueName');
  const role = form.field('role');
  const password = form.field('password');
  const terms = form.field('terms');

  return (
    <AuthLayout
      eyebrow="JOIN WATTWISE"
      headline="Create your venue's "
      highlight="energy workspace."
      intro="Join community venues planning for outages before they happen."
    >
      <a className="auth__back" href="#/">
        ← Back to home
      </a>

      <AuthTabs active="signup" />

      <h2 className="auth__title">Create your account</h2>
      <p className="auth__sub">Start planning for outages in a few minutes.</p>

      <form className="auth-form auth-form--tight" onSubmit={form.handleSubmit} noValidate>
        {form.errorCount > 0 && (
          <p className="form-summary" role="alert">
            {form.errorCount === 1
              ? 'There is 1 problem below.'
              : `There are ${form.errorCount} problems below.`}
          </p>
        )}

        <Field
          label="Full name"
          autoComplete="name"
          placeholder="e.g. Amira Hassan"
          value={fullName.value}
          error={fullName.error}
          valid={fullName.valid}
          inputRef={fullName.inputRef}
          onChange={(event) => fullName.onChange(event.target.value)}
          onBlur={fullName.onBlur}
        />

        <Field
          label="Work email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck="false"
          autoCapitalize="off"
          placeholder="name@yourvenue.org"
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

        <Field
          label="Venue name"
          autoComplete="organization"
          placeholder="e.g. Riverside Community Centre"
          value={venueName.value}
          error={venueName.error}
          valid={venueName.valid}
          inputRef={venueName.inputRef}
          onChange={(event) => venueName.onChange(event.target.value)}
          onBlur={venueName.onBlur}
        />

        <Field label="Your role" error={role.error} inputRef={role.inputRef}>
          {({ id, describedBy, inputRef }) => (
            <div className="select-wrap">
              <select
                id={id}
                ref={inputRef}
                className={`input input--lg${role.error ? ' has-error' : ''}`}
                value={role.value}
                aria-invalid={Boolean(role.error)}
                aria-describedby={describedBy}
                onChange={(event) => role.onChange(event.target.value)}
                onBlur={role.onBlur}
              >
                <option value="">Select your role</option>
                {ROLES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </Field>

        <div>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password.value}
            error={password.error}
            warning={password.warning}
            inputRef={password.inputRef}
            onChange={(event) => password.onChange(event.target.value)}
            onBlur={password.onBlur}
          />
          <PasswordStrength value={password.value} />
        </div>

        <div>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.values.terms}
              onChange={(event) => form.setValue('terms', event.target.checked)}
              onBlur={terms.onBlur}
            />
            <span className="checkbox__box" aria-hidden="true" />
            I agree to the Terms of Use and Privacy Policy
          </label>
          {terms.error && (
            <p className="field__message field__message--error" role="alert">
              <span aria-hidden="true">↑ </span>
              {terms.error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn--dark btn--block btn--lg"
          disabled={form.submitting}
        >
          {form.submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth__foot">
          Already have an account? <a href="#/signin">Sign in</a>
        </p>
      </form>
    </AuthLayout>
  );
}
