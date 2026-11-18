export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`toggle${checked ? ' is-on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span className="toggle__knob" />
    </button>
  );
}
