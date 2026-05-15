/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const KEYS = {
  FAVORITES: 'mc_cmd_favorites',
  HISTORY: 'mc_cmd_history',
  SETTINGS: 'mc_cmd_settings'
};

export const storageService = {
  getFavorites: (): string[] => {
    try {
      const data = localStorage.getItem(KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleFavorite: (commandId: string): boolean => {
    const favs = storageService.getFavorites();
    const index = favs.indexOf(commandId);
    let isAdded = false;
    
    if (index === -1) {
      favs.push(commandId);
      isAdded = true;
    } else {
      favs.splice(index, 1);
      isAdded = false;
    }
    
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
    return isAdded;
  },

  getHistory: (): string[] => {
    try {
      const data = localStorage.getItem(KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToHistory: (commandId: string) => {
    let history = storageService.getHistory();
    history = [commandId, ...history.filter(id => id !== commandId)].slice(0, 50);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  },

  clearHistory: () => {
    localStorage.removeItem(KEYS.HISTORY);
  },

  getUserCommands: (): any[] => {
    try {
      const data = localStorage.getItem('mc_cmd_user');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveUserCommand: (cmd: any) => {
    const list = storageService.getUserCommands();
    list.push({ ...cmd, id: `user-${Date.now()}`, category: 'custom' });
    localStorage.setItem('mc_cmd_user', JSON.stringify(list));
  },

  deleteUserCommand: (id: string) => {
    const list = storageService.getUserCommands();
    localStorage.setItem('mc_cmd_user', JSON.stringify(list.filter(c => c.id !== id)));
  }
};
