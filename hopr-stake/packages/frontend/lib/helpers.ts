/* 
 * We use a custom round function since we want to show _less_ amount to users
 * than what's actually available. In short, if they have 0.60589 we want to
 * show 0.6058, as rounding up to 0.6059 would fail if they take this scalar as
 * the actual amount they can use for gas or other operations.
 * 
 */
export const round = (num: number, precision: number): string => {
  const base = 10 ** precision
  return (Math.floor(num * base) / base).toFixed(precision)
}

export const bgColor = { light: 'gray.50', dark: 'gray.900' }
export const color = { light: '#414141', dark: 'white' }

export const nonEmptyAccount = (account:string) => {
  return account && account.length > 0
}