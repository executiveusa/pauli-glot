// Auth disabled for development
// TODO: Re-enable Clerk authentication when CLERK_SECRET_KEY is configured

/**
 * Returns a demo user for development
 */
export async function getOrCreateUser() {
  // Return demo user during development
  return {
    id: 'demo-user-1',
    email: 'demo@pauli.app',
    name: 'Demo User',
    clerkId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
