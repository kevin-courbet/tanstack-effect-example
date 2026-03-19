export const getHostOrigin = (): string => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const port = process.env.PORT || "3000";
  return `http://localhost:${port}`;
};
