/** Постоянный polite-регион: всегда в DOM, вне перерисовываемого списка. */
export function LiveStatus({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="visually-hidden">
      {message}
    </div>
  );
}
