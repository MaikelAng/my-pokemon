<template>
  <div class="detail-page">
    <div class="container mt-4">
      <!-- ===== Loading state while fetching details ===== -->
      <div v-if="store.detailLoading" class="text-center my-5 py-5">
        <div
          class="spinner-border text-primary"
          style="width: 3rem; height: 3rem"
        ></div>
        <p class="mt-3 text-muted">Loading Pokémon details...</p>
      </div>

      <!-- ===== Edit controls ===== -->
      <div v-if="!store.detailLoading" class="edit-controls text-center mb-4">
        <!-- == Buttons for toggling between view and edit mode == -->
        <button
          v-if="!isEditing"
          @click="enableEditing"
          class="btn btn-warning btn-lg"
        >
          <PencilIcon class="icon-size me-2" />
          Edit Pokémon
        </button>

        <div v-else class="d-flex justify-content-center gap-2">
          <button @click="saveEdits" class="btn btn-success btn-lg">
            <CheckIcon class="icon-size me-2" />
            Save Changes
          </button>
          <button @click="cancelEditing" class="btn btn-secondary btn-lg">
            <XMarkIcon class="icon-size me-2" />
            Cancel
          </button>
        </div>
      </div>

      <!-- ===== Success message when edits are saved ===== -->
      <div
        v-if="showSuccess"
        class="alert alert-success alert-dismissible fade show mb-4"
      >
        <CheckCircleIcon class="icon-size me-2" />
        Pokémon updated successfully!
        <button
          type="button"
          class="btn-close"
          @click="showSuccess = false"
        ></button>
      </div>

      <!-- ===== Pokémon details layout (shows details if data exist) ===== -->
      <div v-else-if="pokemon">
        <div class="pokemon-detail-container">
          <!-- == Header with Pokémon name, number, and back button == -->
          <div
            class="detail-header"
            :class="getTypeClass(pokemon.info.types[0])"
          >
            <div class="header-content">
              <button @click="$router.push('/')" class="back-btn">
                <ArrowLeftIcon class="icon-size me-1" />
                Back to List
              </button>
              <div class="pokemon-title">
                <div v-if="isEditing" class="edit-name-field">
                  <input
                    v-model="editForm.name"
                    class="form-control form-control-lg text-center"
                    placeholder="Pokémon Name"
                    style="
                      background: rgba(255, 255, 255, 0.2);
                      color: white;
                      border: 1px solid rgba(255, 255, 255, 0.3);
                    "
                  />
                </div>
                <h1 v-else class="text-capitalize">{{ pokemon.name }}</h1>
                <span class="pokemon-number"
                  >#{{ String(pokemon.id).padStart(3, '0') }}</span
                >
              </div>
            </div>
          </div>

          <!-- == Main card includes image + type badges + attributes == -->
          <div class="main-card">
            <div class="image-section">
              <div class="image-container">
                <img
                  :src="pokemon.image"
                  :alt="pokemon.name"
                  class="pokemon-main-img"
                />
                <div
                  class="image-background"
                  :class="getTypeClass(pokemon.info.types[0]) + '-light'"
                ></div>
              </div>
            </div>

            <!-- == Type, height, weight, abilities == -->
            <div class="info-section">
              <!-- == Pokémon types == -->
              <div class="types-display">
                <span
                  class="type-badge large"
                  :class="'type-' + type"
                  v-for="type in pokemon.info.types"
                  :key="type"
                >
                  {{ type }}
                </span>
              </div>

              <!-- == Attributes: height, weight, stat total == -->
              <div class="attributes-grid">
                <!-- == Height == -->
                <div class="attribute-item">
                  <div class="attribute-icon">
                    <ArrowTrendingUpIcon class="icon-size" />
                  </div>
                  <div class="attribute-info">
                    <div v-if="isEditing" class="edit-field">
                      <input
                        v-model.number="editForm.info.height"
                        type="number"
                        class="form-control text-center"
                        step="0.1"
                        min="0.1"
                        max="99.9"
                      />
                    </div>
                    <template v-else>
                      <span class="attribute-value">
                        {{ (pokemon.info.height / 10).toFixed(1) }} m
                      </span>
                      <span class="attribute-label">Height</span>
                      <small class="attribute-alt">
                        {{ toFeetInches(pokemon.info.height / 10) }}
                      </small>
                    </template>
                  </div>
                </div>

                <!-- == Weight == -->
                <div class="attribute-item">
                  <div class="attribute-icon">
                    <ScaleIcon class="icon-size" />
                  </div>
                  <div class="attribute-info">
                    <div v-if="isEditing" class="edit-field">
                      <input
                        v-model.number="editForm.info.weight"
                        type="number"
                        class="form-control text-center"
                        step="0.1"
                        min="0.1"
                        max="999.9"
                      />
                    </div>
                    <template v-else>
                      <span class="attribute-value">
                        {{ (pokemon.info.weight / 10).toFixed(1) }} kg
                      </span>
                      <span class="attribute-label">Weight</span>
                      <small class="attribute-alt">
                        {{ toLbs(pokemon.info.weight / 10) }} lbs
                      </small>
                    </template>
                  </div>
                </div>

                <!-- == Total stats == -->
                <div class="attribute-item">
                  <div class="attribute-icon">
                    <StarIcon class="icon-size" />
                  </div>
                  <div class="attribute-info">
                    <span class="attribute-value">
                      {{ statTotal(pokemon.info.stats) }}
                    </span>
                    <span class="attribute-label">Total Stats</span>
                    <small
                      class="attribute-alt"
                      :class="ratingClass(statTotal(pokemon.info.stats))"
                    >
                      {{ statRating(statTotal(pokemon.info.stats)) }}
                    </small>
                  </div>
                </div>
              </div>

              <!-- == Abilities == -->
              <div class="abilities-section">
                <h4>Abilities</h4>
                <div class="abilities-grid">
                  <span
                    class="ability-badge"
                    v-for="ability in pokemon.info.abilities"
                    :key="ability"
                  >
                    {{ ability }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats chart -->
          <div class="stats-card">
            <div class="stats-header">
              <h3>Base Stats</h3>
              <div class="stats-summary">
                <span class="total-stats">{{
                  statTotal(pokemon.info.stats)
                }}</span>
                <span class="avg-stats"
                  >Avg: {{ statAverage(pokemon.info.stats) }}</span
                >
              </div>
            </div>

            <div class="stats-grid">
              <div
                v-for="stat in pokemon.info.stats"
                :key="stat.name"
                class="stat-item"
              >
                <div class="stat-info">
                  <span class="stat-name">{{ formatStatName(stat.name) }}</span>
                  <span class="stat-value">{{ stat.value }}</span>
                </div>
                <div class="progress">
                  <div
                    class="progress-bar"
                    :class="getStatClass(stat.value)"
                    :style="{ width: (stat.value / 255) * 100 + '%' }"
                  ></div>
                </div>
                <div class="stat-max">255</div>
              </div>
            </div>
          </div>

          <!-- == Extra info cards: size insight, moves, trainer notes == -->
          <div class="info-cards-grid">
            <!-- == Size insight == -->
            <div class="info-card">
              <div class="card-header">
                <ChartBarIcon class="icon-size" />
                <h4>Size Insight</h4>
              </div>
              <div class="card-content">
                <div class="insight-item">
                  <span class="insight-label">Length Class</span>
                  <span class="insight-value">{{
                    lengthClass(pokemon.info.height / 10)
                  }}</span>
                </div>
                <div class="insight-item">
                  <span class="insight-label">Mass Class</span>
                  <span class="insight-value">{{
                    massClass(pokemon.info.weight / 10)
                  }}</span>
                </div>
                <div class="insight-item">
                  <span class="insight-label">Size Index</span>
                  <span class="insight-value"
                    >{{
                      sizeIndex(
                        pokemon.info.weight / 10,
                        pokemon.info.height / 10
                      )
                    }}
                    kg/m²</span
                  >
                </div>
              </div>
            </div>

            <!-- == Moves == -->
            <div
              class="info-card"
              v-if="pokemon.info.moves && pokemon.info.moves.length"
            >
              <div class="card-header">
                <BoltIcon class="icon-size" />
                <h4>Popular Moves</h4>
              </div>
              <div class="moves-grid">
                <span
                  class="move-badge"
                  v-for="(move, i) in pokemon.info.moves.slice(0, 8)"
                  :key="i"
                >
                  {{ move }}
                </span>
              </div>
              <div v-if="pokemon.info.moves.length > 8" class="card-footer">
                <small class="text-muted">
                  +{{ pokemon.info.moves.length - 8 }} more moves
                </small>
              </div>
            </div>

            <!-- == Trainer Notes == -->
            <div class="info-card">
              <div class="card-header">
                <BookOpenIcon class="icon-size" />
                <h4>Trainer Notes</h4>
              </div>
              <div class="card-content">
                <p class="notes-text">
                  This Pokémon's stats are normalized for easy comparison. The
                  size index helps compare proportions across species. Higher
                  total stats indicate better overall performance in battles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Not Found state ===== -->
      <div v-else class="text-center my-5 py-5">
        <div class="not-found">
          <QuestionMarkCircleIcon class="icon-size-xl" style="color: #6c757d" />
          <h3 class="mt-3">Pokémon Not Found</h3>
          <p class="text-muted mb-4">
            The Pokémon you're looking for doesn't exist.
          </p>
          <button @click="$router.push('/')" class="btn btn-primary btn-lg">
            <ArrowLeftIcon class="icon-size me-2" />
            Back to Pokémon List
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePokemonStore } from '../stores/pokemonStore'
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ScaleIcon,
  StarIcon,
  ChartBarIcon,
  BoltIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/vue/24/outline'

