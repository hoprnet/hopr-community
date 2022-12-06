export const setParam = (location, key, value) => {
    const params = new URLSearchParams(location.search)
    params.set(key, value)
    return `?${params.toString()}`
  }
  
  export const getParam = (location, key) => {
    const params = new URLSearchParams(location.search)
    return params.get(key)
  }