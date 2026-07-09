// Observação: o backend atual dispara notificações por canais (e-mail, push,
// whatsapp) mas ainda NÃO expõe um controller REST de listagem. Este módulo já
// deixa o contrato pronto (GET /notifications, POST /notifications/{id}/read) e
// degrada silenciosamente enquanto o endpoint não existir.
export type NotificationStatus = 'ENVIADA' | 'LIDA' | 'PENDENTE' | 'FALHA';

export interface NotificationItem {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}
