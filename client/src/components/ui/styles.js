export const controlBase =
  "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-primary transition placeholder:text-secondary/70 focus:outline-none focus:ring-3 disabled:cursor-not-allowed disabled:bg-disabled/45 disabled:text-secondary/70";

export const controlState = ({ error = false } = {}) =>
  error
    ? "border-accent focus:border-accent focus:ring-accent/30"
    : "border-occasion-border focus:border-primary focus:ring-accent/35";

export const getDescribedBy = (...ids) => ids.filter(Boolean).join(" ") || undefined;
