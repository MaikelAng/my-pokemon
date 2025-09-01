<template>
  <div class="container mt-4">
    <!-- ===== Header section ===== -->
    <div class="text-center mb-4">
      <h1
        class="pokemon-title d-flex align-items-center justify-content-center gap-2"
      >
        <BoltIcon class="icon-md text-warning" />
        Pokémon Deck
        <BoltIcon class="icon-md text-warning" />
      </h1>
      <p class="text-muted">Explore your favorite Pokémon Characters</p>
    </div>

    <!-- ===== Search section ===== -->
    <div class="search-box mb-4">
      <div class="input-group input-group-lg">
        <span class="input-group-text bg-white text-black">
          <MagnifyingGlassIcon class="icon-sm" />
        </span>
        <input
          type="text"
          class="form-control"
          placeholder="Search Pokémon..."
          v-model="search"
        />
        <span class="input-group-text bg-light">
          {{ results.length }} found
        </span>
      </div>
    </div>

    <!-- ===== Loading state while fetching data ===== -->
    <div v-if="store.loading" class="text-center py-5">
      <ArrowPathIcon class="icon-lg text-primary spin" />
      <p class="mt-2 text-muted">Loading data...</p>
    </div>

    <!-- ===== Error state if problems identified ===== -->
    <div
      v-if="store.error"
      class="alert alert-danger d-flex justify-content-between align-items-center"
    >
      <span>{{ store.error }}</span>
      <button class="btn-close" @click="store.error = null"></button>
    </div>

    <!-- ===== Empty state if no data match the search query ===== -->
    <div
      v-if="!store.loading && results.length === 0 && search"
      class="text-center py-5"
    >
      <MagnifyingGlassIcon class="icon-lg text-secondary" />
      <h5 class="text-muted mt-2">No results</h5>
      <button class="btn btn-outline-primary mt-2" @click="search = ''">
        Clear
      </button>
    </div>

    <!-- ===== Displaying Pokémon list in cards form with image, typem and statistics ===== -->
    <div class="row g-4">
      <div
        v-for="p in visiblePokemons"
        :key="p.id"
        class="col-xl-3 col-lg-4 col-md-6 col-sm-6"
      >
        <div class="card pokemon-card h-100" @click="openDetail(p.id)">
          <!-- == Pokémon image and ID == -->
          <div class="card-img-wrap">
            <img :src="p.image" :alt="p.name" class="card-img-top" />
            <span class="pokemon-id">#{{ String(p.id).padStart(3, '0') }}</span>
          </div>
          <!-- == Pokémon name and type == -->
          <div class="card-body">
            <h5 class="card-title text-capitalize">{{ p.name }}</h5>
            <div class="mb-2">
              <span
                v-for="t in p.info.types"
                :key="t"
                class="badge type-badge"
                :class="'type-' + t"
              >
                {{ t }}
              </span>
            </div>

            <!-- == Pokémo HP bar == -->
            <div v-if="p.info.stats" class="stat-box">
              <small class="text-muted">HP: {{ p.info.stats[0]?.value }}</small>
              <div class="progress">
                <div
                  class="progress-bar bg-success"
                  :style="{ width: (p.info.stats[0]?.value / 150) * 100 + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- == Footer click for details == -->
          <div
            class="card-footer bg-transparent d-flex align-items-center justify-content-between"
          >
            <small class="text-muted">Click for details</small>
            <ArrowRightIcon class="icon-sm text-secondary" />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Pagination which controls movement between pages ===== -->
    <div
      v-if="!store.loading && totalPages > 1"
      class="d-flex justify-content-center mt-5"
    >
      <nav>
        <ul class="pagination custom-pagination">
          <!-- == Previous button == -->
          <li
            class="page-item"
            :class="{ disabled: currentPage === 1 }"
            @click="goToPage(currentPage - 1)"
          >
            <a class="page-link">Previous</a>
          </li>

          <!-- == Page numbers == -->
          <li
            class="page-item"
            v-for="page in totalPages"
            :key="page"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            <a class="page-link">{{ page }}</a>
          </li>

          <!-- == Next button == -->
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
            @click="goToPage(currentPage + 1)"
          >
            <a class="page-link">Next</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePokemonStore } from '../stores/pokemonStore'
