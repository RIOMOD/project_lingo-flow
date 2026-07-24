import { Link } from "react-router-dom";
import { roleMeta } from "../../config/navigation";

export default function PageTemplate({
  roleKey,
  title,
  description,
  stats = [],
  actions = [],
  panels = [],
}) {
  const role = roleMeta[roleKey];
  const overviewCards = [
    { value: `${actions.length}`, label: "Quick actions" },
    { value: `${panels.length}`, label: "Focus blocks" },
    { value: `${stats.length}`, label: "Signal cards" },
  ];

  return (
    <div
      className="page-template"
      style={{
        "--page-accent": role.accent,
        "--page-accent-soft": `${role.accent}18`,
        "--page-accent-border": `${role.accent}40`,
      }}
    >
      <section className="page-hero">
        <div className="page-hero-copy">
          <span className="page-badge">{role.label}</span>
          <h2 className="page-title">{title}</h2>
          <p className="page-description">{description}</p>
        </div>

        {actions.length > 0 && (
          <div className="page-actions">
            {actions.map((item) => (
              <Link
                key={`${item.to}-${item.label}`}
                to={item.to}
                className={`page-action page-action-${item.tone ?? "primary"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="page-overview-grid">
        {overviewCards.map((item) => (
          <article key={item.label} className="page-overview-card">
            <p className="page-overview-label">{item.label}</p>
            <h3 className="page-overview-value">{item.value}</h3>
          </article>
        ))}
      </section>

      {stats.length > 0 && (
        <section className="page-stat-grid">
          {stats.map((item) => (
            <article key={`${item.label}-${item.value}`} className="page-stat-card">
              <p className="page-stat-label">{item.label}</p>
              <h3 className="page-stat-value">{item.value}</h3>
            </article>
          ))}
        </section>
      )}

      {panels.length > 0 && (
        <section className="page-panel-grid">
          {panels.map((item) => (
            <article key={item.title} className="page-panel-card">
              <div className="page-panel-head">
                <h3 className="page-panel-title">{item.title}</h3>
                <span className="page-panel-count">{item.items.length} items</span>
              </div>
              <ul className="page-panel-list">
                {item.items.map((line, index) => (
                  <li key={line} className="page-panel-item">
                    <span className="page-panel-index">{index + 1}</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
