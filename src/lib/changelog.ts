
'use server';

import fs from 'fs/promises';
import path from 'path';

// Define the structure of parsed version data
export type VersionInfo = {
  version: string;
  date: string;
  changes: {
    type: string;
    description: string;
  }[];
};

// Function to parse the CHANGELOG.md file
export async function parseChangelog(): Promise<VersionInfo[]> {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = await fs.readFile(changelogPath, 'utf-8');
    
    // Split content into sections for each version, using ## as the delimiter
    const sections = content.split(/^##\s+/m).slice(1);
    
    const versions: VersionInfo[] = sections.map(section => {
      const lines = section.trim().split('\n');
      const titleLine = lines[0];
      
      // Corrected Regex: Handles optional brackets and an optional (non-greedy) link part before the date.
      const titleMatch = titleLine.match(/^(?:\[)?(.*?)(?:\])?(?:.*?)?\s\((\d{4}-\d{2}-\d{2})\)/);

      if (!titleMatch) {
          // Fallback for versions without a date, or other formats.
          const versionMatch = titleLine.match(/^(?:\[)?(.*?)(?:\])?/);
          const version = versionMatch ? versionMatch[1].trim() : titleLine.trim();
          return { version, date: '', changes: [] };
      }

      const version = titleMatch[1].trim();
      const date = titleMatch[2];

      const changes: VersionInfo['changes'] = [];
      let currentType = 'General';
      let currentDescription = '';

      // All lines after the version header
      const contentLines = lines.slice(1).filter(line => line.trim() !== '');
      
      for (const line of contentLines) {
        // A new category starts with ### (e.g., ### Features) or ---
        if (line.startsWith('### ') || line.startsWith('---')) {
            // If we were building a description for a previous change, save it.
            if (currentDescription) {
                changes.push({ type: currentType, description: currentDescription.trim() });
            }
            // Start a new change type and reset description
            currentType = line.replace(/^(###\s+|---\s*)/, '').trim();
            currentDescription = '';
        } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) { // A new item starts with * or -
            // If we have a description for a previous change, save it.
            if (currentDescription) {
                changes.push({ type: currentType, description: currentDescription.trim() });
            }
            // Start a new change description, taking everything after the asterisk/dash.
            currentDescription = line.substring(line.indexOf(line.trim()[0]) + 1).trim();
        } else {
            // This is a continuation of the previous description (e.g., multi-line commit or subheading).
            // Append with a newline to preserve formatting.
            currentDescription += (currentDescription ? '\n' : '') + line;
        }
      }

      // Add the very last item if it exists
      if (currentDescription) {
          changes.push({ type: currentType, description: currentDescription.trim() });
      }
      
      // Filter out empty "---" sections that might be parsed
      const filteredChanges = changes.filter(c => c.type && c.description);

      return { version, date, changes: filteredChanges };
    }).filter(v => v.changes.length > 0); // Only return versions that have parsed changes

    return versions;
  } catch (error) {
    console.error("Failed to read or parse CHANGELOG.md", error);
    // Return empty array or some default state if the file doesn't exist yet
    return [];
  }
}