export default {
  name: 'PokemonDetails',
  components: {
    ArrowLeftIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    CheckCircleIcon,
    ArrowTrendingUpIcon,
    ScaleIcon,
    StarIcon,
    ChartBarIcon,
    BoltIcon,
    BookOpenIcon,
    QuestionMarkCircleIcon,
  },
  setup() {
    const store = usePokemonStore() // Access global pokemon store
    const route = useRoute() // Access current route (for pokemon ID)
    const pokemon = ref(null) // Holds the current Pokémon details
    const isEditing = ref(false) // Track if we are editing details
    const showSuccess = ref(false) // Shows "saved" confirmation message

    // Form model for editing Pokémon details
    const editForm = ref({
      id: null,
      name: '',
      info: {
        height: 0,
        weight: 0,
      },
    })

    // Load Pokémon details
    const loadPokemonDetails = async () => {
      const id = route.params.id
      const existingPokemon = store.getPokemonById(id)
      // If already have existing Pokémon
      if (existingPokemon) {
        pokemon.value = existingPokemon
        initializeEditForm()
        return
      }
      // Otherwise fetch it from API
      try {
        pokemon.value = await store.fetchPokemonDetail(id)
        initializeEditForm()
      } catch (error) {
        console.error('Error loading pokemon details:', error)
        pokemon.value = null
      }
    }

    // Copy Pokémon data into edit form
    const initializeEditForm = () => {
      if (pokemon.value) {
        editForm.value = {
          id: pokemon.value.id,
          name: pokemon.value.name,
          info: {
            height: pokemon.value.info.height,
            weight: pokemon.value.info.weight,
          },
        }
      }
    }

    // Enable editing mode
    const enableEditing = () => {
      isEditing.value = true
    }

    // Cancel editing and reset form
    const cancelEditing = () => {
      initializeEditForm()
      isEditing.value = false
    }

    // Save edits to the store and show success message
    const saveEdits = () => {
      // Validation: name can’t be empty
      if (editForm.value.name.trim() === '') {
        alert('Pokémon name cannot be empty!')
        return
      }

      // Update store with new values
      store.updatePokemon(editForm.value)
      isEditing.value = false
      showSuccess.value = true

      // Update the local Pokémon object so UI refreshes instantly
      pokemon.value = {
        ...pokemon.value,
        name: editForm.value.name,
        info: {
          ...pokemon.value.info,
          height: editForm.value.info.height,
          weight: editForm.value.info.weight,
        },
      }

      // Hide the success message after 3 seconds
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }

    // CSS classes for stats depending on their value
    const getStatClass = (value) => {
      if (value >= 100) return 'bg-stat-excellent'
      if (value >= 70) return 'bg-stat-good'
      if (value >= 50) return 'bg-stat-average'
      if (value >= 30) return 'bg-stat-weak'
      return 'bg-stat-poor'
    }

    // CSS class for Pokémon type
    const getTypeClass = (type) => {
      return `type-${type}`
    }

    // Format Pokémon stat names
    const formatStatName = (name) => {
      return name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    // Convert meters to feet + inches
    const toFeetInches = (meters) => {
      const totalInches = meters * 39.3701
      const feet = Math.floor(totalInches / 12)
      const inches = Math.round(totalInches % 12)
      return `${feet}′ ${inches}″`
    }

    // Convert kg to lbs
    const toLbs = (kg) => (kg * 2.20462).toFixed(1)

    // Helper functions to calculate Pokémon stats
    const statTotal = (stats) =>
      stats?.reduce((s, x) => s + (x.value || 0), 0) || 0
    const statAverage = (stats) =>
      Math.round(statTotal(stats) / (stats?.length || 1))
    const statRating = (total) => {
      if (total >= 550) return 'Elite'
      if (total >= 500) return 'Strong'
      if (total >= 450) return 'Above Avg'
      if (total >= 400) return 'Average'
      return 'Casual'
    }
    const ratingClass = (total) => {
      if (total >= 550) return 'rating-elite'
      if (total >= 500) return 'rating-strong'
      if (total >= 450) return 'rating-above-avg'
      if (total >= 400) return 'rating-average'
      return 'rating-casual'
    }
    // Calculate Pokémon body size index
    const sizeIndex = (kg, m) => (kg / (m * m)).toFixed(1)
    // Classify Pokémon by length
    const lengthClass = (m) => {
      if (m >= 2) return 'Very Tall'
      if (m >= 1.2) return 'Tall'
      if (m >= 0.7) return 'Medium'
      return 'Small'
    }
    // Classify Pokémon by weight
    const massClass = (kg) => {
      if (kg >= 200) return 'Very Heavy'
      if (kg >= 80) return 'Heavy'
      if (kg >= 30) return 'Medium'
      return 'Light'
    }

    // When the component is mounted, load the Pokémon details
    onMounted(loadPokemonDetails)
    // If route changes (user clicks another Pokémon), reload details
    watch(() => route.params.id, loadPokemonDetails)

    return {
      store,
      pokemon,
      isEditing,
      showSuccess,
      editForm,
      enableEditing,
      cancelEditing,
      saveEdits,
      getStatClass,
      getTypeClass,
      formatStatName,
      toFeetInches,
      toLbs,
      statTotal,
      statAverage,
      statRating,
      ratingClass,
      sizeIndex,
      lengthClass,
      massClass,
    }
  },
}
</script>

<style scoped>
.icon-size {
  width: 1.25rem;
  height: 1.25rem;
  display: inline-block;
  vertical-align: middle;
}

.icon-size-xl {
  width: 4rem;
  height: 4rem;
}

.attribute-icon .icon-size {
  width: 1.5rem;
  height: 1.5rem;
}

.detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding-bottom: 40px;
}

