const tableauNameCollator = new Intl.Collator("fr-FR", {
  numeric: true,
  sensitivity: "base",
});

function getTimeValue(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return value.trim();
}

export function compareTableauNames(
  firstName: string | null | undefined,
  secondName: string | null | undefined,
) {
  return tableauNameCollator.compare(
    firstName?.trim() ?? "",
    secondName?.trim() ?? "",
  );
}

export function sortByTableauNaturalOrder<T>(
  items: T[],
  getName: (item: T) => string | null | undefined,
  getStartTime?: (item: T) => Date | string | null | undefined,
) {
  return [...items].sort((first, second) => {
    const nameComparison = compareTableauNames(getName(first), getName(second));
    if (nameComparison !== 0) {
      return nameComparison;
    }

    if (!getStartTime) {
      return 0;
    }

    const firstTime = getTimeValue(getStartTime(first));
    const secondTime = getTimeValue(getStartTime(second));

    if (firstTime == null && secondTime == null) {
      return 0;
    }

    if (firstTime == null) {
      return 1;
    }

    if (secondTime == null) {
      return -1;
    }

    if (typeof firstTime === "number" && typeof secondTime === "number") {
      return firstTime - secondTime;
    }

    return String(firstTime).localeCompare(String(secondTime));
  });
}
