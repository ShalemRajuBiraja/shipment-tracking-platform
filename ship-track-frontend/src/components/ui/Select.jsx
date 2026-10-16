const Select = ({
  label,
  options = [],
  error,
  helperText,
  placeholder = "Select an option",
  id,
  className = "",
  ...props
}) => {
  const selectId = id || props.name;

  const selectClasses = [
    "w-full appearance-none rounded-lg border bg-white px-4 py-2.5 pr-10 text-sm text-slate-900",
    "focus:outline-none focus:ring-2 focus:ring-offset-0",
    "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
    error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={selectClasses}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error || helperText ? `${selectId}-message` : undefined
          }
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {(error || helperText) && (
        <p
          id={`${selectId}-message`}
          className={`mt-1.5 text-xs ${
            error ? "text-red-600" : "text-slate-500"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Select;