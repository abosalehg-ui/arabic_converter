/**
 * Progress indicator for long conversions.
 *
 * Falls back to an indeterminate bar when the worker has not reported a
 * fraction yet, so the user always sees that work is happening.
 */
export function Progress({ value, label }) {
  const percent = Math.round((value ?? 0) * 100);
  const indeterminate = !value;

  return (
    <div className="progress">
      <span className="progress__label">{label}</span>
      <div
        className="progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : percent}
      >
        <div
          className={`progress__bar ${indeterminate ? 'progress__bar--indeterminate' : ''}`}
          style={indeterminate ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
