# Instructions pour tester le calcul de paie

## Test dans la console du navigateur

1. Ouvrez l'application dans le navigateur
2. Ouvrez les DevTools (F12)
3. Allez dans l'onglet Console
4. Exécutez ces commandes :

```javascript
// 1. Récupérer le store
const store = window.__PAYROLL_STORE__ || usePayrollStore.getState();

// 2. Vérifier les employés
console.log('Employés:', store.employees);

// 3. Créer une période si nécessaire
store.createPeriod(1, 2025);
console.log('Période créée:', store.currentPeriod);

// 4. Calculer pour un employé
const employeeId = store.employees[0]?._id;
if (employeeId) {
  store.calculateSalary(employeeId).then(result => {
    console.log('Calcul réussi:', result);
  }).catch(err => {
    console.error('Erreur:', err);
  });
}
```

## Test via l'interface

1. Allez dans la section Payroll
2. Sélectionnez un employé
3. Cliquez sur "Aperçu Bulletin"
4. Vérifiez la console pour les erreurs

## Points vérifiés par les corrections

✅ **Gestion de l'ID de période manquant**
- Le store génère automatiquement un ID temporaire si nécessaire
- Format: `period_YYYY_MM_timestamp`

✅ **Validation des employés**
- Vérification que l'employé existe avant le calcul
- Messages d'erreur détaillés avec la liste des employés disponibles

✅ **Messages d'erreur améliorés**
- "Employé introuvable: [id]" avec la liste des employés disponibles
- "Aucune période active. Veuillez créer une période de paie."
- Logs détaillés pour le débogage

## Structure des corrections

### 1. PayrollCalculator.tsx
- Validation de l'ID de période avant l'appel au calcul
- Création de période si l'ID est manquant

### 2. payrollStore.ts
- Génération automatique d'ID temporaire pour les périodes
- Validation robuste des employés et périodes
- Logs détaillés pour faciliter le débogage

### 3. Types
- Support du contractType pour exclure les freelancers
- Validation des types dans les calculs CNSS