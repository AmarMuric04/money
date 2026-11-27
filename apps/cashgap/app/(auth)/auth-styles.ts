// Shared classes for the auth pages, matching the home page (app/page.tsx).

export const authHeading =
  "text-[40px] font-bold leading-[1] tracking-[-0.045em] text-foreground sm:text-5xl";

export const authLead = "mt-4 text-lg leading-relaxed text-muted-foreground";

export const authTextLink =
  "font-semibold text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground";

export const authGoogleButton =
  "h-12 w-full gap-3 rounded-full border-border bg-background text-[15px] font-semibold shadow-none hover:bg-muted dark:border-border dark:bg-transparent dark:hover:bg-muted";

export const authFormClassNames = {
  error:
    "flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-destructive",
  submit: "rounded-full text-[15px] font-semibold",
  link: authTextLink,
};
