// Small pill to turn the 3D flight on/off (it is the heaviest part of the site).
export default function JourneyToggle({ on, onToggle }) {
  return (
    <button type="button" className="jtoggle mono cursor-target" onClick={onToggle} aria-pressed={on} title={on ? 'Turn off the 3D flight' : 'Turn on the 3D flight'}>
      <span className={`jdot${on ? ' on' : ''}`} /> 3D flight {on ? 'on' : 'off'}
    </button>
  );
}
