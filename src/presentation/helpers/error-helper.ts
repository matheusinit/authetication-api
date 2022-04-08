export const appError = (error: Error): Error => ({
  name: error.name,
  message: error.message
})
