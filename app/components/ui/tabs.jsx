import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext(null);

const Tabs = ({ defaultValue, className, children, ...props }) => {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}

const TabsTrigger = ({ value, className, children, ...props }) => {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  const { value: currentValue, setValue } = context;

  return (
    <button
      type="button"
      data-state={currentValue === value ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={() => setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className, children, ...props }) => {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  const { value: currentValue } = context;

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
