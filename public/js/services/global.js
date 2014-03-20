angular.module('githelp.services.global', []).factory('Global', [
    function() {
        var _this = this;
        _this._data = {
            user: window.user,
            location: location,
            authenticated: !! window.user
        };

        return _this._data;
    }
]);
