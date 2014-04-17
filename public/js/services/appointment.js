angular.module('githelp.services.appointments', [])
  .factory('Appointment', ['$resource', function($resource){
      return $resource('appointment/:appointmentId',{
        appointmentId: '@_id'
      }, {
          update: {
            method: 'PUT'
          }
        });
      }
  ])
  .factory('ConfirmedAppt', [function() {
    return {
      find: function(apptObj) {
        for (var option in apptObj.date) {
          if(apptObj.date[option].confirmed) {
            console.log('confirmed Date', apptObj.date[option].date);
            return apptObj.date[option].date;
          }
        }
      }
    };
  }]);
