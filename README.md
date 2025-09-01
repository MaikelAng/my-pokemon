# my-pokemon — Pokémon Deck (Vue 3 + JavaScript + Bootstrap 5.3 + Pinia)

**my-pokemon** is a simple Pokémon Deck built with **Vue 3**, **JavaScript**, **Vite**, **Bootstrap 5.3**, and **Pinia** for state management.

---

## Features

* Search and explore Pokémon data.
* **Responsive UI** with Bootstrap 5.3 utility classes and components.
* **Centralized state management** via Pinia.
* **Fast Hot Module Replacement (HMR)** and modern tooling with Vite.

---

## Tech Stack

* **Framework:** Vue 3 (Composition API + `<script setup>`)
* **Language:** JavaScript (ESNext)
* **Tooling:** Vite
* **Styling:** Bootstrap 5.3
* **State Management:** Pinia
* **API:** https://pokeapi.co/
---

## Prerequisites

* **Node.js** v22+ (LTS recommended) and **npm** v10+
* **Git**

> Check versions:

```bash
node -v
npm -v
```

---

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/MaikelAng/my-pokemon.git
cd my-pokemon
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

Vite serves the app (by default) at: **[http://localhost:3000](http://localhost:3000)**

---

## Build for Production

```bash
npm run build
```

The production build is emitted to the `dist` folder.

**Preview the production build:**

```bash
npm run preview
```

---

## Project Structure (Suggested)

```
my-pokemon/
├─ index.html
├─ package.json
├─ vite.config.js
├─ /public
├─ /src
│  ├─ main.js
│  ├─ App.vue
│  ├─ /assets
│  ├─ /components
│  │   ├─ PokemonCard.vue
│  │   ├─ SearchBar.vue
│  │   └─ Loader.vue
│  ├─ /pages
│  │   ├─ HomePage.vue
│  │   └─ PokemonDetail.vue
│  ├─ /stores
│  │   └─ pokemon.js
└─ /node_modules
```

## License

This project is provided under your chosen license. If unspecified, consider **MIT License** for open-source usage.

---

**Enjoy exploring Pokémon with my-pokemon built in Vue 3 + JavaScript + Bootstrap 5.3 + Pinia!**
