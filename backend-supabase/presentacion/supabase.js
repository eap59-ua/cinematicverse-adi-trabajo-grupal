//COMPARATIVAS DE CÓDIGO

//SUPABASE

//AUTH

//Login
export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    throw error;
  }
}
//Register
export async function register(email, password, username = "") {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("❌ Error en registro:", error.message);
    throw error;
  }
}

//CRUD

// Create
export async function createMovie(movieData) {
    try{
        const { data } = await supabase.from('movies').insert(movieData).select()
    }catch(error){
        console.error("❌ Error creando pelicula:", error.message);
    }
}

//Read
export async function getMovies(filter = "", sort = "-created_at") {
    try{
        const {data } = await supabase.from('movies').select().ilike('title', `%${filter}%`).order('created_at', {ascending: false}).range(0, 19)
    }catch(error){
        console.error("❌ Error obteniendo peliculas:", error.message);
    }
}
// Update
export async function updateMovie(id, movieData) {
    try{
        const { data } = await supabase.from('movies').update(movieData).eq('id', id)
    }catch(error){
        console.error("❌ Error actualizando pelicula:", error.message);
    }
}

// Delete
export async function deleteMovie(id) {
    try{
        const { data } = await supabase.from('movies').delete().eq('id', id)
    }catch(error){
        console.error("❌ Error eliminando pelicula:", error.message);
    }
}

