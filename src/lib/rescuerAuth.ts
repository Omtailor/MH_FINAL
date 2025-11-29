// Hardcoded rescuer credentials for demo
// TODO: Replace with secure authentication for production

const VALID_CREDENTIALS = {
  email: 'codewithtailor@gmail.com',
  password: 'mhom12345',
  rescuer_id: 'rescuer_codewithtailor',
  name: 'Code With Tailor'
};

export interface RescuerSession {
  rescuer_id: string;
  name: string;
  token: string;
  email: string;
}

let currentSession: RescuerSession | null = null;

export function loginRescuer(email: string, password: string): { ok: boolean; error?: string; session?: RescuerSession } {
  if (email !== VALID_CREDENTIALS.email || password !== VALID_CREDENTIALS.password) {
    return { ok: false, error: 'Invalid credentials' };
  }
  
  const session: RescuerSession = {
    rescuer_id: VALID_CREDENTIALS.rescuer_id,
    name: VALID_CREDENTIALS.name,
    token: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: VALID_CREDENTIALS.email
  };
  
  currentSession = session;
  
  // Store in localStorage for persistence
  localStorage.setItem('rescuer_session', JSON.stringify(session));
  
  return { ok: true, session };
}

export function logoutRescuer(): void {
  currentSession = null;
  localStorage.removeItem('rescuer_session');
}

export function getCurrentSession(): RescuerSession | null {
  if (currentSession) return currentSession;
  
  const stored = localStorage.getItem('rescuer_session');
  if (stored) {
    try {
      currentSession = JSON.parse(stored);
      return currentSession;
    } catch {
      localStorage.removeItem('rescuer_session');
    }
  }
  
  return null;
}

export function isLoggedIn(): boolean {
  return getCurrentSession() !== null;
}
