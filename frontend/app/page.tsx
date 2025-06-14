import LoginForm from "@/components/login-form";

export default function Home() {
  // In a real application, we would check if the user is already authenticated
  // and redirect them to their appropriate dashboard

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Employee Reimbursement System
          </h1>
          <p className="mt-2 text-gray-600">Sign in to access your dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
