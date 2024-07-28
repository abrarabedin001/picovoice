const { Leopard } = require("@picovoice/leopard-node"); 
const fs = require('fs');


const accessKey = "access-key"

const leopard = new Leopard(accessKey, { enableDiarization: true });



const { transcript, words } = leopard.processFile("E:/Office/picovoice/leopard/My recording 11.wav");

// Write transcript to transcript.txt
fs.writeFile('transcript.txt', transcript, (err) => {
  if (err) throw err;
  console.log('Transcript has been saved!');
});

// Write words to words.txt
fs.writeFile('words.txt', JSON.stringify(words, null, 2), (err) => {
  if (err) throw err;
  console.log('Words have been saved!');
});

// leopard.delete()
