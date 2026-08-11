import { useEffect } from "react";

function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgClass =
    type === "success"
      ? "badge-saas-success"
      : type === "danger"
      ? "badge-saas-danger"
      : "badge-saas-primary";

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 1100 }}
    >
      <div
        className="toast show align-items-center shadow-lg border-0"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)"
        }}
      >
        <div className="d-flex p-2 align-items-center justify-content-between">
          <div className="toast-body d-flex align-items-center gap-2">
            <span className={`badge badge-saas ${bgClass}`}>{type.toUpperCase()}</span>
            <span style={{ color: "var(--text-primary)", fontSize: "0.875rem" }}>{message}</span>
          </div>
          <button
            type="button"
            className="btn-close me-2 m-auto"
            onClick={onClose}
            aria-label="Close"
          />
        </div>
      </div>
    </div>
  );
}

export default Toast;
