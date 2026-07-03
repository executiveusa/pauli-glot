import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">Sign Up</h1>
        <p className="text-center text-gray-600 mb-6">
          Sign up is currently disabled for development. Please use the app directly.
        </p>
        <Link 
          href="/" 
          className="block w-full text-center bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
