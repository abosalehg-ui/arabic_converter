import { forwardRef } from 'react';
import { TextStats } from './TextStats';

export const TextArea = forwardRef(function TextArea(
  {
    label,
    value,
    onChange,
    placeholder,
    readOnly,
    onKeyDown,
    showStats = true,
    id,
    rows,
    visualPreview = false,
    hint,
  },
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
        className={`field__textarea ${visualPreview ? 'field__textarea--visual' : ''}`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
      />
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {showStats && <TextStats text={value} />}
    </div>
  );
});
