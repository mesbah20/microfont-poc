import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Landing } from './layout/landing/landing';
import { Login } from './core/auth/login/login';
import { InstructionPage } from './core/auth/self-registration/instruction/instruction.page';
import { PasswordRecoveryPage } from './core/auth/self-registration/password-recovery/password-recovery.page';
import { UserIdRecoveryPage } from './core/auth/self-registration/userid-recovery/userid-recovery.page';
import { Dashboard } from './layout/dashboard/dashboard';
import { FeatureStubComponent } from './shared/components/feature-stub/feature-stub.component';
import { AccessGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'instruction', component: InstructionPage },
  { path: 'passwordrecovery', component: PasswordRecoveryPage },
  { path: 'useridrecovery', component: UserIdRecoveryPage },

  {
    path: 'dashboard',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: Dashboard },
    ],
  },

  { path: 'landing', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'landing/home', redirectTo: 'dashboard', pathMatch: 'full' },

  // ============= Anonymous flows =============
  {
    path: 'selfregistration',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Self Registration', icon: 'person_add', subtitle: 'Open a new bank account online' } },
    ],
  },
  {
    path: 'redirection-page',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Redirection Page', icon: 'link' } },
    ],
  },

  // ============= Profile =============
  {
    path: 'profile',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', redirectTo: 'detailprofile', pathMatch: 'full' },
      { path: 'detailprofile', component: FeatureStubComponent, data: { title: 'Profile', subtitle: 'View and update your personal details', icon: 'badge' } },
      { path: 'changepassword', component: FeatureStubComponent, data: { title: 'Change Password', icon: 'lock_reset' } },
    ],
  },

  // ============= Account (demo-faithful paths) =============
  {
    path: 'account',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', redirectTo: 'account-details', pathMatch: 'full' },
      { path: 'account-details', component: FeatureStubComponent, data: { title: 'Account Details', subtitle: 'Detailed view of your bank accounts', icon: 'visibility', features: ['Account balances', 'Interest details', 'Transaction summary'] } },
      { path: 'statement', component: FeatureStubComponent, data: { title: 'Account Statement', icon: 'description' } },
      { path: 'account-open', component: FeatureStubComponent, data: { title: 'New FDR/Scheme', icon: 'add_business' } },
      { path: 'account-opening-receipt', component: FeatureStubComponent, data: { title: 'Account Opening Receipt', icon: 'confirmation_number' } },
      { path: 'financial-transactions', component: FeatureStubComponent, data: { title: 'Fund Transfer Log', icon: 'history' } },
      { path: 'transaction-receipt', component: FeatureStubComponent, data: { title: 'Transaction Receipt', icon: 'receipt' } },
      { path: 'changepassword', component: FeatureStubComponent, data: { title: 'Change Password', icon: 'lock_reset' } },
    ],
  },

  // ============= Transactions (demo-faithful) =============
  {
    path: 'transactions',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', redirectTo: 'fundtransfer', pathMatch: 'full' },
      { path: 'fundtransfer', component: FeatureStubComponent, data: { title: 'Fund Transfer', subtitle: 'Move money between accounts and to beneficiaries', icon: 'swap_horiz', features: ['Own Account', 'Within Bank', 'Other Bank (EFT/NPSB/RTGS)', 'MFS (Bkash/Nagad)', 'Bulk Transfer'] } },
      { path: 'standinginstruction', component: FeatureStubComponent, data: { title: 'Standing Instruction', icon: 'event_repeat' } },
    ],
  },

  // ============= Utility (demo-faithful) =============
  {
    path: 'utility',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', redirectTo: 'billpayment', pathMatch: 'full' },
      { path: 'billpayment', component: FeatureStubComponent, data: { title: 'Utility Bill Payment', icon: 'receipt_long', subtitle: 'Pay electricity, gas, water, internet bills', features: ['DESCO', 'DPDC', 'BGDCL', 'BTCL', 'WZPDCL', 'IVAC'] } },
    ],
  },

  // ============= Top-up (demo-faithful) =============
  {
    path: 'topup',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Mobile Top-up', icon: 'phone_android', subtitle: 'Recharge any mobile operator instantly' } },
    ],
  },

  // ============= Activity (demo-faithful) =============
  {
    path: 'activity',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', redirectTo: 'useractivity', pathMatch: 'full' },
      { path: 'useractivity', component: FeatureStubComponent, data: { title: 'User Activity', icon: 'timeline', subtitle: 'View your account activity log' } },
    ],
  },

  // ============= My Services (demo-faithful) =============
  {
    path: 'myservices',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', redirectTo: 'chequebookrequest', pathMatch: 'full' },
      { path: 'chequebookrequest', component: FeatureStubComponent, data: { title: 'Cheque Book Request', icon: 'menu_book' } },
      { path: 'positivepayrequest', component: FeatureStubComponent, data: { title: 'Positive Pay', icon: 'verified' } },
      { path: 'tax-document-upload-request', component: FeatureStubComponent, data: { title: 'Tax Document Upload', icon: 'upload_file' } },
      { path: 'stopchequerequest', component: FeatureStubComponent, data: { title: 'Stop Cheque', icon: 'block' } },
      { path: 'request-log', component: FeatureStubComponent, data: { title: 'Request Log', icon: 'history' } },
    ],
  },

  // ============= Accounts =============
  {
    path: 'account',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', redirectTo: 'summary', pathMatch: 'full' },
      { path: 'summary', component: FeatureStubComponent, data: { title: 'Account Summary', subtitle: 'Overview of all your accounts', icon: 'account_balance_wallet', features: ['View balances', 'Recent transactions', 'Quick actions'] } },
      { path: 'details', component: FeatureStubComponent, data: { title: 'Account Details', icon: 'visibility' } },
      { path: 'statement', component: FeatureStubComponent, data: { title: 'Account Statement', icon: 'description' } },
      { path: 'transactions', component: FeatureStubComponent, data: { title: 'Financial Transactions', icon: 'receipt_long' } },
      { path: 'transactionhistory', component: FeatureStubComponent, data: { title: 'Transaction History', icon: 'history' } },
      { path: 'chequelist', component: FeatureStubComponent, data: { title: 'Cheque List', icon: 'list_alt' } },
      { path: 'fundtransfer', component: FeatureStubComponent, data: { title: 'Fund Transfer', icon: 'swap_horiz', features: ['Own Account', 'Other Bank Account', 'EFT', 'NPSB', 'RTGS', 'MFS (Bkash/Nagad)', 'Bulk Transfer'] } },
      { path: 'standinginstruction', component: FeatureStubComponent, data: { title: 'Standing Instruction', icon: 'event_repeat' } },
      { path: 'opening', component: FeatureStubComponent, data: { title: 'Account Opening', icon: 'add_business' } },
      { path: 'opening-receipt', component: FeatureStubComponent, data: { title: 'Account Opening Receipt', icon: 'confirmation_number' } },
      { path: 'encashment', component: FeatureStubComponent, data: { title: 'Encashment Request', icon: 'request_quote' } },
      { path: 'receipt', component: FeatureStubComponent, data: { title: 'Transaction Receipt', icon: 'receipt' } },
    ],
  },

  // ============= Beneficiary =============
  {
    path: 'beneficiary',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Beneficiary Management', subtitle: 'Manage your payees for fast transfers', icon: 'people', features: ['Add payee', 'Edit / delete', 'Within bank, NPSB, EFT, RTGS, MFS'] } },
    ],
  },

  // ============= Loan =============
  {
    path: 'investment',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Loan Application', subtitle: 'Apply for personal, home, auto loans', icon: 'account_balance', features: ['Personal Loan', 'Home Loan', 'Auto Loan', 'Application tracking'] } },
      { path: 'log', component: FeatureStubComponent, data: { title: 'Loan Application Log', icon: 'history' } },
    ],
  },

  // ============= Topup =============
  {
    path: 'topup',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Mobile Topup', icon: 'phone_android', subtitle: 'Recharge any mobile operator instantly' } },
    ],
  },

  // ============= Utility / Bill Payment =============
  {
    path: 'utility',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Utility Bill Payment', icon: 'receipt_long', subtitle: 'Pay electricity, gas, water, internet bills', features: ['DESCO', 'DPDC', 'BGDCL', 'BTCL', 'WZPDCL', 'IVAC'] } },
    ],
  },

  // ============= Activity =============
  {
    path: 'activity',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'User Activity', icon: 'timeline', subtitle: 'View your account activity log' } },
    ],
  },

  // ============= Other Services =============
  {
    path: 'otherservices',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Other Services', icon: 'apps', features: ['Benefits', 'Notification Center', 'Partner Portal'] } },
      { path: 'notifications', component: FeatureStubComponent, data: { title: 'Notifications', icon: 'notifications' } },
      { path: 'benefits', component: FeatureStubComponent, data: { title: 'Benefits', icon: 'card_giftcard' } },
      { path: 'partner', component: FeatureStubComponent, data: { title: 'Partner Portal', icon: 'handshake' } },
    ],
  },

  // ============= Requests & Services =============
  {
    path: 'myservices',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'My Services', icon: 'miscellaneous_services', subtitle: 'Service requests and tracking' } },
      { path: 'addresschange', component: FeatureStubComponent, data: { title: 'Address Change Request', icon: 'edit_location_alt' } },
      { path: 'bankguarantee', component: FeatureStubComponent, data: { title: 'Bank Guarantee', icon: 'verified' } },
      { path: 'chequebook', component: FeatureStubComponent, data: { title: 'Cheque Book Request', icon: 'menu_book' } },
      { path: 'complain', component: FeatureStubComponent, data: { title: 'Complaints', icon: 'report_problem' } },
      { path: 'documentupload', component: FeatureStubComponent, data: { title: 'Document Upload', icon: 'upload_file' } },
      { path: 'lc', component: FeatureStubComponent, data: { title: 'Letter of Credit', icon: 'mail' } },
      { path: 'lostcard', component: FeatureStubComponent, data: { title: 'Lost Card Report', icon: 'credit_card_off' } },
      { path: 'papercertificate', component: FeatureStubComponent, data: { title: 'Paper Certificate', icon: 'description' } },
      { path: 'payorder', component: FeatureStubComponent, data: { title: 'Pay Order Request', icon: 'request_page' } },
      { path: 'requestlog', component: FeatureStubComponent, data: { title: 'Request Log', icon: 'history' } },
      { path: 'statement', component: FeatureStubComponent, data: { title: 'Statement Request', icon: 'description' } },
      { path: 'stopcheque', component: FeatureStubComponent, data: { title: 'Stop Cheque', icon: 'block' } },
    ],
  },

  // ============= Security Advice =============
  {
    path: 'securityadvice',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Security Advice', icon: 'security', subtitle: 'Stay safe online with our security tips' } },
    ],
  },

  // ============= Merchant / ACS =============
  {
    path: 'merchantlogin',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Merchant Login', icon: 'storefront' } },
    ],
  },
  {
    path: 'merchantpayment',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Merchant Payment', icon: 'point_of_sale' } },
    ],
  },
  {
    path: 'acslogin',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'ACS Login', icon: 'assignment' } },
    ],
  },
  {
    path: 'acspayment',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'ACS Payment', icon: 'payment' } },
    ],
  },

  // ============= Page Not Found =============
  {
    path: 'pagenotfound',
    component: Layout,
    children: [
      { path: '', component: FeatureStubComponent, data: { title: 'Page Not Found', icon: 'error_outline' } },
    ],
  },

  // ============= Legacy / Demo =============
  {
    path: 'poc',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', loadChildren: () => import('./shared/features/approval/poc.routing').then(m => m.PocRouting) },
    ],
  },
  {
    path: 'feature',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', loadChildren: () => import('./shared/features/feature.routing').then(m => m.featureRoutes) },
    ],
  },
  {
    path: 'rpt',
    component: Layout,
    canActivate: [AccessGuard],
    children: [
      { path: '', loadChildren: () => import('./shared/features/report/report.routing').then(m => m.reportRoutes) },
    ],
  },

  { path: '**', redirectTo: 'login' },
];