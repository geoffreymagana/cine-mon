
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { VersionInfo, ChangeSection } from './types';

export async function parseChangelog(): Promise<VersionInfo[]> {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = await fs.readFile(changelogPath, 'utf-8');
    
    const cleanContent = content.replace(/^# Changelog\s*\n/m, '');
    const versionBlocks = cleanContent.split(/^##\s+/m).slice(1);
    
    const versions: VersionInfo[] = versionBlocks.map(block => {
      const lines = block.split('\n');
      const titleLine = lines.shift() || '';

      const titleMatch = titleLine.match(/^(?:\[(.*?)\]|([\d.]+))\s*(?:[-(]?\s*(.*?)\s*[)-]?)?$/);
      
      const version = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
      const date = titleMatch ? (titleMatch[3] || '').trim() : '';
      
      const versionContent = lines.join('\n');
      const sectionBlocks = versionContent.split(/^\s*###\s+/m).slice(1);

      const sections: ChangeSection[] = sectionBlocks.map(sectionBlock => {
        const sectionLines = sectionBlock.split('\n');
        const sectionTitle = sectionLines.shift()?.trim() || 'Other';
        const sectionContent = sectionLines.join('\n').trim();

        const typeMap: Record<string, ChangeSection['type']> = {
          'Features': 'Features',
          'Fixes': 'Fixes',
          'Bug Fixes': 'Fixes',
          'BREAKING CHANGES': 'Breaking Changes',
        };
        
        const type = typeMap[sectionTitle] || 'Other';

        return {
          type,
          content: sectionContent,
        };
      }).filter(section => section.type !== 'Other' && section.content);

      return {
        version,
        date,
        sections,
      };
    }).filter(v => v.version && v.sections.length > 0 && v.version !== 'Unreleased');

    return versions;
  } catch (error) {
    console.error('Failed to parse changelog:', error);
    return [];
  }
}
