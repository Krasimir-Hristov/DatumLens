/**
 * Citation Parser for DatumLens RAG
 *
 * Parses AI responses to extract source citations in the format:
 * [Source: filename.pdf, Page X]
 *
 * This module provides utilities to:
 * 1. Detect citations in text
 * 2. Parse citation details (filename, page)
 * 3. Split text into parts for rendering
 */

// Citation data structure
export interface Citation {
  filename: string;
  page: number;
  fullMatch: string; // Original matched string for replacement
}

// Part of parsed text - either plain text or a citation
export type ParsedPart =
  | { type: 'text'; content: string }
  | { type: 'citation'; citation: Citation };

// Regex pattern for matching citations
// Matches: [Source: filename.pdf, Page 3] or [Source: document name.pdf, Page 15]
const CITATION_PATTERN = /\[Source:\s*([^,]+?)\s*,\s*Page\s*(\d+)\]/g;

// Single match pattern (without global flag for testing)
const CITATION_TEST_PATTERN = /\[Source:\s*([^,]+?)\s*,\s*Page\s*(\d+)\]/;

/**
 * Check if text contains any citations
 */
export function hasCitations(text: string): boolean {
  return CITATION_TEST_PATTERN.test(text);
}

/**
 * Extract all citations from text
 */
export function extractCitations(text: string): Citation[] {
  const citations: Citation[] = [];
  const regex = new RegExp(CITATION_PATTERN.source, 'g');

  let match;
  while ((match = regex.exec(text)) !== null) {
    citations.push({
      filename: match[1].trim(),
      page: parseInt(match[2], 10),
      fullMatch: match[0],
    });
  }

  return citations;
}

/**
 * Parse text into parts (text and citations)
 * This is the main function for rendering
 */
export function parseTextWithCitations(text: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  const regex = new RegExp(CITATION_PATTERN.source, 'g');

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }
    }

    // Add the citation
    parts.push({
      type: 'citation',
      citation: {
        filename: match[1].trim(),
        page: parseInt(match[2], 10),
        fullMatch: match[0],
      },
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text after last citation
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  // If no citations found, return the whole text as a single part
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }

  return parts;
}

/**
 * Get unique documents mentioned in citations
 * Useful for showing a summary of sources used
 */
export function getUniqueDocuments(citations: Citation[]): string[] {
  const unique = new Set(citations.map((c) => c.filename));
  return Array.from(unique);
}

/**
 * Format citation for display (short version)
 */
export function formatCitationShort(citation: Citation): string {
  return `${citation.filename} (p.${citation.page})`;
}

/**
 * Format citation for display (full version)
 */
export function formatCitationFull(citation: Citation): string {
  return `Source: ${citation.filename}, Page ${citation.page}`;
}
