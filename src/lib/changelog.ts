
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { VersionInfo } from './types';

export async function parseChangelog(): Promise<VersionInfo[]> {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = await fs.readFile(changelogPath, 'utf-8');

    // Split content by version headers
    const versionBlocks = content.split(/^##\s+/m).slice(1);
    
    const versions: VersionInfo[] = versionBlocks.map(block => {
      const lines = block.split('\n');
      const titleLine = lines.shift() || '';

      // More robust regex to handle formats with or without links, e.g., "1.2.0 (2025-06-30)" or "[1.2.0] - 2025-06-30"
      const titleMatch = titleLine.match(/^(?:\[(.*?)\]|([\d.]+))\s*(?:[-(]?\s*(.*?)\s*[)-]?)?$/);
      
      const version = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
      const date = titleMatch ? (titleMatch[3] || '').trim() : '';
      
      const markdownContent = lines.join('\n').trim();

      // Return a single content block instead of trying to parse sections
      return {
        version,
        date,
        content: markdownContent,
      };
    }).filter(v => v.version && v.content && v.version !== 'Unreleased'); // Filter out empty or invalid sections

    return versions;
  } catch (error) {
    console.error('Failed to parse changelog:', error);
    return [];
  }
}
