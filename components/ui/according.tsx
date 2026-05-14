"use client";

import * as React from "react";

type AccordionType = "single" | "multiple";
type SingleValue = string | undefined;
type MultipleValue = string[];

function cn(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface AccordionContextValue {
  type: AccordionType;
  collapsible: boolean;
  singleValue: SingleValue;
  multipleValue: MultipleValue;
  toggleItem: (itemValue: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

interface AccordionItemContextValue {
  value: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AccordionType;
  collapsible?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      className,
      type = "single",
      collapsible = true,
      value,
      defaultValue,
      onValueChange,
      children,
      ...props
    },
    ref,
  ) => {
    const initialSingle =
      typeof defaultValue === "string" ? defaultValue : undefined;
    const initialMultiple = Array.isArray(defaultValue) ? defaultValue : [];

    const [uncontrolledSingle, setUncontrolledSingle] =
      React.useState<SingleValue>(initialSingle);
    const [uncontrolledMultiple, setUncontrolledMultiple] =
      React.useState<MultipleValue>(initialMultiple);

    const controlledSingle = typeof value === "string" ? value : undefined;
    const controlledMultiple = Array.isArray(value) ? value : undefined;

    const singleValue =
      type === "single"
        ? controlledSingle !== undefined
          ? controlledSingle
          : uncontrolledSingle
        : undefined;

    const multipleValue =
      type === "multiple"
        ? controlledMultiple !== undefined
          ? controlledMultiple
          : uncontrolledMultiple
        : [];

    const setSingle = React.useCallback(
      (next: SingleValue) => {
        if (controlledSingle === undefined) {
          setUncontrolledSingle(next);
        }
        onValueChange?.(next ?? "");
      },
      [controlledSingle, onValueChange],
    );

    const setMultiple = React.useCallback(
      (next: MultipleValue) => {
        if (controlledMultiple === undefined) {
          setUncontrolledMultiple(next);
        }
        onValueChange?.(next);
      },
      [controlledMultiple, onValueChange],
    );

    const toggleItem = React.useCallback(
      (itemValue: string) => {
        if (type === "single") {
          const isOpen = singleValue === itemValue;
          if (isOpen) {
            if (collapsible) {
              setSingle(undefined);
            }
            return;
          }
          setSingle(itemValue);
          return;
        }

        const exists = multipleValue.includes(itemValue);
        if (exists) {
          setMultiple(multipleValue.filter((v) => v !== itemValue));
          return;
        }
        setMultiple([...multipleValue, itemValue]);
      },
      [type, singleValue, collapsible, setSingle, multipleValue, setMultiple],
    );

    const contextValue = React.useMemo<AccordionContextValue>(
      () => ({
        type,
        collapsible,
        singleValue,
        multipleValue,
        toggleItem,
      }),
      [type, collapsible, singleValue, multipleValue, toggleItem],
    );

    return (
      <AccordionContext.Provider value={contextValue}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  },
);

Accordion.displayName = "Accordion";

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => {
    return (
      <AccordionItemContext.Provider value={{ value }}>
        <div ref={ref} className={cn("border-b", className)} {...props}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  },
);

AccordionItem.displayName = "AccordionItem";

const useAccordionItemState = () => {
  const root = React.useContext(AccordionContext);
  const item = React.useContext(AccordionItemContext);

  if (!root || !item) {
    throw new Error(
      "AccordionTrigger and AccordionContent must be used inside AccordionItem.",
    );
  }

  const isOpen =
    root.type === "single"
      ? root.singleValue === item.value
      : root.multipleValue.includes(item.value);

  return { isOpen, toggle: () => root.toggleItem(item.value) };
};

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { isOpen, toggle } = useAccordionItemState();

  return (
    <button
      ref={ref}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          toggle();
        }
      }}
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "flex w-full items-center justify-between py-4 text-left font-medium transition hover:underline",
        className,
      )}
      {...props}
    >
      {children}
      <span className="ml-2 text-xs text-gray-500">{isOpen ? "-" : "+"}</span>
    </button>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen } = useAccordionItemState();

  return (
    <div
      ref={ref}
      data-state={isOpen ? "open" : "closed"}
      hidden={!isOpen}
      className={cn("overflow-hidden pb-4 text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
});

AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
