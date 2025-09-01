import { defineStore } from 'pinia'
import axios from 'axios'

export const usePokemonStore = defineStore('pokemon', {
  state: () => ({
    pokemons: [],
    loading: false,
    error: null,
    detailLoading: false,
  }),
  actions: {
    async fetchPokemons() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get(
          'https://pokeapi.co/api/v2/pokemon?limit=100'
        )

        this.pokemons = await Promise.all(
          res.data.results.map(async (p) => {
            const details = await axios.get(p.url)
            return {
              id: details.data.id,
              name: details.data.name,
              image:
                details.data.sprites.other['official-artwork'].front_default ||
                details.data.sprites.front_default,
              info: {
                height: details.data.height,
                weight: details.data.weight,
                types: details.data.types.map((t) => t.type.name),
                stats: details.data.stats.map((stat) => ({
                  name: stat.stat.name,
                  value: stat.base_stat,
                })),
                // TAMBAHKAN INI:
                moves: details.data.moves.map((m) => m.move.name).slice(0, 15),
                abilities: details.data.abilities.map((a) => a.ability.name),
              },
            }
          })
        )
      } catch (err) {
        console.error('Error fetching pokemons:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchPokemonDetail(id) {
      this.detailLoading = true
      this.error = null
      try {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${id}`
        )
        const data = response.data

        const pokemonDetail = {
          id: data.id,
          name: data.name,
          image:
            data.sprites.other['official-artwork'].front_default ||
            data.sprites.front_default,
          sprites: {
            front_default: data.sprites.front_default,
            back_default: data.sprites.back_default,
            front_shiny: data.sprites.front_shiny,
            back_shiny: data.sprites.back_shiny,
          },
          info: {
            height: data.height,
            weight: data.weight,
            types: data.types.map((t) => t.type.name),
            abilities: data.abilities.map((a) => a.ability.name),
            stats: data.stats.map((stat) => ({
              name: stat.stat.name,
              value: stat.base_stat,
            })),
            moves: data.moves.map((m) => m.move.name).slice(0, 15), // Limit moves
          },
        }

        // Update pokemon di array jika sudah ada
        const index = this.pokemons.findIndex((p) => p.id === parseInt(id))
        if (index !== -1) {
          this.pokemons[index] = { ...this.pokemons[index], ...pokemonDetail }
        }

        return pokemonDetail
      } catch (err) {
        console.error('Error fetching pokemon detail:', err)
        this.error = err.message
        throw err
      } finally {
        this.detailLoading = false
      }
    },

    getPokemonById(id) {
      return this.pokemons.find((p) => p.id === parseInt(id))
    },

    // NEW: Update Pokemon action
    updatePokemon(updatedPokemon) {
      const index = this.pokemons.findIndex((p) => p.id === updatedPokemon.id)
      if (index !== -1) {
        // Preserve original data from API, only update editable fields
        this.pokemons[index] = {
          ...this.pokemons[index],
          name: updatedPokemon.name,
          info: {
            ...this.pokemons[index].info,
            height: updatedPokemon.info.height,
            weight: updatedPokemon.info.weight,
            // Note: Types, stats, abilities remain from API (not editable)
          },
        }
      }
    },
  },
})
