
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { VersionInfo } from './types';

export async function parseChangelog(): Promise<VersionInfo[]> {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = await fs.readFile(changelogPath, 'utf-8');

    // Split content into version sections. The regex looks for lines starting with '## [version]'
    const versionSections = content.split(/^##\s+\[/m).slice(1);
    
    const versions: VersionInfo[] = versionSections.map(section => {
      // The section will start with something like "1.2.0](...)..."
      // Prepend '[' to make matching easier
      const fullSection = '[' + section;
      const lines = fullSection.split('\n');
      const titleLine = lines.shift() || ''; // e.g., [1.2.0](link) (2025-06-30)

      const versionMatch = titleLine.match(/\[(.*?)\]/);
      const dateMatch = titleLine.match(/\((.*?)\)/);

      const version = versionMatch ? versionMatch[1] : 'Unreleased';
      const date = dateMatch ? dateMatch[1] : '';
      const changeContent = lines.join('\n').trim();

      return {
        version,
        date,
        content: changeContent,
      };
    }).filter(v => v.version !== 'Unreleased');

    return versions;
  } catch (error) {
    console.error('Failed to parse changelog:', error);
    return [];
  }
}
