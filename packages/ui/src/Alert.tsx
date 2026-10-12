import * as React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "error" | "success";
}

export const Alert = ({ className = "", variant = "info", children, ...props }: AlertProps) => {
  const baseStyles = "relative w-full rounded-lg border p-4 text-sm [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4";

  const variantStyles = {
    info: "border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600",
    warning: "border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600",
    error: "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600",
  };

  return (
    <div role="alert" className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h5 className={`mb-1 font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h5>
);

export const AlertDescription = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
    {children}
  </div>
);
