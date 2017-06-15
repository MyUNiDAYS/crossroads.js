/*jshint onevar:false */

//for node
var crossroads = crossroads || require('../../../dist/crossroads');
//end node



describe('Route.dispose()', function(){

    afterEach(function(){
        crossroads.removeAllRoutes();
    });


    it('should dispose route', function(){
        var count = 0;

        var a = crossroads.addRoute('{foo}/{bar}');

        var parse1 = crossroads.parse('foo/bar');
        a.dispose();
		
        var parse2 = crossroads.parse('dolor/amet');
        expect( parse2 ).toBeNull();
    });

});
