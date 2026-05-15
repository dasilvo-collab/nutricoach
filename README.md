# NutriCoach 🥗

App de planification nutritionnelle personnalisée pour Olivier.

---

## Déploiement en 3 étapes

### Prérequis
- [Node.js](https://nodejs.org) installé sur ton PC (version 18+)
- Un compte [GitHub](https://github.com) (gratuit)
- Un compte [Vercel](https://vercel.com) (gratuit)

---

### Étape 1 — Tester en local (optionnel)

```bash
# Dans le dossier du projet
npm install
npm run dev
```

Ouvre http://localhost:5173 dans ton navigateur.

---

### Étape 2 — Mettre sur GitHub

```bash
git init
git add .
git commit -m "NutriCoach v1"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/nutricoach.git
git push -u origin main
```

Remplace `TON_USERNAME` par ton pseudo GitHub.

---

### Étape 3 — Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com) → **"Add New Project"**
2. Connecte GitHub → sélectionne le repo `nutricoach`
3. Laisse tous les réglages par défaut (Vite est détecté automatiquement)
4. Clique **"Deploy"** → attends ~2 minutes
5. Vercel te donne une URL : `https://nutricoach-xxx.vercel.app`

---

### Étape 4 — Ajouter à l'écran d'accueil iPhone

1. Ouvre **Safari** (pas Chrome) sur ton iPhone
2. Va sur ton URL Vercel
3. Bouton **partage** (carré + flèche) → **"Sur l'écran d'accueil"**
4. Nomme-la **"NutriCoach"** → **"Ajouter"**

L'app s'ouvre en plein écran comme une vraie app native.

---

## Mettre à jour l'app

Quand tu reçois une nouvelle version de `NutriCoach.jsx` depuis Claude :

1. Remplace le fichier `src/NutriCoach.jsx`
2. Dans le terminal :

```bash
git add .
git commit -m "Mise à jour NutriCoach"
git push
```

Vercel redéploie automatiquement en ~1 minute. L'app sur ton iPhone se met à jour au prochain rechargement.

---

## Sauvegarde des données

Les données (planning, profil, préférences) sont sauvegardées dans le `localStorage` de ton navigateur/app. Elles persistent entre les sessions tant que tu utilises le même appareil et la même app.

Pour transférer vers un nouvel appareil : utilise le bouton **📋 Copier / Restaurer planning** dans l'onglet Semaine.
"# nutricoach" 
