import { Suspense } from 'react'
import LoginForm from './LoginForm'

// Server wrapper: LoginForm reads useSearchParams (registered / check_email /
// auth_error / returnTo), which requires a Suspense boundary so the route can be
// prerendered without a CSR bailout. (Surfaced once the root layout went auth-free
// in Phase 0 and this route became static-eligible.)
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
