//COMPARATIVAS DE CÓDIGO

//POCKETBASE

//AUTH

//Login
const authData = await pb.collection('users').authWithPassword(email, password)

//Register
const user = await pb.collection('users').create({email, password, passwordConfirm})

//CRUD

// Create
const record = await pb.collection('movies').create(movieData)
// Read
const records = await pb.collection('movies').getList(1, 20, {
    filter: 'title ~ "Matrix"',
    sort: '-created'
})
// Update
const updated = await pb.collection('movies').update(id, movieData)
// Delete
await pb.collection('movies').delete(id)