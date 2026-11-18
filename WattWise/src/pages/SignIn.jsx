import AuthLayout, { AuthTabs } from '../components/AuthLayout.jsx';
import Field, { PasswordField } from '../components/Field.jsx';
import { useWorkspace } from '../context/useWorkspace.js';
import { useToast } from '../lib/toast.js';
import { navigate } from '../lib/router.js';
import useForm from '../lib/useForm.js';
import { validateVenueIdOrEmail } from '../lib/validation.js';

export default function SignIn() {
  const { signIn } = useWorkspace();
  const toast = useToast();

  const form = useForm({
    initialValues: { venueId: '', password: '', remember: false },
    validators: {
      // Accepts a venue ID *or* an email; the full email rules only apply once
      // an @ is present, so staff signing in with an ID are not blocked.
      venueId: (value) => validateVenueIdOrEmail(value),
      password: (value) =>
        value ? { valid: true, value } : { valid: false, error: 'Enter your password.' },
    },
    onSubmit: (values) => {
      signIn();
      toast.success(`Signed in as ${values.venueId}.`);
      navigate('/overview');
    },
  });

  const venue = form.field('venueId');
  const password = form.field('password');

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      headline="Welcome back to your "
      highlight="energy workspace."
      intro="Check your battery, review priorities and keep your outage plan up to date."
    >
      <a className="auth__back" href="#/">
        ← Back to home
      </a>

      <AuthTabs active="signin" />

      <h2 className="auth__title">Welcome back</h2>
      <p className="auth__sub">Sign in to your community&rsquo;s energy workspace.</p>

      <form className="auth-form" onSubmit={form.handleSubmit} noValidate>
        {form.errorCount > 0 && (
          <p className="form-summary" role="alert">
            {form.errorCount === 1
              ? 'There is 1 problem below.'
              : `There are ${form.errorCount} problems below.`}
          </p>
        )}

        <Field
          label="Venue ID or email"
          type="text"
          inputMode="email"
          autoComplete="username"
          spellCheck="false"
          autoCapitalize="off"
          placeholder="e.g. riverside@community.org"
          value={venue.value}
          error={venue.error}
          warning={venue.warning}
          suggestion={venue.suggestion}
          valid={venue.valid}
          inputRef={venue.inputRef}
          onApplySuggestion={(fixed) => form.setValue('venueId', fixed)}
          onChange={(event) => venue.onChange(event.target.value)}
          onBlur={venue.onBlur}
        />

        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password.value}
          error={password.error}
          inputRef={password.inputRef}
          onChange={(event) => password.onChange(event.target.value)}
          onBlur={password.onBlur}
          asideLink={
            <a className="field__aside-link" href="#/signin">
              Forgot password?
            </a>
          }
        />

        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.values.remember}
            onChange={(event) => form.setValue('remember', event.target.checked)}
          />
          <span className="checkbox__box" aria-hidden="true" />
          Remember me on this device
        </label>

        <button
          type="submit"
          className="btn btn--dark btn--block btn--lg"
          disabled={form.submitting}
        >
          {form.submitting ? 'Signing in…' : 'Sign in to workspace'}
        </button>

        <p className="auth__foot">
          New to WattWise? <a href="#/signup">Create an account</a>
        </p>
      </form>

      <div className="auth__help">
        <span className="auth__help-mark" aria-hidden="true">
          ?
        </span>
        <div>
          <p className="auth__help-title">Need help signing in?</p>
          <p className="auth__help-text">Contact your venue administrator.</p>
        </div>
      </div>
    </AuthLayout>
  );
}
