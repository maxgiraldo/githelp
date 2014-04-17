angular.module('githelp.services.socks', []).factory('Socks', [
  function() {
    var sockRobot = function(sockType){
      this.type = sockType;
    };

/*
whatever i want to happen to everyone needs to be within onopen

i need to define specific function based on events ('event_message') format

this way i don't have to define everything that happens

msg.data should be everything that i need.

*/

    var sockType_map = {};
    var sockjs = null;
    var sockjs_status = 'disconnected';
    var pending = [];
    sockRobot.prototype.init = function () {
      sockType_map[this.sockType] = {};
      if (sockjs_status === 'disconnected') {
        sockjs_status = 'connecting';

        sockjs = new SockJS(app.robotServer + "/echo");
        sockjs.onmessage = function (e) {
          if (e.type != "message") return;
          var msg = JSON.parse(e.data);
          var self = sockType_map[msg.sockType];
          if (!self) throw "No such sockType";
          var method = self['event_' + msg.event];
            // method will equal a function, when this runs everything that is supposed to be
            // real time should run here (variable assignments and what not);
            // i could use self['name of event'] like appointments, inbox, text editor
          if (!method) throw "No such event: " + msg.event;
          method.call(self, msg.data);
        }
        sockjs.onopen = function () {
          sockjs_status = 'connected';
          for (var i=0; i<pending.length; i++) {
            pending[i].run();
          }
          pending = [];
        }
        sockjs.onclose = function () {
          sockjs_status = 'disconnected';
        }
        pending.push(self);
      }
      else if (sockjs_status === 'connecting') {
        pending.push(self);
      }
      else if (sockjs_status === 'connected') {
        self.run();
      }
    }

    sockRobot.prototype.run = function () {
      this.sockjs_send("StartRobot", this.robot_data);
    }

    sockRobot.prototype.sockjs_send = function (event, data) {
      sockjs.send(JSON.stringify({}));
    }


    return sockRobot;
  }
]);
