const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const port = process.env.PORT;
const slackURL = process.env.slackURL;
const secret = process.env.secret;

app.post('/:secret', (req, res) => {
  if (req.params.secret !== secret) return;
  const payload = req.body;
  console.log(payload);

  //transform to a proper slack payload and post to slackURL
});

app.listen(port, () => console.info(`Application running on port ${port}`));