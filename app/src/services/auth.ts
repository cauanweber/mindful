import http from './http'

type AuthResponse = {
  token: string
  user: { id: string; name: string; email: string }
}

export async function register(name: string, email: string, password: string) {
  const { data } = await http.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
  })
  return data
}

export async function login(email: string, password: string) {
  const { data } = await http.post<AuthResponse>('/auth/login', {
    email,
    password,
  })
  return data
}

export async function me() {
  const { data } = await http.get('/auth/me')
  return data as { id: string; name: string; email: string }
}
