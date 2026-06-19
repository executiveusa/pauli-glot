import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Returns the DB User record for the currently authenticated Clerk session,
 * creating it on first sign-in. Returns null if the request is unauthenticated.
 */
export async function getOrCreateUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${clerkId}@pauli.app`;

  return prisma.user.upsert({
    where: { email },
    update: { clerkId },
    create: {
      clerkId,
      email,
      name: clerkUser?.fullName ?? undefined,
    },
  });
}
