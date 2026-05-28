export type PublicView =
  | 'home'
  | 'discount-shop'
  | 'service-centers'
  | 'premium-stores'
  | 'company-products'
  | 'product-details';

export type AuthPage = 'login' | 'signup' | 'forgot-password';

export type AdminView =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'packages'
  | 'ranks'
  | 'promotions'
  | 'earned-promotions'
  | 'members'
  | 'service-centers'
  | 'payouts'
  | 'payroll'
  | 'settings';

export type DashboardTab =
  | 'dashboard'
  | 'analysis'
  | 'discount-shop'
  | 'service-centers'
  | 'premium-stores'
  | 'company-products'
  | 'my-cart'
  | 'my-orders'
  | 'manage-orders'
  | 'transactions'
  | 'bonuses'
  | 'profile'
  | 'genealogys'
  | 'settings'
  | 'about-us'
  | 'admin-panel'
  | 'login-as-user';

export const PUBLIC_VIEW_PATHS: Record<Exclude<PublicView, 'product-details'>, string> = {
  home: '/',
  'discount-shop': '/discount-shop',
  'service-centers': '/service-centers',
  'premium-stores': '/premium-stores',
  'company-products': '/products',
};

export const AUTH_PAGE_PATHS: Record<AuthPage, string> = {
  login: '/login',
  signup: '/signup',
  'forgot-password': '/forgot-password',
};

export const DASHBOARD_TAB_PATHS: Record<DashboardTab, string> = {
  dashboard: '/dashboard',
  analysis: '/dashboard/analysis',
  'discount-shop': '/dashboard/discount-shop',
  'service-centers': '/dashboard/service-centers',
  'premium-stores': '/dashboard/premium-stores',
  'company-products': '/dashboard/products',
  'my-cart': '/dashboard/cart',
  'my-orders': '/dashboard/orders',
  'manage-orders': '/dashboard/manage-orders',
  transactions: '/dashboard/transactions',
  bonuses: '/dashboard/bonuses',
  profile: '/dashboard/profile',
  genealogys: '/dashboard/genealogy',
  settings: '/dashboard/settings',
  'about-us': '/dashboard/about',
  'admin-panel': '/dashboard/admin',
  'login-as-user': '/dashboard/login-as-user',
};

export const ADMIN_VIEW_PATHS: Record<AdminView, string> = {
  dashboard: '/dashboard/admin',
  products: '/dashboard/admin/product',
  categories: '/dashboard/admin/category',
  packages: '/dashboard/admin/package',
  ranks: '/dashboard/admin/rank',
  promotions: '/dashboard/admin/promotion',
  'earned-promotions': '/dashboard/admin/earned-promotion',
  members: '/dashboard/admin/member',
  'service-centers': '/dashboard/admin/service-center',
  payouts: '/dashboard/admin/payout',
  payroll: '/dashboard/admin/payroll',
  settings: '/dashboard/admin/settings',
};

const ADMIN_VIEW_SEGMENTS: Record<string, AdminView> = {
  product: 'products',
  products: 'products',
  category: 'categories',
  categories: 'categories',
  package: 'packages',
  packages: 'packages',
  rank: 'ranks',
  ranks: 'ranks',
  promotion: 'promotions',
  promotions: 'promotions',
  'earned-promotion': 'earned-promotions',
  'earned-promotions': 'earned-promotions',
  member: 'members',
  members: 'members',
  'service-center': 'service-centers',
  'service-centers': 'service-centers',
  payout: 'payouts',
  payouts: 'payouts',
  payroll: 'payroll',
  setting: 'settings',
  settings: 'settings',
};

export function getPublicViewPath(view: PublicView) {
  if (view === 'product-details') return PUBLIC_VIEW_PATHS['company-products'];
  return PUBLIC_VIEW_PATHS[view];
}

export function getDashboardTabPath(tab: string) {
  return DASHBOARD_TAB_PATHS[tab as DashboardTab] ?? DASHBOARD_TAB_PATHS.dashboard;
}

export function getDashboardTabFromPath(pathname: string) {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  const entries = Object.entries(DASHBOARD_TAB_PATHS) as [DashboardTab, string][];
  const exactEntry = entries.find(([, path]) => path === normalizedPath);
  if (exactEntry) return exactEntry[0];

  const nestedEntry = [...entries]
    .sort(([, a], [, b]) => b.length - a.length)
    .find(([, path]) => path !== DASHBOARD_TAB_PATHS.dashboard && normalizedPath.startsWith(`${path}/`));

  return nestedEntry?.[0];
}

export function getAdminViewPath(view: AdminView) {
  return ADMIN_VIEW_PATHS[view] ?? ADMIN_VIEW_PATHS.dashboard;
}

export function getAdminViewFromPath(pathname: string) {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  if (normalizedPath === ADMIN_VIEW_PATHS.dashboard) return 'dashboard';
  if (!normalizedPath.startsWith(`${ADMIN_VIEW_PATHS.dashboard}/`)) return undefined;

  const segment = normalizedPath.slice(`${ADMIN_VIEW_PATHS.dashboard}/`.length).split('/')[0];
  return ADMIN_VIEW_SEGMENTS[segment];
}
