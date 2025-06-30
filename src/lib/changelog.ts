
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { VersionInfo, ChangeSection } from './types';

export async function parseChangelog(): Promise<VersionInfo[]> {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = await fs.readFile(changelogPath, 'utf-8');

    // Split content by version headers (e.g., "## [1.2.0]" or "## 1.0.0")
    const versionSections = content.split(/^##\s+\[?/m).slice(1);
    
    const versions: VersionInfo[] = versionSections.map(section => {
      const lines = section.split('\n');
      const titleLine = lines.shift() || '';

      const version = titleLine.split(']')[0];
      const dateMatch = titleLine.match(/\((.*?)\)/);
      const date = dateMatch ? dateMatch[1] : '';
      
      const versionContent = lines.join('\n').trim();

      const parsedSections: ChangeSection[] = [];
      const sectionSplit = versionContent.split('###').slice(1); // Split by '###'

      sectionSplit.forEach(s => {
        const lines = s.split('\n');
        const header = lines.shift()?.trim() || '';
        // Remove trailing commit hash link from the content block
        const content = lines.join('\n').trim().replace(/\(\[.*?\]\(.*?\)\)$/m, '').trim();

        if (header.includes('Features')) {
          parsedSections.push({ type: 'Features', content });
        } else if (header.includes('Fixes')) {
          parsedSections.push({ type: 'Fixes', content });
        } else if (header.includes('BREAKING CHANGES')) {
          parsedSections.push({ type: 'Breaking Changes', content });
        }
        // Chores are ignored
      });

      // Handle cases like v1.1.0 and v1.0.0 where there are no sub-sections,
      // and the entire content is considered a feature.
      if (parsedSections.length === 0 && versionContent) {
          const cleanContent = versionContent.replace(/\(\[.*?\]\(.*?\)\)$/m, '').trim();
          parsedSections.push({ type: 'Features', content: cleanContent });
      }
      
      return {
        version,
        date,
        sections: parsedSections,
      };
    }).filter(v => v.version !== 'Unreleased' && v.sections.length > 0);

    return versions;
  } catch (error) {
    console.error('Failed to parse changelog:', error);
    return [];
  }
}
