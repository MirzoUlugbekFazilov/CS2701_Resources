import Icon from './Icon.jsx';

/** The WattWise lockup: lime bolt on a green rounded mark. */
export default function Logo({ size = 'md', tone = 'dark', href = '#/' }) {
  return (
    <a className={`logo logo--${size} logo--${tone}`} href={href}>
      <span className="logo__mark" aria-hidden="true">
        <Icon name="bolt" />
      </span>
      <span className="logo__word">WattWise</span>
    </a>
  );
}
