import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type SyntheticEvent,
} from "react";
import { SESSION_TYPES, VISIBILITIES } from "../../shared/api/types.ts";
import type { SessionType, Visibility } from "../../shared/api/types.ts";
import { currentTime, formatTimeZoneName } from "../../shared/lib/datetime.ts";
import { copy } from "./copy.ts";
import { ariaFor } from "./aria.ts";
import { Field, FieldError } from "./Field.tsx";
import {
  ERROR_ORDER,
  FIELD_SERVER_KEY,
  INITIAL_VALUES,
  isDirty,
  splitServerErrors,
  toRequest,
  type ErrorKey,
  type FieldName,
  type FormValues,
} from "./form-values.ts";
import { SuccessScreen } from "./SuccessScreen.tsx";
import { useCoaches } from "./useCoaches.ts";
import { useCreateSession } from "./useCreateSession.ts";
import { LIMITS, validate } from "./validate.ts";

export interface CreateSessionDialogProps {
  /** Активны ли фильтры списка (подсказка и «Clear filters» на экране успеха). */
  filtersActive: boolean;
  /** Закрытие диалога; `refetch` — исход POST был неизвестен (сеть, malformed), список нужно перезапросить. */
  onClose: (result: { refetch: boolean }) => void;
  /** Сессия создана (201): владелец списка перезапрашивает его. */
  onCreated: () => void;
  onOpenSession: (id: string) => void;
  onClearFilters: () => void;
}

const FIELD_IDS: Record<ErrorKey, string> = {
  title: "cs-title",
  type: "cs-type",
  date: "cs-date",
  time: "cs-time",
  startsAt: "cs-date",
  duration: "cs-duration",
  capacity: "cs-capacity",
  coachId: "cs-coach",
  locationName: "cs-location-name",
  locationAddress: "cs-location-address",
  visibility: "cs-visibility-public",
  description: "cs-description",
  trainerNotes: "cs-notes",
};

const COACH_RETRY_ID = "cs-coaches-retry";
const DESCRIPTION_COUNTER_FROM = 800;
const NOTES_COUNTER_FROM = 400;

/** Фокус при открытии: Title на десктопе, заголовок при coarse-указателе (клавиатура не поднимается). */
function focusInitial(dialog: HTMLElement): void {
  const coarse = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  const target = coarse ? dialog.querySelector<HTMLElement>("h2") : document.getElementById(FIELD_IDS.title);
  target?.focus({ preventScroll: true });
}

function restoreFocus(opener: HTMLElement | null): void {
  // Открыватель мог исчезнуть (кнопка пустого состояния): запасной вариант — кнопка в шапке.
  const target = opener?.isConnected ? opener : document.querySelector<HTMLElement>("[data-create-trigger]");
  target?.focus();
}

function isSessionType(value: string): value is SessionType {
  return (SESSION_TYPES as readonly string[]).includes(value);
}

function isVisibility(value: string): value is Visibility {
  return (VISIBILITIES as readonly string[]).includes(value);
}

/**
 * Форма создания во втором нативном `<dialog>` без URL. Монтируется только пока форма открыта
 * (состояние открытости в `app`); при размонтировании закрывает диалог и возвращает фокус.
 */
