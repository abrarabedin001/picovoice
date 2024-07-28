import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

interface WordSegment {
  word: string;
  startSec: number;
  endSec: number;
  confidence: number;
  speakerTag: number;
}

const audioFilePath = './My recording 11.wav';  // Replace with your audio file path
const outputDir = 'output';  // Directory to save the output audio files

// JSON array containing word segments
const wordSegments: WordSegment[] = [
  {
    "word": "of",
    "startSec": 0.3199999928474426,
    "endSec": 3.47999998927116394,
    "confidence": 0.6126818060874939,
    "speakerTag": 1
  },
  {
    "word": "course",
    "startSec": 0.6399999856948853,
    "endSec": 0.8960000276565552,
    "confidence": 0.9771077632904053,
    "speakerTag": 1
  },
  {
    "word": "if",
    "startSec": 1.0240000486373901,
    "endSec": 1.1200000047683716,
    "confidence": 0.9646727442741394,
    "speakerTag": 1
  },
  {
    "word": "you",
    "startSec": 1.184000015258789,
    "endSec": 1.215999960899353,
    "confidence": 0.9825208783149719,
    "speakerTag": 1
  },
  {
    "word": "have",
    "startSec": 1.2799999713897705,
    "endSec": 1.3760000467300415,
    "confidence": 0.9818230867385864,
    "speakerTag": 1
  },
  {
    "word": "a",
    "startSec": 1.472000002861023,
    "endSec": 1.472000002861023,
    "confidence": 0.9725967645645142,
    "speakerTag": 1
  },
  {
    "word": "way",
    "startSec": 1.5360000133514404,
    "endSec": 1.600000023841858,
    "confidence": 0.9531253576278687,
    "speakerTag": 1
  },
  {
    "word": "to",
    "startSec": 1.6640000343322754,
    "endSec": 1.7280000448226929,
    "confidence": 0.9819825887680054,
    "speakerTag": 1
  },
  {
    "word": "server",
    "startSec": 1.7920000553131104,
    "endSec": 2.0160000324249268,
    "confidence": 0.5863791108131409,
    "speakerTag": 1
  },
  {
    "word": "you",
    "startSec": 2.111999988555908,
    "endSec": 2.1760001182556152,
    "confidence": 0.8151038885116577,
    "speakerTag": 1
  },
  {
    "word": "should",
    "startSec": 2.2720000743865967,
    "endSec": 2.4000000953674316,
    "confidence": 0.9716886878013611,
    "speakerTag": 1
  },
  {
    "word": "use",
    "startSec": 2.4639999866485596,
    "endSec": 2.6559998989105225,
    "confidence": 0.9590463638305664,
    "speakerTag": 1
  },
  {
    "word": "it",
    "startSec": 2.815999984741211,
    "endSec": 2.9119999408721924,
    "confidence": 0.9711024165153503,
    "speakerTag": 1
  },
  {
    "word": "and",
    "startSec": 3.007999897003174,
    "endSec": 3.072000026702881,
    "confidence": 0.9532017111778259,
    "speakerTag": 1
  }
  // Add more segments as needed
];

// Function to find the longest segment for each speaker tag
function findLongestSegments(segments: WordSegment[]): Map<number, WordSegment> {
  const longestSegmentsMap = new Map<number, WordSegment>();

  segments.forEach(segment => {
    const { speakerTag, startSec, endSec } = segment;
    if (!longestSegmentsMap.has(speakerTag)) {
      longestSegmentsMap.set(speakerTag, segment);
    } else {
      const currentLongest = longestSegmentsMap.get(speakerTag)!;
      const currentDuration = currentLongest.endSec - currentLongest.startSec;
      const newDuration = endSec - startSec;
      if (newDuration > currentDuration) {
        longestSegmentsMap.set(speakerTag, segment);
      }
    }
  });

  return longestSegmentsMap;
}

// Function to cut audio segments
async function cutAudioSegments() {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const longestSegmentsMap = findLongestSegments(wordSegments);

  for (let [speakerTag, segment] of longestSegmentsMap) {
    const { startSec, endSec } = segment;
    const outputFile = path.join(outputDir, `longest_segment_${speakerTag}_${startSec}_${endSec}.wav`);
    
    // Run ffmpeg command to cut audio segment
    const ffmpeg = spawn('ffmpeg', [
      '-y',  // Overwrite output file if exists
      '-i', audioFilePath,
      '-ss', startSec.toString(),
      '-to', endSec.toString(),
      '-c', 'copy',
      outputFile
    ]);

    ffmpeg.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    // Wait for ffmpeg to finish cutting the segment
    await new Promise<void>((resolve) => {
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(`Longest segment for speaker ${speakerTag} saved as ${outputFile}`);
        } else {
          console.error(`ffmpeg exited with code ${code}`);
        }
        resolve();
      });
    });
  }
}

// Run the function
cutAudioSegments().catch((err) => {
  console.error('Error cutting audio segments:', err);
});
