
    // Crossroads --------
    //====================

    /**
     * @constructor
     */
    function Crossroads() {
        this._routes = [];
    }

    Crossroads.prototype = {

        ignoreCase : true,

        shouldTypecast : false,

        normalizeFn : null,

        create : function () {
            return new Crossroads();
        },

        addRoute : function (pattern, data, priority) {
            var route = new Route(pattern, data, priority, this);
            this._sortedInsert(route);
            return route;
        },

        removeRoute : function (route) {
            arrayRemove(this._routes, route);
            route._destroy();
        },

        removeAllRoutes : function () {
            var n = this.getNumRoutes();
            while (n--) {
                this._routes[n]._destroy();
            }
            this._routes.length = 0;
        },

        parse : function (request) {
            return this._getMatchedRoute(request);
        },

        getNumRoutes : function () {
            return this._routes.length;
        },

        _sortedInsert : function (route) {
            //simplified insertion sort
            var routes = this._routes,
                n = routes.length;
            do { --n; } while (routes[n] && route._priority <= routes[n]._priority);
            routes.splice(n+1, 0, route);
        },

        _getMatchedRoute : function (request) {
            var routes = this._routes,
                n = routes.length,
                route;
            //should be decrement loop since higher priorities are added at the end of array
            while (route = routes[--n]) {
                if (route.match(request)) {
                    return {
                        route : route,
                        params : route._getParamsArray(request)
                    };
                }
            }
            return null;
        },

        toString : function () {
            return '[crossroads numRoutes:'+ this.getNumRoutes() +']';
        }
    };

    //"static" instance
    crossroads = new Crossroads();
    crossroads.VERSION = '::VERSION_NUMBER::';

    crossroads.NORM_AS_ARRAY = function (req, vals) {
        return [vals.vals_];
    };

    crossroads.NORM_AS_OBJECT = function (req, vals) {
        return [vals];
    };
