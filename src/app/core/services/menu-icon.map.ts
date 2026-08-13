import { IMenu } from '../models/menu.model';

/**
 * Centralized Material-icon → IMenu.key mapping.
 *
 * Keeping a single source per icon set means the navigation chrome never
 * mixes Material glyphs with PNG icons or Boxicons — visual consistency is
 * preserved across every render path (sidebar, topbar mobile sheet, future
 * command palette, etc.).
 *
 * If a key is not present in the map, the sidebar falls back to a neutral
 * `circle` glyph so missing entries still render predictably.
 */
export const MENU_ICON_MAP: Record<string, string> = {
  // Top-level items
  PROFILE: 'account_circle',
  ACCOUNTS: 'account_balance',
  SERVICES: 'miscellaneous_services',
  HISTORY: 'history',
  BENEFICIARY: 'contacts',
  TRANSFER: 'sync_alt',
  TOPUP: 'mobile_friendly',
  UTILITY_BILLS: 'receipt_long',
  'CHANGE-PASSWORD': 'lock_reset',

  // Account children
  'ACCOUNT-DETAILS': 'manage_accounts',
  STATEMENT: 'description',
  'ACCOUNT-OPEN': 'add_business',
  'ACCOUNT-OPENING-RECEIPT': 'receipt',

  // Service request children
  CHEQUEBOOK: 'menu_book',
  INSTRUCTION: 'rule',
  POSITIVEPAY: 'verified',
  TAX_DOC_UPLOAD: 'upload_file',
  STOP_CHEQUE: 'do_not_disturb',

  // History children
  'FINANCIAL-TRANSACTION-DETAILS': 'swap_horiz',
  'TRANSACTION-RECEIPT': 'description',
  REQUEST_LOG: 'list_alt',
  USERACTIVITY: 'schedule',

  // Security & utilities (topbar)
  SECURITY_ADVICE: 'shield',
};

export const FALLBACK_MENU_ICON = 'radio_button_unchecked';

/** Resolve a Material icon name for an IMenu item, with safe fallback. */
export function iconForMenu(item: Pick<IMenu, 'key'> & Partial<IMenu>): string {
  if (item.key && MENU_ICON_MAP[item.key]) return MENU_ICON_MAP[item.key];
  // Heuristic by title when key is missing
  const t = (item.title || '').toLowerCase();
  if (t.includes('transfer')) return 'sync_alt';
  if (t.includes('benef')) return 'contacts';
  if (t.includes('history')) return 'history';
  if (t.includes('request')) return 'miscellaneous_services';
  if (t.includes('bill')) return 'receipt_long';
  if (t.includes('top')) return 'mobile_friendly';
  if (t.includes('account')) return 'account_balance';
  if (t.includes('profile')) return 'account_circle';
  return FALLBACK_MENU_ICON;
}
