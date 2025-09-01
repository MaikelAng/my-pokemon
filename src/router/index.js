import { createRouter, createWebHistory } from 'vue-router'
import PokemonList from '../components/PokemonList.vue'
import PokemonDetails from '../components/PokemonDetails.vue'

// Define routes
const routes = [
  {
    path: '/', // default page (homepage)
    name: 'PokemonList', // route name
    component: PokemonList, // shows the list of Pokémon
  },
  {
    path: '/pokemon/:id', // dynamic route
    name: 'PokemonDetails', // route name
    component: PokemonDetails, // shows details for the selected Pokémon
    props: true, // pass ":id" from URL as a prop to the component
  },
]

// Create router instance
const router = createRouter({
  history: createWebHistory(), // enables clean URLs without #
  routes, // attach defined routes
})

export default router // export router for use in main.js
