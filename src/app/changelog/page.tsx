
import * as React from 'react';
import fs from 'fs/promises';
import path from 'path';
import { ChangelogDisplay } from '@/components/changelog-display';

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
async function parseChangelog(): Promise<VersionInfo[]> {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = await fs.readFile(changelogPath, 'utf-8');
    
    // Split content into sections for each version
    const sections = content.split(/^## /m).slice(1);
    
    const versions: VersionInfo[] = sections.map(section => {
      const lines = section.trim().split('\n');
      const titleLine = lines[0];
      
      const versionMatch = titleLine.match(/\[(.*?)\]/);
      const dateMatch = titleLine.match(/\((\d{4}-\d{2}-\d{2})\)/);

      const version = versionMatch ? versionMatch[1] : 'Unreleased';
      const date = dateMatch ? dateMatch[1] : '';

      const changes: VersionInfo['changes'] = [];
      let currentType = 'General';
      let currentDescription = '';

      // All lines after the version header (e.g., ## [1.0.0] (2024-01-01))
      const contentLines = lines.slice(1);
      
      for (let i = 0; i < contentLines.length; i++) {
        const line = contentLines[i];
        
        if (line.startsWith('### ')) {
            // If we have a description for a previous change, save it.
            if (currentDescription) {
                changes.push({ type: currentType, description: currentDescription.trim() });
                currentDescription = '';
            }
            // Start a new change type (e.g., Features, Bug Fixes)
            currentType = line.substring(4).trim();
        } else if (line.trim().startsWith('* ')) {
            // If we have a description for a previous change, save it.
             if (currentDescription) {
                changes.push({ type: currentType, description: currentDescription.trim() });
            }
            // Start a new change description, taking everything after the asterisk.
            currentDescription = line.substring(line.indexOf('*') + 1).trim();
        } else if (currentDescription) {
            // This is a continuation of the previous description (multi-line commit).
            currentDescription += '\n' + line;
        }
      }

      // Add the very last item if it exists
      if (currentDescription) {
          changes.push({ type: currentType, description: currentDescription.trim() });
      }
      
      return { version, date, changes };
    });

    return versions;
  } catch (error) {
    console.error("Failed to read or parse CHANGELOG.md", error);
    // Return empty array or some default state if the file doesn't exist yet
    return [];
  }
}

export default async function ChangelogPage() {
  const versions = await parseChangelog();
  return <ChangelogDisplay versions={versions} />;
}
