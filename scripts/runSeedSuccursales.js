#!/usr/bin/env node

/**
 * Script to seed the database with Moroccan succursales data
 * Usage: node scripts/runSeedSuccursales.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Lancement du seeding des succursales...\n');

try {
  // Run the TypeScript seeding script using tsx
  const scriptPath = path.join(__dirname, 'seedSuccursales.ts');

  console.log('📂 Chemin du script:', scriptPath);
  console.log('⚡ Exécution du script de seeding...\n');

  execSync(`npx tsx "${scriptPath}"`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('\n✅ Seeding terminé avec succès!');
  console.log('🔗 Vous pouvez maintenant accéder à /succursales dans votre application');

} catch (error) {
  console.error('\n❌ Erreur lors du seeding:');
  console.error(error.message);

  console.log('\n💡 Conseils de dépannage:');
  console.log('1. Vérifiez que MongoDB est en cours d\'exécution');
  console.log('2. Vérifiez vos variables d\'environnement de base de données');
  console.log('3. Assurez-vous que les dépendances sont installées (pnpm install)');

  process.exit(1);
}