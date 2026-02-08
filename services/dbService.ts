
import { User, GeneratedContent, ActivityLog } from "../types";

const DB_NAME = 'ClipScript_ProperDB';
const DB_VERSION = 2;

class ProperDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }
        if (!db.objectStoreNames.contains('stories')) {
          const storyStore = db.createObjectStore('stories', { keyPath: 'id' });
          storyStore.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('activity')) {
          const activityStore = db.createObjectStore('activity', { keyPath: 'id' });
          activityStore.createIndex('userId', 'userId', { unique: false });
          activityStore.createIndex('action', 'action', { unique: false });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = () => reject('Failed to open IndexedDB');
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    await this.init();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('email');
      const request = index.get(email.toLowerCase().trim());
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt' | 'totalGenerations' | 'credits'>): Promise<User> {
    await this.init();
    const existing = await this.findUserByEmail(userData.email);
    if (existing) throw new Error("This email is already registered. Try logging in.");

    const newUser: User = {
      ...userData,
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email.toLowerCase().trim(),
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      totalGenerations: 0,
      credits: 10,
      deviceInfo: userData.deviceInfo || navigator.platform,
      browserInfo: userData.browserInfo || navigator.userAgent
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.add(newUser);
      request.onsuccess = async () => {
        await this.recordActivity(newUser.id, 'LOGIN', 'Account created.');
        resolve(newUser);
      };
      request.onerror = () => reject('Failed to save user to database.');
    });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.get(userId);

      request.onsuccess = () => {
        const user = request.result;
        if (!user) return reject('User not found');
        const updatedUser = { ...user, ...updates };
        const updateRequest = store.put(updatedUser);
        updateRequest.onsuccess = () => resolve(updatedUser);
      };
      request.onerror = () => reject('Update failed');
    });
  }

  async deductCredits(userId: string, amount: number): Promise<number> {
    const user = await this.getUserById(userId);
    if (user.credits < amount) throw new Error("Insufficient credits.");
    const newBalance = user.credits - amount;
    await this.updateUser(userId, { credits: newBalance });
    return newBalance;
  }

  async addCredits(userId: string, amount: number): Promise<number> {
    const user = await this.getUserById(userId);
    const newBalance = (user.credits || 0) + amount;
    await this.updateUser(userId, { credits: newBalance });
    await this.recordActivity(userId, 'PURCHASE', `Purchased ${amount} credits.`);
    return newBalance;
  }

  async authenticate(email: string, pass: string): Promise<User> {
    const user = await this.findUserByEmail(email);
    if (!user) throw new Error("Account not found. Please sign up first.");
    if (user.authProvider === 'google') throw new Error("This account is linked with Google. Please use Continue with Google.");
    if (user.password !== pass) throw new Error("Incorrect password.");
    
    const updated = await this.updateUser(user.id, { 
      lastLoginAt: Date.now(),
      browserInfo: navigator.userAgent
    });
    await this.recordActivity(user.id, 'LOGIN', `Signed in with email.`);
    
    return updated;
  }

  async recordActivity(userId: string, action: ActivityLog['action'], details: string, metadata?: any): Promise<void> {
    await this.init();
    const log: ActivityLog = {
      id: `act_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      details,
      timestamp: Date.now(),
      metadata
    };

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['activity'], 'readwrite');
      const store = transaction.objectStore('activity');
      store.add(log);
      resolve();
    });
  }

  async getActivities(userId: string): Promise<ActivityLog[]> {
    await this.init();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['activity'], 'readonly');
      const store = transaction.objectStore('activity');
      const index = store.index('userId');
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const results = request.result || [];
        results.sort((a: any, b: any) => b.timestamp - a.timestamp);
        resolve(results);
      };
    });
  }

  async getStoriesByUser(userId: string): Promise<(GeneratedContent & { id: string })[]> {
    await this.init();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['stories'], 'readonly');
      const store = transaction.objectStore('stories');
      const index = store.index('userId');
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const results = request.result || [];
        results.sort((a: any, b: any) => b.timestamp - a.timestamp);
        resolve(results);
      };
    });
  }

  async saveStory(userId: string, content: GeneratedContent): Promise<void> {
    await this.init();
    const storyId = `str_${Math.random().toString(36).substr(2, 9)}`;
    const storyData = {
      ...content,
      id: storyId,
      userId,
      timestamp: Date.now()
    };

    const user = await this.getUserById(userId);
    if (user) {
      await this.updateUser(userId, { totalGenerations: (user.totalGenerations || 0) + 1 });
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['stories'], 'readwrite');
      const store = transaction.objectStore('stories');
      const request = store.add(storyData);
      request.onsuccess = async () => {
        await this.recordActivity(userId, 'GENERATE', `Generated "${content.title}"`, { storyId });
        resolve();
      };
      request.onerror = () => reject('Failed to save story');
    });
  }

  async getUserById(userId: string): Promise<User> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('User lookup failed');
    });
  }
}

export const dbService = new ProperDB();