export function CreateSessionDialog({
  filtersActive,
  onClose,
  onCreated,
  onOpenSession,
  onClearFilters,
}: CreateSessionDialogProps) {
  const coaches = useCoaches();
  const create = useCreateSession(coaches);
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<FieldName, true>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attention, setAttention] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [seenCoaches, setSeenCoaches] = useState(coaches.coaches);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const closing = useRef(false);
  const skipRestore = useRef(false);
  const outcomeUnknown = useRef(false);
  const coachRetrying = useRef(false);
  const restoreAfterConfirm = useRef<HTMLElement | null>(null);
  const beforeConfirm = useRef<HTMLElement | null>(null);

  const pending = create.status === "pending";
  const createdSession = create.status === "success" ? create.session : null;
  const succeeded = createdSession !== null;
  const coachIds = coaches.status === "success" ? coaches.coaches.map((coach) => coach.id) : [];

  // Выбранный тренер исчез из обновлённого списка: выбор сбрасывается с ошибкой (ui-design 6.4).
  if (coaches.status === "success" && seenCoaches !== coaches.coaches) {
    setSeenCoaches(coaches.coaches);
    if (values.coachId !== "" && !coachIds.includes(values.coachId)) {
      setValues({ ...values, coachId: "" });
      setTouched({ ...touched, coachId: true });
    }
  }

  const clientErrors = validate(values, { now: currentTime(), coachIds });
  const server = splitServerErrors(create.fieldErrors);
  const unmatchedErrors = server.unmatched;

  function shown(key: ErrorKey): string | undefined {
    const serverMessage = server.fields[key];
    if (serverMessage !== undefined) return serverMessage;
    const clientMessage = clientErrors[key];
    if (clientMessage === undefined) return undefined;
    if (submitted) return clientMessage;
    if (key === "startsAt") return touched.date && touched.time ? clientMessage : undefined;
    return touched[key] ? clientMessage : undefined;
  }

  const errors: Partial<Record<ErrorKey, string>> = {};
  for (const key of ERROR_ORDER) errors[key] = shown(key);

  // Открытие: showModal, фокус; закрытие при размонтировании и возврат фокуса на открыватель.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    closing.current = false;
    const active = document.activeElement;
    const opener = active instanceof HTMLElement ? active : null;
    if (!dialog.open) dialog.showModal();
    return () => {
      closing.current = true;
      if (dialog.open) dialog.close();
      if (!skipRestore.current) restoreFocus(opener);
    };
  }, []);

  // Фокус по виду: форма (в том числе «Create another») или экран успеха.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (succeeded) headingRef.current?.focus({ preventScroll: true });
    else focusInitial(dialog);
  }, [succeeded]);

  // Подтверждение закрытия: фокус на «Keep editing»; при отказе возврат туда, где был фокус.
  useEffect(() => {
    if (confirming) {
      keepRef.current?.focus();
      return;
    }
    const previous = restoreAfterConfirm.current;
    if (previous === null) return;
    restoreAfterConfirm.current = null;
    (previous.isConnected ? previous : cancelRef.current)?.focus();
  }, [confirming]);

  // Повтор загрузки тренеров: фокус на select после успеха, на кнопку повтора после новой ошибки.
  useEffect(() => {
    if (!coachRetrying.current || coaches.status === "loading") return;
    coachRetrying.current = false;
    if (coaches.status === "success" && coaches.coaches.length > 0) selectRef.current?.focus();
    else document.getElementById(COACH_RETRY_ID)?.focus();
  }, [coaches.status, coaches.coaches]);

  function focusField(key: ErrorKey): void {
    const coachProblem = key === "coachId" && !(coaches.status === "success" && coaches.coaches.length > 0);
    const id = coachProblem ? COACH_RETRY_ID : FIELD_IDS[key];
    document.getElementById(id)?.focus();
  }

  const reportCreateError = useEffectEvent(() => {
    const first = ERROR_ORDER.find((key) => server.fields[key] !== undefined);
    if (first === undefined) blockRef.current?.focus();
    else focusField(first);
  });
  useEffect(() => {
    if (create.error !== null) reportCreateError();
  }, [create.error]);

  function doClose(): void {
    onClose({ refetch: outcomeUnknown.current });
  }

  function requestClose(): void {
    if (pending) return;
    if (succeeded || !isDirty(values)) {
      doClose();
      return;
    }
    const active = document.activeElement;
    beforeConfirm.current = active instanceof HTMLElement ? active : null;
    setConfirming(true);
  }

  function keepEditing(): void {
    restoreAfterConfirm.current = beforeConfirm.current ?? cancelRef.current;
    setConfirming(false);
  }

  function handleCancelEvent(event: SyntheticEvent<HTMLDialogElement>): void {
    // Esc: нативное закрытие отменяется, решает процедура закрытия.
    event.preventDefault();
    if (confirming) return;
    requestClose();
  }

  function handleNativeClose(): void {
    // Браузер мог закрыть диалог повторным Esc несмотря на отменённый `cancel`: возвращаем модальность.
    const dialog = dialogRef.current;
    // Закрытие нами (cleanup) и StrictMode-перемонтирование (диалог уже снова открыт) не обрабатываются.
    if (closing.current || dialog === null || dialog.open) return;
    dialog.showModal();
    if (!confirming) requestClose();
  }

  function change(name: FieldName, value: string): void {
    setValues((current) => ({ ...current, [name]: value }));
    create.clearFieldError(FIELD_SERVER_KEY[name]);
  }

  /**
   * Blur считается уходом пользователя с поля, только пока диалог открыт. Закрытие диалога
   * (в том числе служебное в эффекте при StrictMode-перемонтировании) снимает фокус с Title,
   * и без этой проверки ошибка показывалась бы при открытии формы (AC-3.9).
   */
  function markTouched(name: FieldName): void {
    if (dialogRef.current?.open !== true) return;
    setTouched((current) => ({ ...current, [name]: true }));
  }

  function inputProps(name: FieldName) {
    return {
      name,
      value: values[name],
      readOnly: pending,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => change(name, event.target.value),
      onBlur: () => markTouched(name),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending || confirming) return;
    setSubmitted(true);
    const invalid = ERROR_ORDER.filter((key) => clientErrors[key] !== undefined);
    if (invalid.length > 0) {
      setAttention(invalid.length);
      focusField(invalid[0]);
      return;
    }
    setAttention(0);
    const request = toRequest(values);
    if (request === null) return;
    // Фокус остаётся на кнопке отправки: поля блокируются, фокус не теряется.
    submitRef.current?.focus();
    const outcome = await create.submit(request);
    if (outcome.kind === "success") onCreated();
    else if (outcome.kind === "error" && outcome.error.kind !== "api") outcomeUnknown.current = true;
    else if (outcome.kind === "blocked") focusField("coachId");
  }

  function createAnother(): void {
    setValues(INITIAL_VALUES);
    setTouched({});
    setSubmitted(false);
    setAttention(0);
    create.reset();
  }

  function openSession(): void {
    if (create.session === null) return;
    skipRestore.current = true;
    onOpenSession(create.session.id);
  }

  const startsAtShown = errors.startsAt !== undefined;
  const timeZone = formatTimeZoneName(currentTime());
  // Счётчики считают так же, как validate: после trim.
  const descriptionLength = values.description.trim().length;
  const notesLength = values.trainerNotes.trim().length;
  const coachFieldError = errors.coachId;
  const coachListUsable = coaches.status === "success" && coaches.coaches.length > 0;

  return (
    <dialog
      ref={dialogRef}
      className="dialog form-dialog"
      aria-labelledby="create-title"
      onCancel={handleCancelEvent}
      onClose={handleNativeClose}
    >
      <div className="dialog-frame">
        <header className="dialog-header">
          <div className="dialog-header-main">
            {succeeded ? null : (
              <h2 id="create-title" ref={headingRef} tabIndex={-1}>
                {copy.dialogTitle}
              </h2>
            )}
          </div>
          <button
            type="button"
            className="dialog-close"
            aria-label={copy.closeAria}
            disabled={pending}
            onClick={requestClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        {createdSession !== null ? (
          <SuccessScreen
            session={createdSession}
            filtersActive={filtersActive}
            headingRef={headingRef}
            onOpenSession={openSession}
            onCreateAnother={createAnother}
            onClearFilters={onClearFilters}
            onClose={doClose}
          />
        ) : (
          <form className="create-form" noValidate aria-busy={pending} onSubmit={handleSubmit}>
            <div className="dialog-body">
              <Field id="cs-title" label={copy.labels.title} hint={copy.hints.title} error={errors.title}>
                <input
                  id="cs-title"
                  type="text"
                  autoComplete="off"
                  {...inputProps("title")}
                  {...ariaFor("cs-title", { hint: true, error: errors.title !== undefined })}
                />
              </Field>

              <Field id="cs-type" label={copy.labels.type} error={errors.type}>
                <select
                  id="cs-type"
                  name="type"
                  value={values.type}
                  disabled={pending}
                  onChange={(event) => {
                    if (isSessionType(event.target.value)) change("type", event.target.value);
                  }}
                  {...ariaFor("cs-type", { error: errors.type !== undefined })}
                >
                  {SESSION_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {copy.typeOptions[value]}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="field-row">
                <Field id="cs-date" label={copy.labels.date} error={errors.date}>
                  <input
                    id="cs-date"
                    type="date"
                    autoComplete="off"
                    {...inputProps("date")}
                    {...ariaFor("cs-date", {
                      error: errors.date !== undefined,
                      invalid: errors.date !== undefined || startsAtShown,
                      extra: startsAtShown ? ["cs-starts-at-error"] : [],
                    })}
                  />
                </Field>
                <Field id="cs-time" label={copy.labels.time} hint={copy.hints.time(timeZone)} error={errors.time}>
                  <input
                    id="cs-time"
                    type="time"
                    autoComplete="off"
                    {...inputProps("time")}
                    {...ariaFor("cs-time", {
                      hint: true,
                      error: errors.time !== undefined,
                      invalid: errors.time !== undefined || startsAtShown,
                      extra: startsAtShown ? ["cs-starts-at-error"] : [],
                    })}
                  />
                </Field>
              </div>
              {errors.startsAt === undefined ? null : (
                <FieldError id="cs-starts-at-error">{errors.startsAt}</FieldError>
              )}

              <div className="field-row">
                <Field id="cs-duration" label={copy.labels.duration} hint={copy.hints.duration} error={errors.duration}>
                  <div className="input-suffix">
                    <input
                      id="cs-duration"
                      type="number"
                      inputMode="numeric"
                      autoComplete="off"
                      {...inputProps("duration")}
                      {...ariaFor("cs-duration", {
                        hint: true,
                        error: errors.duration !== undefined,
                        extra: ["cs-duration-unit"],
                      })}
                    />
                    <span id="cs-duration-unit">{copy.units.minutes}</span>
                  </div>
                </Field>
                <Field id="cs-capacity" label={copy.labels.capacity} hint={copy.hints.capacity} error={errors.capacity}>
                  <div className="input-suffix">
                    <input
                      id="cs-capacity"
                      type="number"
                      inputMode="numeric"
                      autoComplete="off"
                      {...inputProps("capacity")}
                      {...ariaFor("cs-capacity", {
                        hint: true,
                        error: errors.capacity !== undefined,
                        extra: ["cs-capacity-unit"],
                      })}
                    />
                    <span id="cs-capacity-unit">{copy.units.places}</span>
                  </div>
                </Field>
              </div>

              <Field
                id="cs-coach"
                label={copy.labels.coach}
                labelFor={coachListUsable || coaches.status === "loading" ? "cs-coach" : null}
                error={coachFieldError}
              >
                {coaches.status === "error" || (coaches.status === "success" && coaches.coaches.length === 0) ? (
                  <div role="alert" className="coach-problem">
                    <p>{coaches.status === "error" ? copy.coaches.error : copy.coaches.empty}</p>
                    <button
                      id={COACH_RETRY_ID}
                      type="button"
                      className="button button-secondary"
                      disabled={pending}
                      onClick={() => {
                        coachRetrying.current = true;
                        coaches.retry();
                      }}
                    >
                      {copy.coaches.retry}
                    </button>
                  </div>
                ) : (
                  <select
                    ref={selectRef}
                    id="cs-coach"
                    name="coachId"
                    value={values.coachId}
                    disabled={pending || coaches.status === "loading"}
                    onChange={(event) => change("coachId", event.target.value)}
                    onBlur={() => markTouched("coachId")}
                    {...ariaFor("cs-coach", { error: coachFieldError !== undefined })}
                  >
                    <option value="">
                      {coaches.status === "loading" ? copy.coaches.loading : copy.coaches.placeholder}
                    </option>
                    {coaches.coaches.map((coach) => (
                      <option key={coach.id} value={coach.id}>
                        {coach.name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <Field
                id="cs-location-name"
                label={copy.labels.locationName}
                hint={copy.hints.locationName}
                error={errors.locationName}
              >
                <input
                  id="cs-location-name"
                  type="text"
                  autoComplete="off"
                  {...inputProps("locationName")}
                  {...ariaFor("cs-location-name", { hint: true, error: errors.locationName !== undefined })}
                />
              </Field>

              <Field
                id="cs-location-address"
                label={copy.labels.locationAddress}
                hint={copy.hints.locationAddress}
                error={errors.locationAddress}
              >
                <input
                  id="cs-location-address"
                  type="text"
                  autoComplete="off"
                  {...inputProps("locationAddress")}
                  {...ariaFor("cs-location-address", { hint: true, error: errors.locationAddress !== undefined })}
                />
              </Field>

              <fieldset
                className="field field-group"
                {...ariaFor("cs-visibility", { error: errors.visibility !== undefined, invalid: false })}
              >
                <legend className="field-label">{copy.labels.visibility}</legend>
                <div className="radio-row">
                  {VISIBILITIES.map((value) => (
                    <label key={value} className="radio-option">
                      <input
                        id={`cs-visibility-${value === "invite-only" ? "invite" : value}`}
                        type="radio"
                        name="visibility"
                        value={value}
                        checked={values.visibility === value}
                        disabled={pending}
                        onChange={(event) => {
                          if (isVisibility(event.target.value)) change("visibility", event.target.value);
                        }}
                      />
                      {copy.visibilityOptions[value]}
                    </label>
                  ))}
                </div>
                {errors.visibility === undefined ? null : (
                  <FieldError id="cs-visibility-error">{errors.visibility}</FieldError>
                )}
              </fieldset>

              <Field
                id="cs-description"
                label={copy.labels.description}
                optional={copy.labels.optional}
                counter={
                  descriptionLength >= DESCRIPTION_COUNTER_FROM
                    ? copy.counter(descriptionLength, LIMITS.description.max)
                    : undefined
                }
                error={errors.description}
              >
                <textarea
                  id="cs-description"
                  rows={3}
                  autoComplete="off"
                  {...inputProps("description")}
                  {...ariaFor("cs-description", {
                    counter: descriptionLength >= DESCRIPTION_COUNTER_FROM,
                    error: errors.description !== undefined,
                  })}
                />
              </Field>

              <Field
                id="cs-notes"
                label={copy.labels.trainerNotes}
                optional={copy.labels.optional}
                counter={
                  notesLength >= NOTES_COUNTER_FROM
                    ? copy.counter(notesLength, LIMITS.trainerNotes.max)
                    : undefined
                }
                error={errors.trainerNotes}
              >
                <textarea
                  id="cs-notes"
                  rows={3}
                  autoComplete="off"
                  {...inputProps("trainerNotes")}
                  {...ariaFor("cs-notes", {
                    counter: notesLength >= NOTES_COUNTER_FROM,
                    error: errors.trainerNotes !== undefined,
                  })}
                />
              </Field>

              <div role="status" className="visually-hidden">
                {attention > 0 ? copy.attention(attention) : ""}
              </div>
            </div>

            <footer className="dialog-footer form-footer">
              {create.error === null ? null : (
                <div ref={blockRef} role="alert" tabIndex={-1} className="form-error">
                  <p>{copy.formError(create.error)}</p>
                  {unmatchedErrors.map((message) => (
                    <p key={message}>{message}</p>
                  ))}
                </div>
              )}
              {confirming ? (
                <div className="confirm-discard">
                  <p>{copy.confirm.message}</p>
                  <button ref={keepRef} type="button" className="button button-primary" onClick={keepEditing}>
                    {copy.confirm.keep}
                  </button>
                  <button type="button" className="button button-secondary" onClick={doClose}>
                    {copy.confirm.discard}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    ref={cancelRef}
                    type="button"
                    className="button button-secondary"
                    disabled={pending}
                    onClick={requestClose}
                  >
                    {copy.cancel}
                  </button>
                  <button
                    ref={submitRef}
                    type="submit"
                    className="button button-primary submit-button"
                    aria-disabled={pending}
                  >
                    {pending ? copy.pending : copy.submit}
                  </button>
                </>
              )}
            </footer>
          </form>
        )}
      </div>
    </dialog>
  );
}
