angular.module('githelp.services.socks', [])
.factory('Socks', [
  function() {
    var sockRobot = function(sockType, id){
      this.sockType = sockType;
      this.id = id;
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
      // i do need to key by id because a single user can go to multiple different chatrooms
      // i can just index by id actually because each id is completely unique
      sockType_map[this.id] = this;
      if (sockjs_status === 'disconnected') {
        sockjs_status = 'connecting';

        sockjs = new SockJS('/echo');
        sockjs.onmessage = function (e) {
          console.log("received a message");
          if (e.type != "message") return;
          var msg = JSON.parse(e.data);
          var self = sockType_map[msg.id];
          if (!self) throw "No such sockType";
          var method = self['event_' + msg.event];
            // method will equal a function, when this runs everything that is supposed to be
            // real time should run here (variable assignments and what not);
            // i could use self['name of event'] like appointments, inbox, text editor
          if (!method) throw "No such event: " + msg.event;
          console.log("hello!")
          method.call(self, msg.data);
        }
        sockjs.onopen = function () {
          sockjs_status = 'connected';
          for (var i=0; i<pending.length; i++) {
            pending[i].start();
          }
          pending = [];
        }
        sockjs.onclose = function (e) {
          sockjs_status = 'disconnected';
          if (e.type != "message") return sockjs_status;
          // i need to make sure i delete the connections one things close
          // this probably needs to be done when i close the sock, sockjs.onclose is what happens
          // after i have closed the sock, here i check if there is a message, if there is none, i just return
          // if there is a message i want to run the event that i passed in
          // in the case of the timer i want to trigger a bunch of things
          // for example i want to the stop the timer from ticking and i want to send data back to the server
        }
        pending.push(this);
      }
      else if (sockjs_status === 'connecting') {
        pending.push(this);
      }
      else if (sockjs_status === 'connected') {
        this.start();
      }
    }

    sockRobot.prototype.start = function () {
      this.sockjs_send("StartRobot", this.robot_data);
    }

    sockRobot.prototype.sockjs_send = function (event, data) {
      console.log("this is the id", this.id);
      sockjs.send(JSON.stringify({id: this.id, sockType: this.sockType, event: event, data: data}));
    }

    sockRobot.prototype.close = function (data) {
      this.sockjs_send("StopRobot", data);
    }

    return sockRobot;
  }
]);