import { useRouter } from 'vue-router'
import {
  BoltIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/solid'

// Store where all Pokémon data is managed (fetched once, reused everywhere)
const store = usePokemonStore()
const router = useRouter()

// Local state
const search = ref('') // What the user types in the search bar
const page = ref(1) // Current page of the list
const perPage = 20 // How many Pokémon to show on each page

// Load Pokémon data when the component first mounts
onMounted(() => {
  if (!store.pokemons.length) {
    store.fetchPokemons()
  }
})

// Filter Pokémon by name or ID based on search input
const results = computed(() => {
  if (!search.value) return store.pokemons
  return store.pokemons.filter(
    (p) =>
      p.name.toLowerCase().includes(search.value.toLowerCase()) ||
      p.id.toString().includes(search.value)
  )
})

// Slice the results so only the current page’s Pokémon show
const visiblePokemons = computed(() => {
  const start = (page.value - 1) * perPage
  return results.value.slice(start, start + perPage)
})

// Total number of pages based on filtered results
const totalPages = computed(() => Math.ceil(results.value.length / perPage))

// Changing to another page and scroll smoothly back to top
function changePage(p) {
  if (p >= 1 && p <= totalPages.value) {
    page.value = p
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Open detail page for a specific Pokémon
function openDetail(id) {
  router.push({ name: 'PokemonDetails', params: { id } })
}
</script>

<style scoped>
.icon-xs {
  width: 16px;
  height: 16px;
}
.icon-sm {
  width: 20px;
  height: 20px;
}
.icon-md {
  width: 28px;
  height: 28px;
}
.icon-lg {
  width: 48px;
  height: 48px;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.pokemon-title {
  font-weight: 800;
  color: #2c3e50;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.search-box {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 1.5rem;
  border-radius: 16px;
}

.pokemon-card {
  cursor: pointer;
  border: none;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  background: linear-gradient(145deg, #fff, #f8f9fa);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.pokemon-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.card-img-wrap {
  position: relative;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  padding: 1.5rem;
}
.card-img-top {
  height: 170px;
  object-fit: contain;
  transition: transform 0.3s ease;
}
.pokemon-card:hover .card-img-top {
  transform: scale(1.05);
}
.pokemon-id {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.type-badge {
  margin-right: 4px;
  font-size: 0.75rem;
  border-radius: 12px;
  padding: 0.4rem 0.7rem;
  text-transform: uppercase;
  font-weight: 600;
}
.type-grass {
  background: #78c850;
  color: #fff;
}
.type-fire {
  background: #f08030;
  color: #fff;
}
.type-water {
  background: #6890f0;
  color: #fff;
}
.type-electric {
  background: #f8d030;
  color: #000;
}
.type-bug {
  background: #a8b820;
  color: #fff;
}
.type-normal {
  background: #a8a878;
  color: #fff;
}
.type-poison {
  background: #a040a0;
  color: #fff;
}
.type-flying {
  background: #a890f0;
  color: #fff;
}
.type-psychic {
  background: #f85888;
  color: #fff;
}
.type-ice {
  background: #98d8d8;
  color: #000;
}
.type-fighting {
  background: #c03028;
  color: #fff;
}
.type-ground {
  background: #e0c068;
  color: #000;
}
.type-rock {
  background: #b8a038;
  color: #fff;
}
.type-ghost {
  background: #705898;
  color: #fff;
}
.type-dragon {
  background: #7038f8;
  color: #fff;
}
.type-dark {
  background: #705848;
  color: #fff;
}
.type-steel {
  background: #b8b8d0;
  color: #000;
}
.type-fairy {
  background: #ee99ac;
  color: #000;
}

.stat-box {
  background: rgba(0, 0, 0, 0.03);
  padding: 0.4rem;
  border-radius: 8px;
}
.progress {
  height: 6px;
  border-radius: 4px;
}

.custom-pagination .page-item {
  margin: 0 5px;
}

.custom-pagination .page-link {
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 600;
  color: #4a4a4a;
  background: #f1f3f5;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
}

.custom-pagination .page-link:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.custom-pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.custom-pagination .page-item.disabled .page-link {
  background: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
