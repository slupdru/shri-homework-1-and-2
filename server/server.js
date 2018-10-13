const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8000;
const cors = require('cors')
const fs = require('fs');
const startTime = new Date();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

function addZero(number){
  if (number < 10) return `0${number}`;
  else return number + '';
}

app.post('/status', (req, res) => {
  const allSeconds = Math.round((Date.now() - startTime.getTime()) / 1000);
  const hours = Math.floor(allSeconds / (60 * 60));
  const minutes = Math.floor((allSeconds - hours * 60 * 60) / 60);
  const seconds = Math.round(allSeconds - hours * 60 * 60 - minutes * 60);
  res.send(`${addZero(hours)}:${addZero(minutes)}:${addZero(seconds)}`)
});

app.post('/api/events', (req, res) => {
  const body = req.body;
  const types = body.types;
  if (types.indexOf('critical') === -1 && types.indexOf('info') === -1 ){
    res.status(400).send('incorrect type');
  }
  else{
    fs.readFile('events.json','utf8', (err, data) => {
      if (err) throw err;
      const startPosition = (body.page - 1) * body.itemsPerPage;
      const endPosition = startPosition + body.itemsPerPage;
      const dataFromFile = JSON.parse(data);
      const result = dataFromFile.events.filter((el)=> types.indexOf(el.type) !== -1).slice(startPosition, endPosition);
      res.json({events:result});
    });
  }
});

app.all('*', (req, res) => {
  res.status(404).send('<h1>Page not found</h1>');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));