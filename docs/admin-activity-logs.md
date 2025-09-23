# 🛡️ Journal d'Activité Administrateur

## Vue d'ensemble

La page **Journal d'Activité** (`/admin/activity-logs`) est un outil de surveillance avancé permettant aux administrateurs de surveiller toutes les activités des utilisateurs dans le système ERP. Cette interface offre une visibilité complète sur les actions effectuées, les connexions, les erreurs et les événements de sécurité.

## 🔐 Accès et Sécurité

### Restrictions d'accès
- **Accès réservé aux administrateurs uniquement**
- Authentification requise via NextAuth
- Vérification du rôle admin au niveau API et interface
- Redirection automatique vers `/unauthorized` pour les non-administrateurs

### Emails administrateurs autorisés
```typescript
const adminEmails = [
  "admin@nextis.ma",
  "administrator@nextis.ma",
  "superadmin@nextis.ma"
];
```

## 🎯 Fonctionnalités principales

### 1. Dashboard de métriques
- **Activités aujourd'hui** : Nombre total d'actions
- **Événements sécurité** : Connexions, échecs, exports
- **Erreurs système** : Taux d'erreur et alertes
- **Utilisateurs actifs** : Nombre d'utilisateurs connectés

### 2. Table des logs d'activité
- **Pagination intelligente** : 20 logs par page
- **Tri par date** : Plus récents en premier
- **Statuts visuels** : Badges colorés (succès, erreur, warning, info)
- **Détails complets** : Utilisateur, action, module, IP, timestamp

### 3. Filtrage avancé
```typescript
// Filtres disponibles
{
  userEmail: '',        // Email utilisateur
  action: '',           // Action spécifique
  actionType: '',       // Type d'action (auth, hr, payroll, etc.)
  module: '',           // Module (hr, payroll, attendance, etc.)
  status: '',           // Statut (success, error, warning, info)
  dateFrom: '',         // Date de début
  dateTo: '',           // Date de fin
  securityOnly: false   // Événements sécurité uniquement
}
```

### 4. Modal de détails
- **Informations utilisateur** : Email, rôle, badge coloré
- **Détails techniques** : IP, User-Agent, session ID
- **Contexte d'action** : Module, cible, métadonnées
- **Actions rapides** : Filtrer par utilisateur/action similaire
- **Export** : Télécharger les détails en JSON

## 🔧 Types d'activités surveillées

### Authentification
- `login` - Connexion réussie
- `logout` - Déconnexion
- `failed_login` - Tentative de connexion échouée
- `password_change` - Changement de mot de passe

### Gestion des employés
- `employee_created` - Nouvel employé ajouté
- `employee_updated` - Informations employé modifiées
- `employee_archived` - Employé archivé/supprimé

### Présence
- `attendance_checkin` - Pointage d'entrée
- `attendance_checkout` - Pointage de sortie
- `attendance_modified` - Modification des heures

### Paie
- `payroll_generated` - Génération de paie
- `payroll_exported` - Export des données de paie

### Sécurité
- `data_export` - Export de données sensibles
- `permission_change` - Modification des permissions
- `admin_access` - Accès à une section admin

## 🎨 Design et Interface

### Palette de couleurs
- **Succès** : Vert (`#10b981`) - Actions réussies
- **Erreur** : Rouge (`#ef4444`) - Échecs, erreurs
- **Avertissement** : Orange (`#f59e0b`) - Alertes
- **Information** : Bleu (`#3b82f6`) - Actions normales

### Badges de rôle
- **Admin** : Rouge (accès critique)
- **RH** : Bleu (gestion employés)
- **Manager** : Vert (supervision)
- **Employee** : Gris (utilisateur standard)

### Interactions
- **Clic sur ligne** : Ouvre le modal de détails
- **Hover** : Surlignage léger de la ligne
- **Badges cliquables** : Filtrage rapide par rôle/statut

## 📊 APIs utilisées

### GET `/api/admin/activity-logs`
```typescript
// Paramètres de requête
{
  page: number,           // Page actuelle (défaut: 1)
  limit: number,          // Nombre par page (défaut: 20)
  userEmail?: string,     // Filtrer par email
  module?: string,        // Filtrer par module
  actionType?: string,    // Filtrer par type
  status?: string,        // Filtrer par statut
  dateFrom?: string,      // Date de début (ISO)
  dateTo?: string,        // Date de fin (ISO)
  securityOnly?: boolean  // Événements sécurité uniquement
}
```

