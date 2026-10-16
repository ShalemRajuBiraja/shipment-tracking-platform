const Loader = ({
  size = "md",
  text = "",
  className = "",
}) => {
  const sizeStyles = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-4",
  };

  const loaderClasses = [
    "animate-spin rounded-full border-slate-200 border-t-blue-600",
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex items-center justify-center gap-2">
      <span
        className={loaderClasses}
        role="status"
        aria-label="Loading"
      />

      {text && (
        <span className="text-sm text-slate-600">
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;