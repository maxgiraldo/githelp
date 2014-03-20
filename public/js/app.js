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
  ['githelp.controllers.index'
  ]);

angular.module('githelp.services',
  ['githelp.services.global'
  ]);

