const USER_NAME_KEY = 'pokerplanning_user_name'

export function getCachedUserName() {
  const value = window.localStorage.getItem(USER_NAME_KEY)
  return value?.trim() ? value : null
}

export function saveCachedUserName(name: string) {
  window.localStorage.setItem(USER_NAME_KEY, name.trim())
}
