/**
 * Session Manager
 * 
 * Standalone library for managing agent sessions and lifecycle.
 */

export type SessionStatus = 'active' | 'idle' | 'terminated' | 'suspended';

export interface Session {
  id: string;
  status: SessionStatus;
  createdAt: string;
  lastActivity: string;
  metadata?: Record<string, any>;
}

export interface SessionConfig {
  timeout?: number;
  maxSessions?: number;
}

export class SessionManager {
  private sessions: Map<string, Session>;
  private config: SessionConfig;

  constructor(config: SessionConfig = {}) {
    this.sessions = new Map();
    this.config = { timeout: 300000, maxSessions: 1000, ...config };
  }

  create(id: string, metadata?: Record<string, any>): Session {
    const session: Session = {
      id,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      metadata
    };
    this.sessions.set(id, session);
    return session;
  }

  get(id: string): Session | null {
    return this.sessions.get(id) || null;
  }

  update(id: string, updates: Partial<Session>): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    Object.assign(session, updates, { lastActivity: new Date().toISOString() });
    return true;
  }

  terminate(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    session.status = 'terminated';
    return true;
  }

  getAll(): Session[] {
    return Array.from(this.sessions.values());
  }

  getActive(): Session[] {
    return this.getAll().filter(s => s.status === 'active');
  }

  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [id, session] of this.sessions) {
      const lastActivity = new Date(session.lastActivity).getTime();
      if (now - lastActivity > (this.config.timeout || 300000)) {
        session.status = 'idle';
        cleaned++;
      }
    }
    return cleaned;
  }
}

export default SessionManager;
