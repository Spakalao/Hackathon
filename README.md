# Budget Travel Planner

Un planificateur de voyage alimenté par l'IA qui aide les utilisateurs à créer des itinéraires de voyage personnalisés en fonction de leur budget.

## 🌟 Fonctionnalités

- **Interface de conversation IA** : Décrivez vos préférences de voyage en langage naturel
- **Optimisation intelligente du budget** : Recevez des plans de voyage personnalisés optimisés pour votre budget
- **Itinéraires complets** : Avec hébergements, activités, transports et repas
- **Expérience interactive** : Interface utilisateur attrayante avec animations et éléments visuels
- **Design responsive** : Fonctionne sur ordinateurs, tablettes et appareils mobiles

## 📋 Prérequis

- Node.js (v18.0.0 ou supérieur)
- npm ou yarn
- Clé API OpenAI (pour les fonctionnalités d'IA)

## 🚀 Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/yourusername/budget-travel-planner.git
   cd budget-travel-planner
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   # Copier le fichier d'exemple
   cp .env.local.example .env.local
   # Ajouter votre clé API OpenAI dans le fichier .env.local
   ```

4. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. **Ouvrir le navigateur**
   L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000)

## 🔧 Scripts disponibles

- **Développement** : `npm run dev` ou `yarn dev`
  - Démarre le serveur de développement avec Turbopack pour de meilleures performances

- **Build** : `npm run build` ou `yarn build`
  - Compile l'application pour la production

- **Démarrage** : `npm start` ou `yarn start`
  - Lance l'application en mode production après la compilation

- **Lint** : `npm run lint` ou `yarn lint`
  - Vérifie le code selon les règles ESLint

## 📁 Structure du projet

```
budget-travel-planner/
├── app/                        # Répertoire principal de l'application Next.js
│   ├── api/                    # Routes API
│   ├── components/             # Composants React
│   │   ├── ChatInterface.tsx   # Interface de conversation IA
│   │   ├── Footer.tsx          # Composant du pied de page
│   │   ├── Header.tsx          # Composant d'en-tête
│   │   ├── TravelForm.tsx      # Formulaire de préférences de voyage
│   │   └── TravelItinerary.tsx # Affichage du plan de voyage
│   ├── globals.css             # Styles globaux (Tailwind CSS)
│   ├── layout.tsx              # Composant de mise en page racine
│   └── page.tsx                # Composant de page principal
├── public/                     # Ressources statiques
├── .env.local                  # Variables d'environnement (à créer)
├── .env.local.example          # Exemple de variables d'environnement
├── next.config.ts              # Configuration Next.js
├── package.json                # Dépendances et scripts
└── tsconfig.json               # Configuration TypeScript
```

## 🧠 Implémentation de l'IA

L'application utilise l'API OpenAI de deux manières principales :

1. **Interface de chat** : Permet aux utilisateurs d'avoir des conversations naturelles sur leurs préférences de voyage et d'obtenir des recommandations.

2. **Génération d'itinéraire** : Traite les préférences de l'utilisateur pour générer un plan de voyage complet optimisé pour leur budget.

## 📝 Variables d'environnement

Créez un fichier `.env.local` avec les variables suivantes :

```
# API OpenAI
OPENAI_API_KEY=votre_clé_api_openai

# Configuration de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ⚠️ Dépendances potentiellement inutilisées

Les dépendances suivantes peuvent être supprimées si elles ne sont pas utilisées dans votre projet :

- **@types/react-datepicker** et **react-datepicker** : Si vous n'utilisez pas de sélecteur de date personnalisé
- **ai** : Peut être supprimé si vous utilisez directement l'API OpenAI sans cette bibliothèque

Pour supprimer une dépendance inutilisée :
```bash
npm uninstall nom_de_la_dépendance
# ou
yarn remove nom_de_la_dépendance
```

## 📋 Note concernant la duplication de répertoire

Il semble qu'il y ait un dossier `budget-travel-planner` à l'intérieur du dossier principal du projet. Cette structure dupliquée n'est pas nécessaire et peut entraîner des erreurs. Nous avons ajouté ce dossier dans le `.gitignore` pour éviter qu'il ne soit versionné.

## 👥 Fait par
ENSI STUDENTS
