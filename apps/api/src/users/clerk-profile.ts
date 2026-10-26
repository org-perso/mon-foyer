import type { User as ClerkUser, UserJSON } from '@clerk/backend';

/** Profil minimal conservé localement, indépendant du format Clerk. */
export interface ClerkProfile {
  id: string;
  email: string;
  name: string;
  imageUrl: string | null;
}

function displayName(first: string | null, last: string | null, email: string): string {
  const full = [first, last].filter(Boolean).join(' ').trim();
  return (full || email.split('@')[0] || 'Utilisateur').slice(0, 120);
}

/** Depuis la charge utile d'un webhook (snake_case). */
export function profileFromWebhook(data: UserJSON): ClerkProfile | null {
  const primary =
    data.email_addresses.find((e) => e.id === data.primary_email_address_id) ??
    data.email_addresses[0];
  if (!primary) return null;
  const email = primary.email_address.toLowerCase();
  return {
    id: data.id,
    email,
    name: displayName(data.first_name, data.last_name, email),
    imageUrl: data.image_url || null,
  };
}

/** Depuis l'API Backend de Clerk (camelCase). */
export function profileFromApi(user: ClerkUser): ClerkProfile | null {
  const primary = user.primaryEmailAddress ?? user.emailAddresses[0];
  if (!primary) return null;
  const email = primary.emailAddress.toLowerCase();
  return {
    id: user.id,
    email,
    name: displayName(user.firstName, user.lastName, email),
    imageUrl: user.imageUrl || null,
  };
}
