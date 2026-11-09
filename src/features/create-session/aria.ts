interface AriaOptions {
  hint?: boolean;
  counter?: boolean;
  error?: boolean;
  /** Дополнительные id описаний (общая ошибка пары Date/Start time, единица измерения). */
  extra?: readonly string[];
  /** По умолчанию равно `error`. */
  invalid?: boolean;
}

/** `aria-invalid` и `aria-describedby` для контрола поля `id`; id описаний совпадают с `Field`. */
export function ariaFor(id: string, options: AriaOptions = {}) {
  const ids: string[] = [];
  if (options.hint) ids.push(`${id}-hint`);
  if (options.counter) ids.push(`${id}-counter`);
  if (options.extra) ids.push(...options.extra);
  if (options.error) ids.push(`${id}-error`);
  const invalid = options.invalid ?? options.error ?? false;
  return {
    "aria-invalid": invalid ? (true as const) : undefined,
    "aria-describedby": ids.length > 0 ? ids.join(" ") : undefined,
  };
}
