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
  ]);
