# 🌍 Njikam Marietta Sinistre

**Surveillance mondiale des catastrophes naturelles en temps réel**

Application web moderne de visualisation et de suivi des catastrophes naturelles dans le monde, développée avec Next.js, HeroUI, et des APIs officielles de surveillance des catastrophes.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.3-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)

## ✨ Fonctionnalités

- 🗺️ **Carte interactive mondiale** avec Leaflet et clustering des événements
- 📊 **Statistiques en temps réel** avec graphiques Chart.js
- 🔔 **Alertes multi-sources** : GDACS, NASA EONET, USGS
- 🎯 **Filtrage avancé** par type de catastrophe et niveau de gravité
- 🌓 **Mode sombre/clair** avec next-themes
- 📱 **Design responsive** optimisé pour mobile, tablette et desktop
- ⚡ **Performance optimale** avec Next.js et chargement dynamique
- 🎨 **Interface moderne** avec HeroUI et Tailwind CSS

## 🎯 Types de catastrophes suivies

| Type | Icône | Source principale |
|------|-------|-------------------|
| Séismes | 🌍 | USGS, GDACS |
| Incendies | 🔥 | NASA EONET, GDACS |
| Cyclones | 🌪️ | GDACS |
| Inondations | 🌊 | GDACS |
| Volcans | 🌋 | NASA EONET, GDACS |
| Sécheresses | ☀️ | GDACS |
| Tempêtes | ⛈️ | NASA EONET |

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20.x ou supérieur
- npm, yarn, pnpm ou bun

### Installation

