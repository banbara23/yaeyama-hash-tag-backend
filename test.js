// DEBUG=instagramsearchtags node test.js
const InstagramSearchTags = require('instagram-searchtags')
 
// Create instance with your credentials 
const searchTags = new InstagramSearchTags({
  username: 'banbara23',
  password: 'banbara',
})
 
// Login Instagram with credentials 
searchTags.login()
  .then(() => {
 
    // Create #dog tag 
    const tag = searchTags.createTag('dog')
 
    // Fetch 10 latest nodes 
    return tag.fetchNodes(30)
 
  })
  .then((nodes) => {
 
    // ... do something cool with nodes 
    console.log(nodes.length)
 
    // close connection 
    searchTags.close()
 
  })
  .catch((err) => {
 
    // close connection 
    searchTags.close()
 
    console.error(`Error: ${err.message}`)
 
  })