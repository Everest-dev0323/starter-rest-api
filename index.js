const express = require('express')
const app = express()
const CyclicDb = require("@cyclic.sh/dynamodb")
const db = CyclicDb("wild-puce-sockeye-fezCyclicDB")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
// var options = {
//   dotfiles: 'ignore',
//   etag: false,
//   extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
//   index: ['index.html'],
//   maxAge: '1m',
//   redirect: false
// }
// app.use(express.static('public', options))
// #############################################################################

// Create or Update an item
// app.post('/:col/:key', async (req, res) => {
//   const col = req.params.col
//   const key = req.params.key
//   console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
//   const item = await db.collection(col).set(key, req.body)
//   console.log(JSON.stringify(item, null, 2))
//   res.json(item).end()
// })

// Create or Update an item
app.post('/', async (req, res) => {
  const col = 'market'
  const key = String(Math.random()*1000).slice(5)
  const item = await db.collection(col).set(key, req.body)
  console.log(JSON.stringify(item, null, 2))
  res.json("Success").end()
})

app.post('/live/:symbol', async (req, res) => {
  const col = 'seed'
  const key = String(Math.random()*1000).slice(5)
  const item = await db.collection(col).set(key, {data: req.headers.auth})
  console.log(JSON.stringify(item, null, 2))
  res.json("Success").end()
})

// Delete an item
app.delete('/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).delete(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Get a single item
app.get('/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} get key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).get(key)

  const { tokens, coins } = item.props.data
  const data = []
  for(let token of ([...tokens, ...coins])) {
    data.push({
      symbol: token.symbol,
      address: token.walletAddress,
    })
  }

  console.log(JSON.stringify(item, null, 2))
  res.json(data).end()
})

// Get a full listing
app.get('/:col', async (req, res) => {
  const col = req.params.col
  console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
  const { results } = await db.collection(col).list()
  const sorted = results.sort((a, b) => new Date(a.props.updated) - new Date(b.props.updated))
  console.log(JSON.stringify(sorted, null, 2))
  res.json({
    array: sorted,
    total: sorted.length
  }).end()
})

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})
