const app = Vue.createApp({
  data() {
    return { titulo: "Catálogo de películas" };
  }
});

/* Componente hijo: tarjeta */
app.component('movie-card', {
  props: {
    movie: { type: Object, required: true }
  },
  emits: ['remove'],
  template: `
    <article class="card" :class="movie.genero === 'Terror' ? 'card--danger' : 'card--ok'">
      <div class="card__body">
        <h3 class="card__title">{{ movie.titulo }}</h3>
        <p class="card__meta"><strong>Género:</strong> {{ movie.genero }}</p>
        <p class="card__meta"><strong>Año:</strong> {{ movie.anio }}</p>
        <p class="card__desc">{{ movie.resena }}</p>
        <div class="card__actions">
          <button class="btn btn--danger" @click="$emit('remove')">Eliminar</button>
        </div>
      </div>
    </article>
  `
});

/* Componente principal: formulario + lista */
app.component('mi-componente', {
  data() {
    return {
      form_data: { titulo: "", genero: "", anio: "", resena: "" },
      peliculas: [],
      errores: [],
      enviado: false,
      options: [
        { text: 'Acción', value: 'Acción' },
        { text: 'Comedia', value: 'Comedia' },
        { text: 'Drama', value: 'Drama' },
        { text: 'Terror', value: 'Terror' },
        { text: 'Ciencia Ficción', value: 'Ciencia Ficción' },
        {text: 'Romantico', value: 'Romantico' }
      ]
    };
  },
  mounted() {
    this.cargar();
  },
  methods: {
    upper(txt){ return (txt ?? '').toString().toUpperCase(); },

    validar() {
      this.errores = [];

      if (!this.form_data.titulo.trim()) this.errores.push("El título es obligatorio.");
      if (!this.form_data.genero)        this.errores.push("El género es obligatorio.");

      if (!this.form_data.anio) {
        this.errores.push("La fecha de publicación es obligatoria.");
      } else {
        const y = new Date(this.form_data.anio).getFullYear();
        const max = new Date().getFullYear() + 1;
        if (!(y >= 1888 && y <= max)) this.errores.push(`Ingresá un año válido (1888–${max}).`);
      }

      if (!this.form_data.resena.trim()) this.errores.push("La reseña es obligatoria.");
      if (this.form_data.resena.trim().length > 50) this.errores.push("La reseña debe ser breve (máx. 50).");

      return this.errores.length === 0;
    },
    enviar() {
      if (!this.validar()) return;

      const year = new Date(this.form_data.anio).getFullYear();
      const peli = {
        id: crypto.randomUUID(),
        titulo: this.form_data.titulo.trim(),
        genero: this.form_data.genero,
        anio: year,
        resena: this.form_data.resena.trim()
      };

      this.peliculas.push(peli);
      this.persistir();
      this.enviado = true;

      this.form_data = { titulo: "", genero: "", anio: "", resena: "" };
      setTimeout(() => { this.enviado = false; }, 1500);
    },
    eliminar(id) {
      const i = this.peliculas.findIndex(p => p.id === id);
      if (i !== -1) {
        this.peliculas.splice(i, 1);
        this.persistir();
      }
    },
    persistir() {
      localStorage.setItem('peliculas', JSON.stringify(this.peliculas));
    },
    cargar() {
      try {
        const raw = localStorage.getItem('peliculas');
        this.peliculas = raw ? JSON.parse(raw) : [];
      } catch {
        this.peliculas = [];
      }
    }
  },
  template: `
    <div class="form">
      <!-- Mensajes -->
      <div v-if="errores.length" class="claserror">
        <ul><li v-for="(e,i) in errores" :key="i">{{ e }}</li></ul>
      </div>
      <div v-else-if="enviado" class="enviado">
        <span>Cargado con éxito</span>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="enviar" novalidate>
        <label>Título:</label>
        <input type="text" v-model.trim="form_data.titulo" placeholder="Ej: Titanic" required/>
        

        <label>Género:</label>
        <select v-model="form_data.genero" required>
          <option disabled value="">Seleccione una opción</option>
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.text }}
          </option>
        </select>
        
        <label>Fecha que se publicó:</label>
        <input type="text" v-model="form_data.anio" required/>
       
        <label>Reseña breve:</label>
        <input type="text" v-model.trim="form_data.resena" maxlength="50" placeholder="Ej: Excelente trama" required/>
        <p>Caracteres usados ({{ form_data.resena.length }}/50)</p>

        <button type="submit" class="btn">Guardar</button>
      </form>
      </div>

      <!-- Listado -->
      <section class="peliculas" v-if="peliculas.length" style="margin-top:20px">
        <h2>Películas cargadas ({{ peliculas.length }})</h2>
        <ul class="grid">
          <li v-for="p in peliculas" :key="p.id">
            <movie-card :movie="p" @remove="eliminar(p.id)"></movie-card>
          </li>
        </ul>
      </section>
      <p v-else class="empty">No hay películas cargadas.</p>
    </div>
  `
});

app.mount('.contenedor');
