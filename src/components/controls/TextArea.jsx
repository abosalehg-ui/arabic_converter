import { forwardRef } from 'react';
import { TextStats } from './TextStats';

export const TextArea = forwardRef(function TextArea(
  { label, value, onChange, placeholder, readOnly, onKeyDown, showStats = true, id, rows },
  ref
) {
  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        className="field__textarea"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
      />
      {showStats && <TextStats text={value} />}
    </div>
  );
});
