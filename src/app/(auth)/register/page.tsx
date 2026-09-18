import { RegisterForm } from "./register-form";

// SSG: no data dependency of its own; the form itself is a Client
// Component that submits via a Server Action.
export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Create an account
      </h1>
      <RegisterForm />
    </div>
  );
}
