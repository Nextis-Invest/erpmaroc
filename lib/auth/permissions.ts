import { Session } from "next-auth";

/**
 * Check if the current user is an admin
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user?.email) return false;

  // Check if user has admin role or email contains admin
  return session.user.role === 'admin' ||
         session.user.email.includes('@admin') ||
         session.user.email.includes('admin@');
}

/**
 * Check if user can perform admin actions
 */
export function canManageArchives(session: Session | null): boolean {
  return isAdmin(session);
}

/**
 * Check if user can permanently delete records
 */
export function canPermanentlyDelete(session: Session | null): boolean {
  return isAdmin(session);
}

/**
 * Get the appropriate delete terminology based on user role
 */
export function getDeleteTerminology(session: Session | null) {
  const userIsAdmin = isAdmin(session);

  return {
    // Button text
    deleteButton: userIsAdmin ? "Supprimer" : "Effacer",
    deleteAction: userIsAdmin ? "Supprimer définitivement" : "Effacer",

    // Dialog titles
    deleteTitle: userIsAdmin ? "Supprimer l'employé" : "Effacer l'employé",

    // Descriptions
    deleteDescription: userIsAdmin
      ? "Êtes-vous sûr de vouloir supprimer définitivement cet employé ? Cette action est irréversible."
      : "Êtes-vous sûr de vouloir effacer cet employé ? L'employé sera masqué des listes mais les données seront conservées.",

    // Consequences
    consequences: userIsAdmin ? [
      "Toutes les données de l'employé seront supprimées définitivement",
      "L'historique des congés et des présences sera perdu",
      "Les données de paie associées seront supprimées",
      "Cette action ne peut pas être annulée"
    ] : [
      "L'employé sera masqué des listes principales",
      "Toutes les données sont conservées",
      "L'historique des congés et présences reste accessible",
      "Un administrateur peut restaurer l'employé"
    ],

    // Loading states
    loadingText: userIsAdmin ? "Suppression..." : "Effacement...",

    // Success messages
    successMessage: userIsAdmin
      ? "Employé supprimé définitivement"
      : "Employé effacé avec succès"
  };
}