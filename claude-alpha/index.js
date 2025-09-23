/**
 * Point d'entrée principal - Claude Alpha
 * Système de Paie Marocain en Production
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import des routes
const routesPaie = require('./api/routes-paie');

// Initialisation de l'application
const app = express();
const PORT = process.env.API_PORT || 3000;

// Configuration de la langue et devise
process.env.LANG = 'fr_MA';
process.env.CURRENCY = 'MAD';

// Middlewares de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => {
      console.log(`[${new Date().toISOString()}] ${message.trim()}`);
    }
  }
}));

// Middleware de langue française
app.use((req, res, next) => {
  req.locale = 'fr-MA';
  req.currency = 'MAD';
  res.setHeader('Content-Language', 'fr');
  next();
});

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur Claude Alpha - Système de Paie Marocain',
    instance: 'alpha',
    environnement: 'production',
    version: '1.0.0',
    langue: 'Français',
    devise: 'Dirham Marocain (MAD)',
    documentation: '/api/v1/documentation'
  });
});

// Routes API
app.use('/', routesPaie);

// Documentation API simple
app.get('/api/v1/documentation', (req, res) => {
  res.json({
    titre: 'Documentation API Claude Alpha',
    version: '1.0.0',
    langue: 'Français',
    devise: 'MAD (Dirham Marocain)',
    endpoints: [
      {
        methode: 'POST',
        route: '/api/v1/paie/calculer',
        description: 'Calcul du bulletin de paie pour un employé',
        parametres: {
          employe: {
            matricule: 'string (obligatoire)',
            nom: 'string',
            prenom: 'string',
            salaire_base: 'number (obligatoire)',
            anciennete_mois: 'number',
            situation_familiale: 'CELIBATAIRE | MARIE',
            nombre_enfants: 'number'
          }
        }
      },
      {
        methode: 'POST',
        route: '/api/v1/paie/calculer-lot',
        description: 'Calcul en lot pour plusieurs employés'
      },
      {
        methode: 'GET',
        route: '/api/v1/paie/baremes',
        description: 'Récupération des barèmes et constantes de paie'
      },
      {
        methode: 'POST',
        route: '/api/v1/paie/valider',
        description: 'Validation d\'un bulletin de paie'
      },
      {
        methode: 'POST',
        route: '/api/v1/paie/exporter-pdf',
        description: 'Export PDF d\'un bulletin de paie'
      },
      {
        methode: 'GET',
        route: '/api/v1/paie/historique/:matricule',
        description: 'Historique de paie d\'un employé'
      },
      {
        methode: 'GET',
        route: '/api/v1/sante',
        description: 'Vérification de santé de l\'API'
      }
    ]
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    statut: 'erreur',
    message: 'Route non trouvée',
    route_demandee: req.originalUrl,
    methode: req.method,
    suggestion: 'Consultez /api/v1/documentation pour la liste des endpoints disponibles'
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur:', err);

  res.status(err.status || 500).json({
    statut: 'erreur',
    message: err.message || 'Erreur interne du serveur',
    code: err.code || 'ERREUR_SERVEUR',
    instance: 'alpha',
    horodatage: new Date().toISOString()
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║      Claude Alpha - Système de Paie Marocain          ║');
  console.log('║                                                        ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  Instance:        Alpha (Production)                  ║`);
  console.log(`║  Port:            ${PORT}                                ║`);
  console.log(`║  Environnement:   ${process.env.NODE_ENV || 'production'}                         ║`);
  console.log('║  Langue:          Français                            ║');
  console.log('║  Devise:          Dirham Marocain (MAD)               ║');
  console.log('║  Version:         1.0.0                               ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  API:             http://localhost:${PORT}/api/v1       ║`);
  console.log(`║  Documentation:   http://localhost:${PORT}/api/v1/documentation ║`);
  console.log(`║  Santé:           http://localhost:${PORT}/api/v1/sante ║`);
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`[${new Date().toISOString()}] Serveur démarré et prêt à recevoir des requêtes`);
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] Signal SIGTERM reçu: fermeture du serveur...`);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(`\n[${new Date().toISOString()}] Signal SIGINT reçu: fermeture du serveur...`);
  process.exit(0);
});

module.exports = app;