.pokemon-detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.detail-header {
  background: linear-gradient(
    135deg,
    var(--type-color),
    var(--type-color-dark)
  );
  color: white;
  padding: 2rem 0;
  border-radius: 20px 20px 0 0;
  margin-bottom: -50px;
  position: relative;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-5px);
}

.pokemon-title {
  text-align: center;
  margin-top: 1rem;
}

.pokemon-title h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.pokemon-number {
  font-size: 1.5rem;
  opacity: 0.9;
}

.main-card {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.image-section {
  text-align: center;
  margin-bottom: 2rem;
}

.image-container {
  position: relative;
  display: inline-block;
}

.pokemon-main-img {
  height: 280px;
  z-index: 2;
  position: relative;
  transition: transform 0.3s ease;
}

.pokemon-main-img:hover {
  transform: scale(1.05);
}

.image-background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  opacity: 0.1;
  z-index: 1;
}

.types-display {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.type-badge.large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 25px;
  text-transform: uppercase;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.attribute-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
}

.attribute-icon {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.attribute-info {
  flex: 1;
}

.attribute-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.attribute-label {
  display: block;
  color: #6c757d;
  font-weight: 600;
}

.attribute-alt {
  display: block;
  color: #adb5bd;
}

.abilities-section {
  text-align: center;
}

.abilities-section h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.abilities-grid {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ability-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
}

.stats-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.stats-header h3 {
  margin: 0;
  color: #2c3e50;
}

.stats-summary {
  text-align: right;
}

.total-stats {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: #2c3e50;
}

.avg-stats {
  color: #6c757d;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  gap: 1rem;
}

.stat-item {
  display: grid;
  grid-template-columns: 120px 1fr 60px;
  gap: 1rem;
  align-items: center;
}

.stat-name {
  font-weight: 600;
  color: #2c3e50;
  text-transform: capitalize;
}

.stat-value {
  font-weight: 700;
  color: #2c3e50;
}

.stat-max {
  text-align: right;
  color: #adb5bd;
  font-size: 0.9rem;
}

.progress {
  height: 12px;
  border-radius: 6px;
  background: #e9ecef;
}

.progress-bar {
  border-radius: 6px;
  transition: width 1s ease-in-out;
}

.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.card-header i {
  font-size: 1.5rem;
  color: #667eea;
}

.card-header h4 {
  margin: 0;
  color: #2c3e50;
}

.insight-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.insight-item:last-child {
  border-bottom: none;
}

.insight-label {
  color: #6c757d;
  font-weight: 600;
}

.insight-value {
  color: #2c3e50;
  font-weight: 700;
}

.moves-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.move-badge {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 0.5rem;
  border-radius: 15px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.notes-text {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

.edit-controls {
  margin-bottom: 2rem;
}

.edit-controls .btn {
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.edit-controls .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.edit-name-field {
  margin-bottom: 1rem;
}

.edit-name-field input {
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  text-transform: capitalize;
}

.edit-field {
  margin-bottom: 0.5rem;
}

.edit-field .form-control {
  text-align: center;
  font-weight: 600;
}

@media (max-width: 768px) {
  .pokemon-title h1 {
    font-size: 2rem;
  }

  .attributes-grid {
    grid-template-columns: 1fr;
  }

  .stat-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .info-cards-grid {
    grid-template-columns: 1fr;
  }

  .main-card {
    padding: 2rem 1rem;
  }

  .edit-controls .d-flex {
    flex-direction: column;
    gap: 0.5rem !important;
  }

  .edit-controls .btn {
    width: 100%;
  }
}

.type-grass {
  --type-color: #78c850;
  --type-color-dark: #5ca73c;
}
.type-fire {
  --type-color: #f08030;
  --type-color-dark: #d96a1d;
}
.type-water {
  --type-color: #6890f0;
  --type-color-dark: #4a75d4;
}
.type-electric {
  --type-color: #f8d030;
  --type-color-dark: #e6b91e;
}
.type-bug {
  --type-color: #a8b820;
  --type-color-dark: #8a9a1a;
}
.type-normal {
  --type-color: #a8a878;
  --type-color-dark: #8a8a62;
}
.type-poison {
  --type-color: #a040a0;
  --type-color-dark: #823482;
}
.type-flying {
  --type-color: #a890f0;
  --type-color-dark: #8a75d4;
}
.type-psychic {
  --type-color: #f85888;
  --type-color-dark: #d63d6d;
}
.type-ice {
  --type-color: #98d8d8;
  --type-color-dark: #7ab6b6;
}
.type-fighting {
  --type-color: #c03028;
  --type-color-dark: #9a1f18;
}
.type-ground {
  --type-color: #e0c068;
  --type-color-dark: #c9a84d;
}
.type-rock {
  --type-color: #b8a038;
  --type-color-dark: #96842d;
}
.type-ghost {
  --type-color: #705898;
  --type-color-dark: #584776;
}
.type-dragon {
  --type-color: #7038f8;
  --type-color-dark: #5a2dc9;
}
.type-dark {
  --type-color: #705848;
  --type-color-dark: #584636;
}
.type-steel {
  --type-color: #b8b8d0;
  --type-color-dark: #9a9ab3;
}
.type-fairy {
  --type-color: #ee99ac;
  --type-color-dark: #d97a8d;
}

.type-grass-light {
  background: rgba(120, 200, 80, 0.1);
}
.type-fire-light {
  background: rgba(240, 128, 48, 0.1);
}
.type-water-light {
  background: rgba(104, 144, 240, 0.1);
}

.bg-stat-excellent {
  background: linear-gradient(90deg, #00b09b, #96c93d);
}
.bg-stat-good {
  background: linear-gradient(90deg, #3498db, #2980b9);
}
.bg-stat-average {
  background: linear-gradient(90deg, #f39c12, #e67e22);
}
.bg-stat-weak {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}
.bg-stat-poor {
  background: linear-gradient(90deg, #95a5a6, #7f8c8d);
}

.rating-elite {
  color: #27ae60;
}
.rating-strong {
  color: #3498db;
}
.rating-above-avg {
  color: #f39c12;
}
.rating-average {
  color: #e67e22;
}
.rating-casual {
  color: #95a5a6;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-card,
.stats-card,
.info-card {
  animation: fadeInUp 0.6s ease-out;
}

.info-card:nth-child(2) {
  animation-delay: 0.2s;
}
.info-card:nth-child(3) {
  animation-delay: 0.4s;
}
</style>
