import './Panel.css';

export default function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel__header">
          {title && <h2 className="panel__title">{title}</h2>}
          {action}
        </div>
      )}
      <div className="panel__body">{children}</div>
    </section>
  );
}
