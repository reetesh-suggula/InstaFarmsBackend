const express = require('express');
const PORT = process.env.PORT || 8000;
let router = require('./api')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());





app.use('/api', router);
app.listen(PORT, () => {
  console.log(`Server is running on post ${PORT}`)
})

