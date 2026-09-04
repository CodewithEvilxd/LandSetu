import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: {
    text: string;
    variant?: "green" | "blue" | "amber" | "red";
  };
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions
}) => {
  return (
    <div className="page-header">
      <div className="page-header-main">
        <div className="page-header-title-row">
          <h2 className="page-header-title">{title}</h2>
          {badge && (
            <span className={`badge badge-${badge.variant || "green"}`}>
              {badge.text}
            </span>
          )}
        </div>
        <p className="page-header-subtitle">{subtitle}</p>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};
