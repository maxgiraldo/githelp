window.app = angular.module('githelp',
  ['ngCookies',
  'ngResource',
  'ui.bootstrap',
  'ui.route',
  'ui.router',
  'githelp.controllers',
  'githelp.services'
  ]);

angular.module('githelp.controllers',
  ['githelp.controllers.index',
  'githelp.controllers.navbar',
  'githelp.controllers.user'
  ]);

angular.module('githelp.services',
  ['githelp.services.global',
  'githelp.services.user'
  ]);

