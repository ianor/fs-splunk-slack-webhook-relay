const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const port = process.env.PORT;
const slackURL = process.env.slackURL;
const secret = process.env.secret;

app.post('/:secret', (req, res) => {
  if (req.params.secret !== secret) {
    console.warn('*** Wrong secret ***')
    return;
  }
  const payload = req.body;
  console.log(payload);

  //transform to a proper slack payload and post to slackURL
  const username = 'Splunk';
  const link = payload.results_link; //eslint-disable-line camelcase
  const { daysSinceLastEvent } = payload.result;
  const message = `<!channel> There has not been an ingest in *${daysSinceLastEvent}* days (as reported by AMCS).
  Something might be wrong :grimacing:.`;
  let postData = {
    username,
    text: message,
    //icon_emoji: emoji, // eslint-disable-line camelcase
    attachments: [
      {
        fallback: username,
        color: '#FCB34B',
        text: link
      }
    ]
  };

  fetch(slackURL, {
    method: 'POST',
    body: JSON.stringify(postData),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => {
    if (!res.ok) console.log('*** Failed to post ***');
  });


  /*
  {
    owner: 'ianor182',
    sid: 'scheduler__ianor182_ZnMtaW5maW5pdHktZW5naW5lZXJpbmctbWV0cmljcw__Test_at_1550981700_30916_E2238C8D-27D7-436D-A927-1CC589B46408',
    results_link: 'https://familysearch.splunkcloud.com/app/fs-infinity-engineering-metrics/@go?sid=scheduler__ianor182_ZnMtaW5maW5pdHktZW5naW5lZXJpbmctbWV0cmljcw__Test_at_1550981700_30916_E2238C8D-27D7-436D-A927-1CC589B46408',
    app: 'fs-infinity-engineering-metrics',
    result: { daysSinceLastEvent: '27' },
    search_name: 'Test'
  }
  */

});

app.listen(port, () => console.info(`Application running on port ${port}`));