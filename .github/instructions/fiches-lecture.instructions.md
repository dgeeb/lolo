---
description: "Use when creating or editing a fiche de lecture HTML file for the Lolo study guide app. Covers exact HTML structure, CSS classes, nav integration, and integration steps."
applyTo: "*.html"
---

# Fiches de Lecture — Instructions de création

## Contexte du projet

Application de fiches de lecture pour les épreuves de français (bac). Chaque fiche est un fichier HTML autonome qui utilise les fichiers partagés `styles.css` et `script.js`. La navigation est **entièrement gérée par `script.js`** via le tableau `NAV_LINKS` — il ne faut JAMAIS écrire de liens `<li>` manuellement dans le HTML.

---

## Structure HTML obligatoire — à respecter exactement

### 1. Squelette page complet

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fiches de Lecture</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

<div class="global-nav">
  <div class="nav-container">
    <div class="nav-title">Fiches de Lecture</div>
    <button class="dark-mode-toggle" id="dark-mode-btn" title="Activer le mode sombre">🌙</button>
    <ul class="nav-links"></ul>   <!-- TOUJOURS VIDE — script.js remplit automatiquement -->
  </div>
</div>

<div class="app">
  <div class="tabs">
    <button class="tab active" onclick="switchTab('fiche',this)">Fiche de préparation</button>
    <button class="tab" onclick="switchTab('notes',this)">Notes d'oral</button>
  </div>

  <div class="panel active" id="panel-fiche">
    <!-- contenu fiche ici -->
  </div>

  <div class="panel" id="panel-notes">
    <!-- contenu notes ici -->
  </div>
</div>

<script src="script.js"></script>
</body>
</html>
```

### 2. En-tête de fiche (dans panel-fiche)

```html
<div class="header">
  <h1>Titre de l'œuvre — Sous-titre</h1>
  <p>Auteur · Objet d'étude · Parcours : Nom du parcours</p>
</div>
```

### 3. Barème (toujours avec `<span>`, jamais de `<strong>` ni d'emoji)

```html
<div class="barème">
  <div class="pt">Lecture <span>/2</span></div>
  <div class="pt">Commentaire linéaire <span>/8</span></div>
  <div class="pt">Grammaire <span>/2</span></div>
  <div class="pt">Œuvre <span>/3</span></div>
  <div class="pt">Entretien <span>/5</span></div>
</div>
```

### 4. Section (6 sections standard)

```html
<div class="section">
  <div class="sec-head">
    <span class="badge b-COULEUR">NUMÉRO</span>
    <h2>Titre de la section</h2>
    <!-- optionnel, à droite : <span class="badge b-COULEUR ml-auto">/8</span> -->
  </div>
  <div class="sec-body">
    <!-- contenu -->
  </div>
</div>
```

Couleurs disponibles pour les badges : `b-purple`, `b-teal`, `b-coral`, `b-blue`, `b-amber`, `b-pink`  
Convention d'affectation : 1=purple, 2=teal, 3=coral, 4=blue, 5=amber, 6=pink

### 5. Lecture expressive (section 2) — utiliser des `diction-tag`

```html
<div class="diction">
  <div class="diction-tag">Instruction de diction ou citation avec explication</div>
  <div class="diction-tag"><span class="cite">« citation »</span> → explication</div>
</div>
```

### 6. Problématique (section 3) — dans un `.pb`

```html
<div class="pb">Texte de la problématique en une ou deux phrases.</div>
```

### 7. Mouvements (dans section 4)

```html
<div class="mouvement">
  <div class="mv-title">
    <div class="mv-num">1</div>  <!-- CHIFFRE SEUL, jamais "Mouvement 1" -->
    Titre du mouvement
  </div>
  <p>Analyse...</p>
  <div class="tags">
    <span class="procede">Nom du procédé</span>
  </div>
</div>
```

⚠️ `mv-num` contient UNIQUEMENT le chiffre (1, 2, 3). Pas de texte "Mouvement 1".

### 8. Pistes d'entretien (section 6)

```html
<div class="piste">
  <div class="piste-num">1</div>  <!-- CHIFFRE SEUL, jamais "Piste 1" -->
  <p>Texte de la piste...</p>
</div>
```

### 9. Panel notes — structure complète obligatoire

```html
<div class="panel" id="panel-notes">
  <div class="notes-header">
    <h2>Notes d'oral — Titre</h2>
    <button class="export-btn" onclick="exportPDF()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Exporter en PDF
    </button>
  </div>
  <div class="notes-meta">Auteur · <em>Œuvre</em> · Année · Contexte</div>

  <div class="note-block nb-COULEUR">
    <h3>Titre de la note</h3>
    <div class="note-line">
      <div class="bullet"></div>  <!-- TOUJOURS <div>, jamais un emoji -->
      <p>Contenu avec <span class="note-kw">mot-clé</span> ou <span class="note-cite">« citation »</span></p>
    </div>
  </div>
</div>
```

Couleurs des note-blocks : `nb-purple`, `nb-teal`, `nb-coral`, `nb-blue`, `nb-amber`, `nb-pink`

---

## Classes utiles dans le contenu

| Classe | Usage |
|--------|-------|
| `<span class="cite">« texte »</span>` | Citation du texte étudié |
| `<span class="note-kw">mot</span>` | Mot-clé dans les notes |
| `<span class="note-cite">« texte »</span>` | Citation dans les notes |
| `<span class="note-it">texte</span>` | Italique / avertissement dans les notes |
| `<div class="pb">...</div>` | Problématique (fond dégradé, texte blanc) |

---

## Nommage du fichier

Convention : `fiche_{auteur}_{repere}_v2.html`  
Exemples : `fiche_le_mal_rimbaud_v2.html`, `fiche_menteur_III5_v2.html`, `colloque-sentimental-v2.html`

---

## Intégration — 2 étapes obligatoires après création du fichier

### Étape 1 — Ajouter dans `script.js`

Dans le tableau `NAV_LINKS`, ajouter une ligne :

```js
{ href: 'nom-du-fichier-v2.html', label: 'Titre affiché dans la nav' },
```

Le lien actif est détecté automatiquement — pas de `class="active"` à ajouter.

### Étape 2 — Ajouter dans `index.html`

Dans la section `.home-links` :

```html
<a class="home-link" href="nom-du-fichier-v2.html">Titre — Auteur</a>
```

---

## Erreurs fréquentes à éviter

| ❌ Incorrect | ✅ Correct |
|-------------|-----------|
| `<ul class="nav-links"><li>...</li></ul>` | `<ul class="nav-links"></ul>` (toujours vide) |
| `<div class="mv-num">Mouvement 1</div>` | `<div class="mv-num">1</div>` |
| `<div class="piste-num">Piste 1</div>` | `<div class="piste-num">1</div>` |
| `<div class="pt">Lecture <strong>/2</strong></div>` | `<div class="pt">Lecture <span>/2</span></div>` |
| `<span class="bullet"></span>` ou emoji 📌 | `<div class="bullet"></div>` |
| `<div class="sec-head"><span class="badge b-X">1 — Titre</span></div>` | `<span class="badge b-X">1</span><h2>Titre</h2>` |
| `class="active"` sur un lien nav | Jamais — script.js gère ça |
