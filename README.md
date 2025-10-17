# FOOD BAROMETER

Un'application mobile pour le suivi de l'alimentation avec support multilingue.

## 📋 Aperçu du Projet

**FOOD BAROMETER** est une application web mobile construite avec React qui aide les utilisateurs à suivre leur consommation alimentaire et à surveiller leur santé nutritionnelle.

### ✨ Fonctionnalités Principales

- ��� **Écran de démarrage** avec branding de l'application
- ��� **Authentification sociale** (simulation Facebook/Google)
- ��� **Questionnaire d'inscription** en plusieurs étapes
- ��� **Tableau de bord** avec graphiques de progression IMC
- ��� **Calendrier hebdomadaire** d'apport alimentaire
- ��� **Enregistrement alimentaire** par voix et texte
- ��� **Système de notifications** push
- ��� **Gestion de profil**

### ��� Support Multilingue

- **Français** (par défaut)
- **Anglais**
- **Créole Mauricien**
- **Créole Réunionnais**

## ���️ Stack Technique

- **React 18+** avec TypeScript
- **Vite** pour les outils de build
- **React Router** pour la navigation
- **Context API** pour la gestion d'état
- **react-i18next** pour l'internationalisation
- **React Hook Form** pour la gestion des formulaires
- **Design responsive** mobile-first

## ��� Démarrage Rapide

### Prérequis

- Node.js 20.19+ ou 22.12+
- npm ou yarn

### Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd food-barometers
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Ouvrir dans le navigateur**
   - Accédez à `http://localhost:5173`

### Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run preview` - Prévisualise le build de production
- `npm run lint` - Exécute ESLint

## ��� Structure de l'Application

```
src/
├── components/          # Composants réutilisables
├── pages/              # Pages principales
│   ├── SplashScreen.tsx
│   ├── AuthPage.tsx
│   ├── Registration/
│   ├── Home.tsx
│   └── Profile.tsx
├── contexts/           # Contextes React
│   └── AuthContext.tsx
├── locales/           # Fichiers de traduction
│   ├── fr.ts
│   ├── en.ts
│   └── index.ts
├── types/             # Définitions TypeScript
└── utils/             # Fonctions utilitaires
```

## ��� Configuration

### Variables d'Environnement

Créez un fichier `.env.local` pour les variables d'environnement :

```env
VITE_API_BASE_URL=https://api.foodbarometers.com
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Progressive Web App (PWA)

L'application est configurée pour être installable en tant que PWA sur les appareils mobiles.

## ��� Questionnaire d'Inscription

Le questionnaire comprend 13 questions couvrant :

- Informations démographiques
- Situation professionnelle
- Niveau d'éducation
- Situation conjugale
- Revenus du foyer
- Composition du ménage

## ���️ Enregistrement Alimentaire

Les utilisateurs peuvent enregistrer leurs repas via :

- **Saisie manuelle** avec formulaire détaillé
- **Enregistrement vocal** avec transcription automatique

### Données Capturées

- Heure de consommation
- Dénomination de la prise
- Composition des aliments
- Mode de préparation
- Lieu de consommation
- Contexte social
- Modalités de consommation
- Durée du repas
- Différences par rapport aux habitudes

## ��� Notifications

- Rappels quotidiens pour l'enregistrement des repas
- Notifications de progression
- Alertes santé personnalisées

## ��� Déploiement

### Build de Production

```bash
npm run build
```

### Déploiement sur Vercel

```bash
npm install -g vercel
vercel --prod
```

### Déploiement sur Netlify

```bash
npm run build
# Déployez le dossier `dist/`
```

## ��� Contribution

1. Fork le projet
2. Créez votre branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## ��� Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## ��� Support

Pour toute question ou problème :

- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement
- Consultez la documentation API

---

**FOOD BAROMETER** - Suivez votre alimentation, améliorez votre santé 🍎
