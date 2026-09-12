function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-saas" onClick={onClose}>
      <div className="modal-content-saas" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-saas">
          <h5 className="modal-title mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
            style={{ filter: "var(--text-primary) === '#f9fafb' ? 'invert(1)' : 'none'" }}
          />
        </div>
        <div className="modal-body-saas">{children}</div>
        {footer && <div className="modal-footer-saas">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