1. **Cloner le projet**
   ```bash
   cd sinistre
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

4. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## 🏗️ Architecture

```
sinistre/
├── components/           # Composants React réutilisables
│   ├── DisasterMap.tsx   # Carte Leaflet avec marqueurs
│   ├── DisasterChart.tsx # Graphique Chart.js
│   ├── StatsCard.tsx     # Cartes de statistiques
│   ├── FilterPanel.tsx   # Panneau de filtres
│   └── EventsList.tsx    # Liste des événements
├── pages/               # Pages Next.js
│   └── index.tsx        # Page principale
├── services/            # Services API
│   └── disasterApi.ts   # Intégration GDACS, EONET, USGS
├── types/               # Types TypeScript
│   └── disaster.ts      # Interfaces et types
├── layouts/             # Layouts de page
├── config/              # Configuration
└── public/              # Assets statiques
```

## 📡 Sources de données

### 1. GDACS (Global Disaster Alert and Coordination System)
- **URL**: https://www.gdacs.org
- **Couverture**: Mondiale
- **Types**: Séismes, cyclones, inondations, volcans, incendies, sécheresses
- **Mise à jour**: Temps réel
- **Gratuit**: Oui

### 2. NASA EONET (Earth Observatory Natural Event Tracker)
- **URL**: https://eonet.gsfc.nasa.gov
- **Couverture**: Mondiale
- **Types**: Incendies, tempêtes, volcans, événements naturels divers
- **Mise à jour**: Quasi temps réel
- **Gratuit**: Oui

### 3. USGS Earthquake Hazards Program
- **URL**: https://earthquake.usgs.gov
- **Couverture**: Mondiale
- **Types**: Séismes (M4.5+)
- **Mise à jour**: Temps réel
- **Gratuit**: Oui

### 4. NASA FIRMS (Fire Information for Resource Management System)
- **URL**: https://firms.modaps.eosdis.nasa.gov
- **Couverture**: Mondiale
- **Types**: Incendies actifs
- **Mise à jour**: < 60 secondes (US/Canada)
- **Gratuit**: Oui (clé API requise)
- **Note**: Non activé par défaut, voir section Configuration

## ⚙️ Configuration

### Ajouter NASA FIRMS (optionnel)

Pour activer la détection d'incendies avec NASA FIRMS :

1. Obtenir une clé API gratuite sur https://firms.modaps.eosdis.nasa.gov/api/
2. Créer un fichier `.env.local` à la racine du projet :
   ```env
   NEXT_PUBLIC_FIRMS_MAP_KEY=votre_cle_api_ici
   ```
3. Décommenter la ligne dans `services/disasterApi.ts` :
   ```typescript
   const [gdacsEvents, eonetEvents, usgsEvents, firmsEvents] = await Promise.all([
     fetchGDACSEvents(),
     fetchEONETEvents(),
     fetchUSGSEarthquakes(),
     fetchFIRMSFires(), // Décommenter cette ligne
   ]);
   ```

## 🛠️ Technologies utilisées

### Frontend
- **[Next.js 15](https://nextjs.org/)** - Framework React avec SSR/SSG
- **[React 18](https://react.dev/)** - Bibliothèque UI
- **[TypeScript 5.6](https://www.typescriptlang.org/)** - Typage statique
- **[HeroUI](https://heroui.com/)** - Composants UI modernes
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first

### Cartographie & Visualisation
- **[Leaflet](https://leafletjs.com/)** - Bibliothèque de cartes interactives
- **[React Leaflet](https://react-leaflet.js.org/)** - Wrapper React pour Leaflet
- **[Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)** - Clustering de marqueurs
- **[Chart.js](https://www.chartjs.org/)** - Graphiques interactifs
- **[react-chartjs-2](https://react-chartjs-2.js.org/)** - Wrapper React pour Chart.js

### Autres
- **[Framer Motion](https://www.framer.com/motion/)** - Animations
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Gestion des thèmes

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- 📱 **Mobile** : 320px - 767px
- 📱 **Tablette** : 768px - 1023px
- 💻 **Desktop** : 1024px et plus

## 🎨 Personnalisation

### Modifier les couleurs

Les couleurs des catastrophes sont définies dans `components/DisasterMap.tsx` et peuvent être personnalisées :

```typescript
const disasterColors = {
  earthquake: '#ef5350', // Rouge
  fire: '#ff9800',       // Orange
  cyclone: '#42a5f5',    // Bleu
  flood: '#66bb6a',      // Vert
  volcano: '#ab47bc',    // Violet
  drought: '#fdd835',    // Jaune
};
```

### Modifier le thème HeroUI

Éditer `tailwind.config.js` pour personnaliser les couleurs et le thème :

```javascript
plugins: [
  heroui({
    themes: {
      light: { /* Configuration du thème clair */ },
      dark: { /* Configuration du thème sombre */ },
    },
  }),
],
```

## 🚢 Déploiement

### Vercel (recommandé)

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement (si nécessaire)
3. Déployer automatiquement

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Build production

```bash
npm run build
npm run start
```

## 🧪 Scripts disponibles

```bash
npm run dev      # Lancer le serveur de développement
npm run build    # Créer le build de production
npm run start    # Lancer le serveur de production
npm run lint     # Linter le code
```

## 📊 Performance

- ⚡ **Lighthouse Score** : 90+
- 🎯 **First Contentful Paint** : < 1.5s
- 📦 **Bundle Size** : Optimisé avec tree-shaking
- 🔄 **Mise à jour des données** : Incrémentale (7 derniers jours)

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Roadmap

- [ ] Notifications push pour les nouvelles catastrophes
- [ ] Système d'alertes personnalisées par zone géographique
- [ ] Export des données en CSV/JSON
- [ ] Mode hors ligne avec service worker
- [ ] Support multilingue (EN, ES, AR)
- [ ] Intégration avec plus de sources (NOAA, Copernicus)
- [ ] Statistiques historiques et tendances
- [ ] API REST pour développeurs tiers

## 🐛 Problèmes connus

### CORS avec certaines APIs
Certaines APIs peuvent rencontrer des problèmes CORS. Solutions :
- Utiliser un proxy CORS (déjà implémenté pour certaines APIs)
- Configurer Next.js rewrites dans `next.config.js`

### Leaflet et SSR
Leaflet ne supporte pas le Server-Side Rendering. L'application utilise le chargement dynamique avec `next/dynamic` et `ssr: false`.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

**Njikam Marietta**

## 🙏 Remerciements

- **GDACS** pour les données de catastrophes mondiales
- **NASA EONET** pour les événements naturels en temps réel
- **USGS** pour les données sismiques
- **OpenStreetMap** pour les tuiles de carte gratuites
- **HeroUI** pour les composants UI magnifiques
- **Leaflet** pour la bibliothèque de cartographie

---

⭐ Si vous trouvez ce projet utile, n'hésitez pas à lui donner une étoile !

🔗 **Liens utiles**
- [Documentation GDACS API](https://www.gdacs.org/Documents/2025/GDACS_API_quickstart_v1.pdf)
- [Documentation NASA EONET](https://eonet.gsfc.nasa.gov/docs/v3)
- [Documentation USGS](https://earthquake.usgs.gov/fdsnws/event/1/)
- [Documentation Leaflet](https://leafletjs.com/reference.html)
- [Documentation HeroUI](https://heroui.com/docs)
