type CnValue = string | undefined | null | false | Record<string, boolean | undefined | null>

export default function cn(...args: CnValue[]): string {
  return args
    .flatMap((arg) => {
      if (!arg) return []
      if (typeof arg === 'object') {
        return Object.entries(arg)
          .filter(([, v]) => v)
          .map(([k]) => k)
      }
      return [arg]
    })
    .join(' ')
}
