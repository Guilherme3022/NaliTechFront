import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/shared/components/AppLayout';
import { RequireAuth, RequireRole, RoleBasedRedirect } from '@/modules/auth/guards';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/modules/auth/pages/ResetPasswordPage';
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage';
import { ClientsPage } from '@/modules/clients/pages/ClientsPage';
import { ClientDetailPage } from '@/modules/clients/pages/ClientDetailPage';
import { UploadDetailPage } from '@/modules/uploads/pages/UploadDetailPage';
import { MovementsPage } from '@/modules/movements/pages/MovementsPage';
import { ReconciliationPage } from '@/modules/reconciliation/pages/ReconciliationPage';
import { ConciliacaoDetailPage } from '@/modules/reconciliation/pages/ConciliacaoDetailPage';
import { ReconciliationProfilesPage } from '@/modules/reconciliation/pages/ReconciliationProfilesPage';
import { PlanoModelosPage } from '@/modules/planoModelos/pages/PlanoModelosPage';
import { AccountsPage } from '@/modules/accounts/pages/AccountsPage';
import { ImportLayoutsPage } from '@/modules/importLayouts/pages/ImportLayoutsPage';
import { ExportsPage } from '@/modules/exports/pages/ExportsPage';
import { FinancePage } from '@/modules/finance/pages/FinancePage';
import { InvoiceDetailPage } from '@/modules/finance/pages/InvoiceDetailPage';
import { FiscalPage } from '@/modules/fiscal/pages/FiscalPage';
import { CompanyPage } from '@/modules/company/pages/CompanyPage';
import { UsersPage } from '@/modules/users/pages/UsersPage';
import { ProfilePage } from '@/modules/users/pages/ProfilePage';
import { AuditPage } from '@/modules/audit/pages/AuditPage';
import { SettingsPage } from '@/modules/settings/pages/WebhooksPage';
import { PortalLayout } from '@/modules/portal/PortalLayout';
import { PortalPage } from '@/modules/portal/pages/PortalPage';

export function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Portal do cliente (E16) — layout simplificado */}
      <Route element={<RequireRole roles={['CLIENTE']} />}>
        <Route element={<PortalLayout />}>
          <Route path="/portal" element={<PortalPage />} />
        </Route>
      </Route>

      {/* Rotas privadas internas */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<RoleBasedRedirect />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />

          {/* Uploads saiu do menu: o envio acontece dentro da conciliacao.
              A rota de detalhe segue acessivel para depurar o processamento. */}
          <Route path="/uploads/:id" element={<UploadDetailPage />} />
          <Route path="/movements" element={<MovementsPage />} />

          <Route path="/reconciliation" element={<ReconciliationPage />} />
          <Route path="/reconciliation/:id" element={<ConciliacaoDetailPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/import-layouts" element={<ImportLayoutsPage />} />

          <Route element={<RequireRole roles={['ADMIN', 'CONTADOR']} />}>
            <Route path="/reconciliation-profiles" element={<ReconciliationProfilesPage />} />
            <Route path="/plano-modelos" element={<PlanoModelosPage />} />
          </Route>

          <Route path="/finance" element={<FinancePage />} />
          <Route path="/finance/invoices/:id" element={<InvoiceDetailPage />} />

          <Route path="/fiscal" element={<FiscalPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Rotas restritas por perfil */}
          <Route element={<RequireRole roles={['ADMIN', 'CONTADOR']} />}>
            <Route path="/exports" element={<ExportsPage />} />
          </Route>

          <Route element={<RequireRole roles={['ADMIN']} />}>
            <Route path="/company" element={<CompanyPage />} />
            <Route path="/settings/webhooks" element={<SettingsPage />} />
            <Route path="/settings/api-keys" element={<SettingsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/audit" element={<AuditPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
