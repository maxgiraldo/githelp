window.app = angular.module('githelp',
  ['ngCookies',
  'ngResource',
  'ui.bootstrap',
  'ui.route',
  'ui.router',
  'ui.select2',
  'githelp.controllers',
  'githelp.services'
  ]);

angular.module('githelp.controllers',
  ['githelp.controllers.index',
  'githelp.controllers.navbar',
  'githelp.controllers.user',
  'githelp.controllers.appointment',
  'githelp.controllers.messages',
  'githelp.controllers.booking',
  'githelp.controllers.repos'
  ]);

angular.module('githelp.services',
  ['githelp.services.global',
  'githelp.services.user',
  'githelp.services.messages',
  'githelp.services.inboxes'
  ]);

