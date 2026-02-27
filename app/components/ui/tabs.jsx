import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = ({ defaultValue, className, children, ...props }) => {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <div className={cn("w-full", className)} {...props}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { value, setValue })
          : child
      )}
    </div>
  );
};

const TabsList = ({ className, children, value, setValue, ...props }) => (
  <div
    className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}
    {...props}
  >
    {React.Children.map(children, child =>
      React.isValidElement(child)
        ? React.cloneElement(child, { currentValue: value, setValue })
        : child
    )}
  </div>
);

const TabsTrigger = ({ value, currentValue, setValue, className, children, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
      currentValue === value ? "bg-background text-foreground shadow-sm" : "",
      className
    )}
    onClick={() => setValue(value)}
    {...props}
  >
    {children}
  </button>
);

const TabsContent = ({ value, currentValue, className, children, ...props }) => {
  if (value !== currentValue) return null;

  return (
    <div
      className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
