
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
      let currentType = 'Changes';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('### ')) {
          currentType = line.substring(4).trim();
        } else if (line.startsWith('*')) {
            const changeMatch = line.match(/^\* (.*)/);
            if (changeMatch) {
                 changes.push({
                    type: currentType,
                    description: changeMatch[1],
                });
            }
        }
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
