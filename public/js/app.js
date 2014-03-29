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
<<<<<<< HEAD
  'githelp.controllers.datePicker',
  'githelp.controllers.timePicker'
=======
  'githelp.controllers.repos'
>>>>>>> 77f9523c849bd59ec9062f061d84ed8f006bf5e3
  ]);

angular.module('githelp.services',
  ['githelp.services.global',
  'githelp.services.user',
  'githelp.services.messages',
  'githelp.services.inboxes'
  ]);

