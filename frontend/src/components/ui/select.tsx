import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  onChange?: (e: { target: { value: string; name?: string } }) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      children,
      options,
      value,
      defaultValue,
      disabled,
      name,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = React.useState(false);

    // Extract options from props.options or children (<option>)
    const parsedOptions = React.useMemo(() => {
      if (options && options.length > 0) return options;
      const opts: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === "option") {
          const rawChildren = child.props.children;
          const labelText = Array.isArray(rawChildren)
            ? rawChildren.join("")
            : String(rawChildren ?? child.props.value ?? "");
          opts.push({
            value: String(child.props.value ?? ""),
            label: labelText,
            disabled: child.props.disabled,
          });
        }
      });
      return opts;
    }, [options, children]);

    // Internal state for uncontrolled mode
    const [internalValue, setInternalValue] = React.useState<string>(
      value !== undefined
        ? String(value)
        : defaultValue !== undefined
        ? String(defaultValue)
        : parsedOptions[0]?.value || ""
    );

    const currentValue = value !== undefined ? String(value) : internalValue;

    const selectedOption = React.useMemo(() => {
      return (
        parsedOptions.find((o) => o.value === currentValue) ||
        parsedOptions[0] || { value: "", label: "Pilih..." }
      );
    }, [parsedOptions, currentValue]);

    // Handle Outside Click
    React.useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
      }
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [isOpen]);

    // Handle Escape Key
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const handleSelect = (val: string) => {
      if (disabled) return;
      setInternalValue(val);
      setIsOpen(false);
      if (onChange) {
        onChange({ target: { value: val, name } });
      }
    };

    return (
      <div className="w-full space-y-1.5" ref={containerRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Custom Stylized Trigger Button */}
          <button
            id={selectId}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition-all text-left shadow-xs",
              error
                ? "border-rose-400 focus:border-rose-600 focus:ring-rose-500"
                : isOpen
                ? "border-red-600 ring-2 ring-red-500/20"
                : "border-slate-200 hover:border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-500/20",
              disabled && "cursor-not-allowed bg-slate-50 text-slate-400 opacity-70",
              className
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className="truncate pr-2">{selectedOption.label}</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
                isOpen && "rotate-180 text-red-600"
              )}
            />
          </button>

          {/* Floating Dropdown Menu (No Windows 95 blue native box!) */}
          {isOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-md animate-in fade-in zoom-in-95 scrollbar-thin"
              role="listbox"
            >
              {parsedOptions.length === 0 ? (
                <div className="py-2 px-3 text-xs text-slate-400 text-center">
                  Tidak ada opsi
                </div>
              ) : (
                parsedOptions.map((opt) => {
                  const isSelected = opt.value === currentValue;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left font-medium",
                        isSelected
                          ? "bg-red-50 text-red-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                        opt.disabled && "cursor-not-allowed opacity-50"
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-red-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Hidden native select for form accessibility and DOM compatibility */}
          <select
            ref={ref}
            name={name}
            value={currentValue}
            onChange={(e) => handleSelect(e.target.value)}
            disabled={disabled}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            {...props}
          >
            {children}
          </select>
        </div>

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

