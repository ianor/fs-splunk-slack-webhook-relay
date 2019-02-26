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
  //console.log(payload);

  const username = 'Splunk';
  const link = payload.results_link; //eslint-disable-line camelcase
  const attachments = [{
    fallback: username,
    color: '#aaaaaa',
    text: link
  }];

  let message = null;
  switch (req.params.key) {
    case ingestKey:
      const { folderCount, success, duration, artifactCount } = payload.result;
      const icon = success === 'true' ? ':white_check_mark:' : ':x:';
      const successful = success === 'true' ? 'successful' : 'failed'
      message = `${icon}  A *${successful}* ingest was logged by AMCS with the following information:`;
      attachments.unshift({
        fallback: username,
        color: '#FCB34B',
        text: `Duration: ${Math.round(10*parseInt(duration)/60/60)/10}h \nArtifact Count: ${artifactCount} \nFolder Count: ${folderCount}`
      });
      break;

    case noIngestKey:
      const { daysSinceLastEvent } = payload.result;
      message = `:question: <!channel> There has not been an ingest in *${daysSinceLastEvent}* days (as reported by AMCS).
      Something might be wrong :grimacing:.`;
      break;

    default:
      console.warn('*** Key not recognized ***')
      res.status(501).end();
      return;
  }
  
  //transform to a proper slack payload and post to slackURL
  
  let postData = {
    username,
    text: message,
    attachments
  };

  console.log(postData);

  fetch(slackURL, {
    method: 'POST',
    body: JSON.stringify(postData),
    headers: { 'Content-Type': 'application/json' }
  }).then(response => {
    if (!response.ok) {
      console.log('*** Failed to post ***');
      console.log(response.status);
      console.log(response.message);
      res.status(500).end();
    } else {
      res.status(200).end();
    }
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