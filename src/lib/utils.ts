export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | { [key: string]: unknown }

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function collectClassValues(value: ClassValue, out: string[]): void {
  if (!value) {
    return
  }

  if (typeof value === "string" || typeof value === "number") {
    out.push(String(value))
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectClassValues(item, out)
    }
    return
  }

  if (isObject(value)) {
    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) {
        out.push(key)
      }
    }
  }
}

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    collectClassValues(input, classes)
  }

  return classes.join(" ")
}
