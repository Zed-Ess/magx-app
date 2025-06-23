// app/login/page.js
import LoginForm from '../components/LoginForm';
import DebugPanel from '../components/DebugPanel';

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <DebugPanel />
    </>
  )
}