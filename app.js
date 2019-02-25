const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const port = process.env.PORT;
const slackURL = process.env.slackURL;
const ingestKey = process.env.ingestKey;
const noIngestKey = process.env.noIngestKey;

app.post('/:key', (req, res) => {
  const payload = req.body;
  console.log(payload);

  let message = null;
  let icon = null;
  switch (req.params.key) {
    case ingestKey:
      const { folderCount, success, duration, artifactCount } = payload.result;
      icon = success === 'successful' ? ':white_check_mark:' : ':x:';
      message = `A ${success} ingest was detected with the following information:
      Duration: ${parseInt(duration)/60/60}h
      Artifact Count: ${artifactCount}
      Folder Count: ${folderCount}`;
      break;
    case noIngestKey:
      const { daysSinceLastEvent } = payload.result;
      message = `<!channel> There has not been an ingest in *${daysSinceLastEvent}* days (as reported by AMCS).
      Something might be wrong :grimacing:.`;
      icon = ':question:';
      break;
    default:
      console.warn('*** Key not recognized ***')
      return;
  }
  
  

  //transform to a proper slack payload and post to slackURL
  const username = 'Splunk';
  const link = payload.results_link; //eslint-disable-line camelcase
  let postData = {
    username,
    text: message,
    icon_emoji: icon, // eslint-disable-line camelcase
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
  // No ingest event
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