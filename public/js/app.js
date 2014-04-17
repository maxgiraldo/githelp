window.app = angular.module('githelp',
  ['ngCookies',
  'ngResource',
  'ui.bootstrap',
  'ui.route',
  'ui.router',
  'ui.select2',
  'githelp.controllers',
  'githelp.services',
  'githelp.directives',
  'firebase',
  'angularFileUpload'
  ]).constant('FIREBASE_URL', 'https://githelp.firebaseio.com/');

angular.module('githelp.controllers',
  ['githelp.controllers.index',
  'githelp.controllers.navbar',
  'githelp.controllers.user',
  'githelp.controllers.appointment',
  'githelp.controllers.messages',
  'githelp.controllers.booking',
  'githelp.controllers.datePicker',
  'githelp.controllers.timePicker',
  'githelp.controllers.repos',
  'githelp.controllers.texteditor',
  'githelp.controllers.login',
  'githelp.controllers.modal'
  ]);

angular.module('githelp.services',
  ['githelp.services.global',
  'githelp.services.user',
  'githelp.services.messages',
  'githelp.services.inboxes',
  'githelp.services.appointments',
  'githelp.services.auth',
  'githelp.services.url',
  'githelp.services.login',
  'githelp.services.socks'
  ]);

angular.module('githelp.directives',
  ['githelp.directives.fileinput',
  'githelp.directives.editInPlace',
  'githelp.directives.initFocus',
  'githelp.directives.enterPress',
  'githelp.directives.autoSubmit'
  ]);
