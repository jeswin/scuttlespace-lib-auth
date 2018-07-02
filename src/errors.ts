import exception from "./exception";

export function single(array: Array<any>): never {
  return exception(
    "INVARIANT_VIOLATION_SINGLE",
    `Expected a single item but got ${array.length}.`
  );
}

export function singleOrNone(array: Array<any>): never {
  return exception(
    "INVARIANT_VIOLATION_SINGLE_OR_NONE",
    `Expected a zero or one items but got ${array.length}.`
  );
}
