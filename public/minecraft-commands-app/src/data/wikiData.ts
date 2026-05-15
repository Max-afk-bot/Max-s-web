/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WikiArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  points: string[];
}

export const WIKI_DATA: WikiArticle[] = [
  {
    id: 'selectors',
    title: 'Target Selectors',
    category: 'Fundamentals',
    content: 'Target selectors are the variables starting with @ that tell the game who or what the command should affect.',
    points: [
      '@p: Protocol Nearest Player - Targets the player closest to the execution point.',
      '@a: Protocol All Players - Affects every user currently in the session.',
      '@r: Protocol Random Player - Picks one random user.',
      '@e: Protocol All Entities - Every living thing and even dropped items.',
      '@s: Protocol Self - Refers purely to the entity that executed the command.'
    ]
  },
  {
    id: 'rel_coords',
    title: 'Relative Logic (~)',
    category: 'Fundamentals',
    content: 'Relative coordinates use the tilde (~) symbol to calculate position based on where you are standing.',
    points: [
      '~ ~ ~: Your exact current position.',
      '~ ~5 ~: Exactly 5 blocks directly above your head.',
      '~ -1 ~: The block you are currently standing on top of.',
      '~10 ~ ~: 10 blocks along the X-axis from where you are.'
    ]
  },
  {
    id: 'effects_guide',
    title: 'Status Effects',
    category: 'Advanced',
    content: 'Effects are temporary modifiers to player or mob stats. They follow the give/clear protocol.',
    points: [
      'Amplifier (0-255): Level 0 is effect level 1. Level 255 is maximum.',
      'Duration: Time in seconds. Use 99999 for essentially permanent effects.',
      'Hide Particles: Setting this to "true" makes the effect silent and invisible.'
    ]
  }
];
