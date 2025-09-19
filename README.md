# FOOD BAROMETERS

Un'application mobile pour le suivi de l'alimentation avec support multilingue.

## íº€ AperÃ§u du Projet

**FOOD BAROMETERS** est une application web mobile construite avec React qui aide les utilisateurs Ã  suivre leur consommation alimentaire et Ã  surveiller leur santÃ© nutritionnelle.

### âœ¨ FonctionnalitÃ©s Principales

- í¾¨ **Ã‰cran de dÃ©marrage** avec branding de l'application
- í´ **Authentification sociale** (simulation Facebook/Google)
- í³ **Questionnaire d'inscription** en plusieurs Ã©tapes
- í³Š **Tableau de bord** avec graphiques de progression IMC
- í³… **Calendrier hebdomadaire** d'apport alimentaire
- í¾¤ **Enregistrement alimentaire** par voix et texte
- í´” **SystÃ¨me de notifications** push
- í±¤ **Gestion de profil**

### í¼ Support Multilingue

- **FranÃ§ais** (par dÃ©faut)
- **Anglais**
- **CrÃ©ole Mauricien**
- **CrÃ©ole RÃ©unionnais**

## í» ï¸ Stack Technique

- **React 18+** avec TypeScript
- **Vite** pour les outils de build
- **React Router** pour la navigation
- **Context API** pour la gestion d'Ã©tat
- **react-i18next** pour l'internationalisation
- **React Hook Form** pour la gestion des formulaires
- **Design responsive** mobile-first

## íº€ DÃ©marrage Rapide

### PrÃ©requis

- Node.js 20.19+ ou 22.12+
- npm ou yarn

### Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd food-barometers
   ```

2. **Installer les dÃ©pendances**
   ```bash
   npm install
   ```

3. **DÃ©marrer le serveur de dÃ©veloppement**
   ```bash
   npm run dev
   ```

4. **Ouvrir dans le navigateur**
   - AccÃ©dez Ã  `http://localhost:5173`

### Scripts Disponibles

- `npm run dev` - DÃ©marre le serveur de dÃ©veloppement
- `npm run build` - Construit l'application pour la production
- `npm run preview` - PrÃ©visualise le build de production
- `npm run lint` - ExÃ©cute ESLint

## í³± Structure de l'Application

```
src/
â”œâ”€â”€ components/          # Composants rÃ©utilisables
â”œâ”€â”€ pages/              # Pages principales
â”‚   â”œâ”€â”€ SplashScreen.tsx
â”‚   â”œâ”€â”€ AuthPage.tsx
â”‚   â”œâ”€â”€ Registration/
â”‚   â”œâ”€â”€ Home.tsx
â”‚   â””â”€â”€ Profile.tsx
â”œâ”€â”€ contexts/           # Contextes React
â”‚   â””â”€â”€ AuthContext.tsx
â”œâ”€â”€ locales/           # Fichiers de traduction
â”‚   â”œâ”€â”€ fr.ts
â”‚   â”œâ”€â”€ en.ts
â”‚   â””â”€â”€ index.ts
â”œâ”€â”€ types/             # DÃ©finitions TypeScript
â””â”€â”€ utils/             # Fonctions utilitaires
```

## í´§ Configuration

### Variables d'Environnement

CrÃ©ez un fichier `.env.local` pour les variables d'environnement :

```env
VITE_API_BASE_URL=https://api.foodbarometers.com
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Progressive Web App (PWA)

L'application est configurÃ©e pour Ãªtre installable en tant que PWA sur les appareils mobiles.

## í³Š Questionnaire d'Inscription

Le questionnaire comprend 13 questions couvrant :

- Informations dÃ©mographiques
- Situation professionnelle
- Niveau d'Ã©ducation
- Situation conjugale
- Revenus du foyer
- Composition du mÃ©nage

## í½½ï¸ Enregistrement Alimentaire

Les utilisateurs peuvent enregistrer leurs repas via :

- **Saisie manuelle** avec formulaire dÃ©taillÃ©
- **Enregistrement vocal** avec transcription automatique

### DonnÃ©es CapturÃ©es

- Heure de consommation
- DÃ©nomination de la prise
- Composition des aliments
- Mode de prÃ©paration
- Lieu de consommation
- Contexte social
- ModalitÃ©s de consommation
- DurÃ©e du repas
- DiffÃ©rences par rapport aux habitudes

## í´” Notifications

- Rappels quotidiens pour l'enregistrement des repas
- Notifications de progression
- Alertes santÃ© personnalisÃ©es

## íº€ DÃ©ploiement

### Build de Production

```bash
npm run build
```

### DÃ©ploiement sur Vercel

```bash
npm install -g vercel
vercel --prod
```

### DÃ©ploiement sur Netlify

```bash
npm run build
# DÃ©ployez le dossier `dist/`
```

## í´ Contribution

1. Fork le projet
2. CrÃ©ez votre branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## í³ Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de dÃ©tails.

## í¶˜ Support

Pour toute question ou problÃ¨me :

- Ouvrez une issue sur GitHub
- Contactez l'Ã©quipe de dÃ©veloppement
- Consultez la documentation API

---

**FOOD BAROMETERS** - Suivez votre alimentation, amÃ©liorez votre santÃ© íµ—í³±
