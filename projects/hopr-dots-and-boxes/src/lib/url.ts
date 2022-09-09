import { Location } from 'history'

export const setParam = (location: Location, key: string, value: string): string => {
  const params = new URLSearchParams(location.search)
  params.set(key, value)
  return `?${params.toString()}`
}

export const getParam = (location: Location, key: string): string | null => {
  const params = new URLSearchParams(location.search)
  return params.get(key)
}