import { useEffect } from 'react';

// Desloga o usuário após um período SEM interação (idle). A "última atividade" fica no
// localStorage para ser compartilhada entre abas: se qualquer aba estiver ativa, todas
// continuam logadas; se todas ficarem paradas por 2h, a sessão cai.
const KEY = 'nalitech.lastActivity';
export const IDLE_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 horas
const CHECK_MS = 60_000; // verifica a cada 1 min
const WRITE_THROTTLE_MS = 30_000; // evita gravar no localStorage a cada mousemove
const EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove', 'visibilitychange'];

function markActivity() {
  const now = Date.now();
  const last = Number(localStorage.getItem(KEY) ?? 0);
  if (now - last >= WRITE_THROTTLE_MS) {
    localStorage.setItem(KEY, String(now));
  }
}

/**
 * Quando `enabled` (usuário logado), chama `onIdle` após {@link IDLE_LIMIT_MS} sem
 * nenhuma interação do usuário. Reinicia a contagem a cada evento de atividade.
 */
export function useIdleLogout(enabled: boolean, onIdle: () => void) {
  useEffect(() => {
    if (!enabled) return;
    localStorage.setItem(KEY, String(Date.now())); // zera a contagem ao entrar

    const handler = () => markActivity();
    EVENTS.forEach((e) => window.addEventListener(e, handler, { passive: true }));

    const interval = window.setInterval(() => {
      const last = Number(localStorage.getItem(KEY) ?? 0);
      if (last && Date.now() - last >= IDLE_LIMIT_MS) {
        window.clearInterval(interval);
        onIdle();
      }
    }, CHECK_MS);

    return () => {
      window.clearInterval(interval);
      EVENTS.forEach((e) => window.removeEventListener(e, handler));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
