import type { ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  optional?: string;
  /** `null`: контрола с id нет (ошибка загрузки тренеров), метка выводится без `for`. */
  labelFor?: string | null;
  hint?: string;
  counter?: string;
  error?: string;
  children: ReactNode;
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="field-error">
      <span aria-hidden="true">! </span>
      {children}
    </p>
  );
}

/** Метка, контрол, подсказка, счётчик и ошибка поля. Контрол получает `ariaFor` от вызывающего. */
export function Field({ id, label, optional, labelFor, hint, counter, error, children }: FieldProps) {
  const target = labelFor === undefined ? id : labelFor;
  return (
    <div className="field">
      {target === null ? (
        <span className="field-label">{label}</span>
      ) : (
        <label className="field-label" htmlFor={target}>
          {label}
          {optional ? <span className="field-optional"> {optional}</span> : null}
        </label>
      )}
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
      {counter ? (
        <p id={`${id}-counter`} className="field-hint">
          {counter}
        </p>
      ) : null}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  );
}
