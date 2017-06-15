/*jshint onevar:false */

//for node
var crossroads = crossroads || require('../../../dist/crossroads');
//end node



describe('crossroads.toString() and route.toString()', function(){

    beforeEach(function(){
        crossroads.removeAllRoutes();
    });



    describe('crossroads.removeRoute()', function(){

        it('should remove by reference', function(){
            var a = crossroads.addRoute('/{foo}_{bar}');
            crossroads.parse('/lorem_ipsum');
            crossroads.removeRoute(a);
            var result = crossroads.parse('/foo_bar');
            expect( result ).toBeNull();
        });

    });



    describe('crossroads.removeAll()', function(){

        it('should removeAll', function(){
            var a = crossroads.addRoute('/{foo}/{bar}');
            var b = crossroads.addRoute('/{foo}_{bar}');
            expect( crossroads.getNumRoutes() ).toBe( 2 );

            crossroads.removeAllRoutes();

            expect( crossroads.getNumRoutes() ).toBe( 0 );

            var t1 = crossroads.parse('/lorem/ipsum');
            var t2 = crossroads.parse('/foo_bar');

            expect( t1 ).toBeNull();
            expect( t2 ).toBeNull();
        });

    });


});
