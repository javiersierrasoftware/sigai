import fs from 'fs';
import readline from 'readline';

const logPath = '/Users/javiersierra/.gemini/antigravity-ide/brain/c34f0001-a1e9-49b2-bbdd-ac0bf670d4d1/.system_generated/logs/transcript.jsonl';

async function readLog() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const step = JSON.parse(line);
    if (step.step_index === 163) {
      console.log("Found resolution text:");
      const content = step.content;
      // Search for multiplier keywords or sections
      const lines = content.split('\n');
      console.log("Total lines in step content:", lines.length);
      
      // Let's print sections that mention hours, docencia, multiplicador, factor, etc.
      lines.forEach((l, idx) => {
        if (l.toLowerCase().includes('multiplicador') || 
            l.toLowerCase().includes('factor') || 
            l.toLowerCase().includes('preparación') || 
            l.toLowerCase().includes('preparacion') || 
            l.toLowerCase().includes('horas')) {
          console.log(`Line ${idx}: ${l}`);
        }
      });
      
      // Let's write the full text to a scratch file so we can view it
      fs.writeFileSync('/Users/javiersierra/Software/sigai/scripts/resolution_full_text.txt', content);
      console.log("Full text written to /Users/javiersierra/Software/sigai/scripts/resolution_full_text.txt");
    }
  }
}

readLog();
