const ffmpeg = require('fluent-ffmpeg');

ffmpeg()
  .input('videoplayback.mp4')
  .output('videoplayback.wav')
  .run();