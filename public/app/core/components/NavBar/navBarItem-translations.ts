// Maps the ID of the nav item to a translated phrase to later pass to <Trans />
// Because the navigation content is dynamic (defined in the backend), we can not use
// the normal inline message definition method.

import i18n from 'app/core/internationalization';

// The keys of the TRANSLATED_MENU_ITEMS object (NOT the id inside the defineMessage function)
// must match the ID of the navigation item, as defined in the backend nav model

// see pkg/api/index.go
const TRANSLATED_MENU_ITEMS: Record<string, string> = {
  home: i18n.t('nav.home', 'Home'),

  create: i18n.t('nav.create', 'Create'),
  'create-dashboard': i18n.t('nav.create-dashboard', 'Dashboard'),
  folder: i18n.t('nav.create-folder', 'Folder'),
  import: i18n.t('nav.create-import', 'Import'),
  alert: i18n.t('nav.create-alert', 'New alert rule'),

  starred: i18n.t('nav.starred', 'Starred'),
  'starred-empty': i18n.t('nav.starred-empty', 'Your starred dashboards will appear here'),
  dashboards: i18n.t('nav.dashboards', 'Dashboards'),
  'dashboards/browse': i18n.t('nav.manage-dashboards', 'Browse'),
  'dashboards/playlists': i18n.t('nav.playlists', 'Playlists'),
  'dashboards/snapshots': i18n.t('nav.snapshots', 'Snapshots'),
  'dashboards/library-panels': i18n.t('nav.library-panels', 'Library panels'),
  'dashboards/new': i18n.t('nav.new-dashboard', 'New dashboard'),
  'dashboards/folder/new': i18n.t('nav.new-folder', 'New folder'),

  explore: i18n.t('nav.explore', 'Explore'),

  alerting: i18n.t('nav.alerting', 'Alerting'),
  'alerting-legacy': i18n.t('nav.alerting-legacy', 'Alerting (legacy)'),
  'alert-list': i18n.t('nav.alerting-list', 'Alert rules'),
  receivers: i18n.t('nav.alerting-receivers', 'Contact points'),
  'am-routes': i18n.t('nav.alerting-am-routes', 'Notification policies'),
  channels: i18n.t('nav.alerting-channels', 'Notification channels'),

  silences: i18n.t('nav.alerting-silences', 'Silences'),
  groups: i18n.t('nav.alerting-groups', 'Groups'),
  'alerting-admin': i18n.t('nav.alerting-admin', 'Admin'),

  cfg: i18n.t('nav.config', 'Configuration'),
  datasources: i18n.t('nav.datasources', 'Data sources'),
  correlations: i18n.t('nav.correlations', 'Correlations'),
  users: i18n.t('nav.users', 'Users'),
  teams: i18n.t('nav.teams', 'Teams'),
  plugins: i18n.t('nav.plugins', 'Plugins'),
  'org-settings': i18n.t('nav.org-settings', 'Preferences'),
  apikeys: i18n.t('nav.api-keys', 'API keys'),
  serviceaccounts: i18n.t('nav.service-accounts', 'Service accounts'),

  live: i18n.t('nav.live', 'Event streaming'),
  'live-status': i18n.t('nav.live-status', 'Status'),
  'live-pipeline': i18n.t('nav.live-pipeline', 'Pipeline'),
  'live-cloud': i18n.t('nav.live-cloud', 'Cloud'),

  help: i18n.t('nav.help', 'Help'),

  'profile-settings': i18n.t('nav.profile/settings', 'Preferences'),
  'change-password': i18n.t('nav.profile/password', 'Change password'),
  'sign-out': i18n.t('nav.sign-out', 'Sign out'),
};

export default TRANSLATED_MENU_ITEMS;
