export default function Modal({ title, children, onClose, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        {children}
        {footer && <div className="modal-actions">{footer}</div>}
      </div>
    </div>
  );
}
