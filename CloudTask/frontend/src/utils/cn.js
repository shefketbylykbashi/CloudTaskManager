function collectClassNames(value, classes) {
  if (!value) return;

  if (typeof value === "string" || typeof value === "number") {
    classes.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectClassNames(item, classes));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([className, enabled]) => {
      if (enabled) classes.push(className);
    });
  }
}

export function cn(...values) {
  const classes = [];
  values.forEach((value) => collectClassNames(value, classes));
  return classes.join(" ");
}

export default cn;
