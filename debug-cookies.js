import { readFileSync } from 'fs';

const content = readFileSync('./cookies.txt', 'utf-8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);
console.log('\nParsing cookies...\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let trimmedLine = line.trim();
  
  if (!trimmedLine) {
    console.log(`Line ${i}: [empty]`);
    continue;
  }
  
  if (trimmedLine.startsWith('#HttpOnly_')) {
    console.log(`Line ${i}: HttpOnly cookie detected`);
    trimmedLine = trimmedLine.substring(10);
  } else if (trimmedLine.startsWith('#')) {
    console.log(`Line ${i}: Comment - ${trimmedLine.substring(0, 50)}...`);
    continue;
  }
  
  // Check for tabs vs spaces
  const hasTabs = trimmedLine.includes('\t');
  const hasMultipleSpaces = trimmedLine.includes('    ');
  
  console.log(`Line ${i}: hasTabs=${hasTabs}, hasSpaces=${hasMultipleSpaces}`);
  
  // Try splitting by tabs
  const tabParts = trimmedLine.split('\t');
  console.log(`  Tab-split: ${tabParts.length} parts`);
  
  // Try splitting by multiple spaces
  const spaceParts = trimmedLine.split(/\s+/);
  console.log(`  Space-split: ${spaceParts.length} parts`);
  
  if (spaceParts.length >= 7) {
    console.log(`  -> Name: ${spaceParts[5]}, Value: ${spaceParts[6]}`);
  }
}
