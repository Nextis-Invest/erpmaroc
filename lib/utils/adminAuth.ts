import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // TODO: Add proper admin role check here
  // For now, we'll check if the user email contains 'admin' or is in a whitelist
  const adminEmails = [
    "admin@nextis.ma",
    "administrator@nextis.ma",
    "superadmin@nextis.ma"
  ];

  const isAdmin = adminEmails.includes(session.user.email) ||
                  session.user.email.includes('admin') ||
                  session.user.role === 'admin';

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return session;
}

export async function checkAdminAccess() {
  const session = await auth();

  if (!session?.user?.email) {
    return false;
  }

  const adminEmails = [
    "admin@nextis.ma",
    "administrator@nextis.ma",
    "superadmin@nextis.ma"
  ];

  return adminEmails.includes(session.user.email) ||
         session.user.email.includes('admin') ||
         session.user.role === 'admin';
}