### GET `/api/admin/activity-logs/stats`
```typescript
// Réponse
{
  totalActivities: number,
  securityEventsCount: number,
  errorCount: number,
  errorRate: number,
  moduleDistribution: Array<{_id: string, count: number}>,
  actionTypeDistribution: Array<{_id: string, count: number}>,
  topUsers: Array<{_id: {userId: string, userEmail: string}, count: number}>
}
```

## 🚀 Utilisation

### 1. Accès à la page
```
URL: https://votre-domaine.com/admin/activity-logs
```

### 2. Navigation principale
1. **Dashboard** : Vue d'ensemble des métriques
2. **Filtres** : Sidebar avec options de filtrage
3. **Table** : Liste paginée des activités
4. **Actions** : Export, actualisation, paramètres

### 3. Surveillance en temps réel
- **Auto-refresh** : Actualisation automatique toutes les 30 secondes
- **Notifications** : Alertes pour événements critiques
- **Indicateurs visuels** : Badges et couleurs pour identification rapide

### 4. Analyse des incidents
1. **Filtrer par erreurs** : `status = "error"`
2. **Période spécifique** : Utiliser les filtres de date
3. **Utilisateur suspect** : Filtrer par email utilisateur
4. **Événements sécurité** : Activer `securityOnly`

### 5. Export des données
- **Export global** : Bouton "Exporter" dans l'en-tête
- **Export détail** : Bouton dans le modal de détails
- **Formats** : JSON pour analyse technique

## 🔍 Cas d'usage typiques

### Enquête de sécurité
```typescript
// 1. Filtrer les événements de sécurité
securityOnly: true

// 2. Rechercher des connexions suspectes
actionType: "authentication"
status: "error"

// 3. Analyser une période spécifique
dateFrom: "2024-03-01"
dateTo: "2024-03-31"
```

### Audit d'un utilisateur
```typescript
// 1. Filtrer par utilisateur
userEmail: "user@example.com"

// 2. Voir toutes ses activités
// 3. Cliquer sur les détails pour contexte complet
```

### Surveillance des exports
```typescript
// 1. Filtrer les exports de données
actionType: "data_export"

// 2. Vérifier qui exporte quoi
// 3. Analyser les patterns d'export
```

## 🛠️ Maintenance et administration

### Configuration des administrateurs
Modifier le fichier `/lib/utils/adminAuth.ts` :
```typescript
const adminEmails = [
  "votre-admin@domaine.com",
  // Ajouter d'autres emails admin
];
```

### Rétention des logs
Les logs sont conservés indéfiniment. Pour implémenter une rétention :
```typescript
// Ajouter dans un job CRON
const cutoffDate = new Date();
cutoffDate.setMonth(cutoffDate.getMonth() - 6); // Garder 6 mois

await ACTIVITYLOG.deleteMany({
  timestamp: { $lt: cutoffDate },
  status: { $ne: 'error' } // Garder les erreurs plus longtemps
});
```

### Performance
- **Index MongoDB** : Automatiquement créés sur userId, timestamp, status
- **Pagination** : Limite de 50 logs par page maximum
- **Cache** : Stats mises en cache pendant 5 minutes

## 🚨 Alertes et notifications

### Événements critiques
- **Échecs de connexion répétés** : Plus de 5 échecs en 1 heure
- **Accès administrateur** : Toute action admin est loggée
- **Export de données** : Notifications automatiques
- **Erreurs système** : Taux d'erreur > 5%

### Configuration des alertes
```typescript
// Dans le futur : système d'alertes
const alertRules = [
  {
    name: "Connexions suspectes",
    condition: "failed_login > 5 in 1h",
    action: "notify_admin"
  },
  {
    name: "Export massif",
    condition: "data_export > 10 in 1h",
    action: "security_review"
  }
];
```

Cette interface offre une surveillance complète et professionnelle des activités utilisateur, essentielle pour la sécurité et la conformité du système ERP.