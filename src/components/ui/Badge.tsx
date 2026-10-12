import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline" | "info";
}

export const Badge = ({ className = "", variant = "default", children, ...props }: BadgeProps) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";

  const variantStyles = {
    default: "bg-slate-100 text-slate-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    outline: "border border-slate-300 text-slate-700 bg-white",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant] || variantStyles.default} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Badge;
