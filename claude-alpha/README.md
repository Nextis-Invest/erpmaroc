# Claude Alpha - Système de Paie Marocain

## 📘 Documentation Instance Production

Claude Alpha est l'instance de production du système de calcul de paie marocain, entièrement configurée en français avec la devise Dirham Marocain (MAD/DH).

## 🎯 Caractéristiques Principales

- **Langue**: Français (terminologie officielle marocaine)
- **Devise**: Dirham Marocain (MAD/DH)
- **Format monétaire**: 1 234,56 DH
- **Instance**: Production (Alpha)
- **Version**: 1.0.0

## 📊 Éléments de Paie Calculés

### Cotisations Sociales
- **CNSS Part Salariale**: 4,48% (plafonné à 6 000 DH)
- **AMO Part Salariale**: 2,26% (sans plafond)
- **CIMR**: Taux variable selon accord d'entreprise
- **Assurance Groupe**: Optionnel

### Impôt sur le Revenu (IR)
Barème progressif mensuel:
- 0 - 2 500 DH: 0%
- 2 501 - 4 166,67 DH: 10%
- 4 167 - 5 000 DH: 20%
- 5 001 - 6 666,67 DH: 30%
- 6 667 - 15 000 DH: 34%
- Plus de 15 000 DH: 38%

### Prime d'Ancienneté
- Moins de 2 ans: 0%
- 2 à 5 ans: 5%
- 5 à 12 ans: 10%
- 12 à 20 ans: 15%
- 20 à 25 ans: 20%
- Plus de 25 ans: 25%

## 🚀 Installation

```bash
# Cloner le repository
git clone [repository-url]

# Accéder au dossier Claude Alpha
cd claude-alpha

# Installer les dépendances
npm install

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos paramètres
```

## ⚙️ Configuration

### Variables d'Environnement (.env)
```env
# Instance
INSTANCE=alpha
ENVIRONMENT=production

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paie_maroc
DB_USER=admin
DB_PASSWORD=secure_password

# API
API_PORT=3000
API_PREFIX=/api/v1

# Sécurité
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=1h

# Devise
CURRENCY_CODE=MAD
CURRENCY_SYMBOL=DH
CURRENCY_LOCALE=fr-MA
```

## 📡 Endpoints API

### Calcul de Paie
```http
POST /api/v1/paie/calculer
Content-Type: application/json
X-Instance: alpha

{
  "employe": {
    "matricule": "EMP001",
    "nom": "BENALI",
    "prenom": "Mohammed",
    "salaire_base": 10000,
    "anciennete_mois": 36,
    "situation_familiale": "MARIE",
    "nombre_enfants": 2,
    "primes_imposables": 1000,
    "primes_non_imposables": 500
  }
}
```

### Réponse
```json
{
  "statut": "succes",
  "message": "Calcul effectué avec succès",
  "donnees": {
    "entete": {
      "titre": "Bulletin de Paie",
      "periode": "2024-01",
      "entreprise": "ENTREPRISE"
    },
    "employe": {
      "matricule": "EMP001",
      "nom": "BENALI",
      "prenom": "Mohammed"
    },
    "recapitulatif": {
      "salaireBrut": "11 500,00 DH",
      "totalRetenues": "2 845,67 DH",
      "netAPayer": "9 154,33 DH"
    }
  }
}
```

### Calcul en Lot
```http
POST /api/v1/paie/calculer-lot
Content-Type: application/json

{
  "periode": "2024-01",
  "employes": [...]
}
```

### Récupération des Barèmes
```http
GET /api/v1/paie/baremes
```

### Export PDF
```http
POST /api/v1/paie/exporter-pdf
Content-Type: application/json

{
  "bulletin": {...}
}
```

### Vérification de Santé
```http
GET /api/v1/sante
```

## 💻 Utilisation du Moteur de Calcul

```javascript
const MoteurCalculPaieMarocain = require('./core/moteur-calcul-paie');

// Initialisation
const moteur = new MoteurCalculPaieMarocain({
  instance: 'alpha',
  entreprise: 'MA SOCIETE SARL'
});

// Données employé
const employe = {
  matricule: 'EMP001',
  nom: 'BENALI',
  prenom: 'Mohammed',
  cin: 'AB123456',
  numero_cnss: '123456789',
  salaire_base: 10000,
  anciennete_mois: 36,
  situation_familiale: 'MARIE',
  nombre_enfants: 2,
  primes_imposables: 1000,
  primes_non_imposables: 500,
  taux_cimr: 0.06,  // 6% CIMR
  taux_assurance: 0.02  // 2% Assurance
};

// Calcul du bulletin
const bulletin = moteur.calculerBulletinPaie(employe);

// Affichage du net à payer
console.log(`Net à payer: ${bulletin.recapitulatif.netAPayer}`);
```

## 📋 Structure du Bulletin de Paie

```javascript
{
  entete: {
    titre: "Bulletin de Paie",
    entreprise: "ENTREPRISE",
    periode: "2024-01"
  },

  employe: {
    matricule: "EMP001",
    nom: "BENALI",
    prenom: "Mohammed",
    situationFamiliale: "Marié(e)",
    nombreEnfants: 2
  },

  elementsPaie: {
    gains: [
      { libelle: "Salaire de Base", montant: "10 000,00 DH" },
      { libelle: "Prime d'Ancienneté (5%)", montant: "500,00 DH" },
      { libelle: "Indemnités Imposables", montant: "1 000,00 DH" }
    ],

    retenues: [
      { libelle: "CNSS Part Salariale", taux: "4,48%", montant: "268,80 DH" },
      { libelle: "AMO Part Salariale", taux: "2,26%", montant: "259,70 DH" },
      { libelle: "CIMR", taux: "6,00%", montant: "690,00 DH" },
      { libelle: "Impôt sur le Revenu", montant: "1 627,17 DH" }
    ],

    netAPayer: {
      libelle: "Net à Payer",
      montant: "9 154,33 DH"
    }
  },

  cotisationsPatronales: [
    { libelle: "CNSS Part Patronale", montant: "538,80 DH" },
    { libelle: "AMO Part Patronale", montant: "212,75 DH" },
    { libelle: "Taxe de Formation Professionnelle", montant: "184,00 DH" }
  ]
}
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Tests de performance
npm run test:performance

# Couverture de code
npm run test:coverage
```

## 📊 Monitoring

Le système inclut un monitoring complet:
- Métriques de performance (temps de calcul < 100ms)
- Taux d'erreur (< 0.1%)
- Audit trail complet
- Logs structurés

## 🔒 Sécurité

- Authentification JWT
- Chiffrement AES-256 pour données sensibles
- Validation stricte des entrées
- Audit complet des opérations
- Conformité GDPR et lois marocaines

## 📝 Conformité Légale

Le système respecte:
- Code Général des Impôts (CGI) marocain
- Loi sur la CNSS
- Réglementation AMO
- Code du Travail marocain
- Circulaires de la Direction Générale des Impôts

## 🆘 Support

Pour toute assistance:
- **Email**: support@entreprise.ma
- **Documentation**: [URL documentation]
- **Issues**: [GitHub Issues]

## 📄 Licence

Propriétaire - Tous droits réservés

---

**Version**: 1.0.0
**Dernière mise à jour**: Janvier 2024
**Instance**: Claude Alpha (Production)