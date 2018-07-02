export default function exception(
  code: string,
  message: string,
  trace?: string
): never {
  throw new Error(
    trace ? `${code}(${trace}): ${message}` : `${code}: ${message}`
  );
}
