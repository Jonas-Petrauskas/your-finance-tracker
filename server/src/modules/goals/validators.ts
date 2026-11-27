export type GoalInput = {
  name: string
  targetCents: number
}

export function validateGoalInput(input: GoalInput) {
  const name = input.name.trim()
  if (!name) throw new Error('Name is required')
  if (!Number.isInteger(input.targetCents) || input.targetCents <= 0) {
    throw new Error('Target must be a positive integer (cents)')
  }
  return { name, targetCents: input.targetCents }
}
