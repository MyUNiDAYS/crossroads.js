/*jshint onevar:false */

//for node
var crossroads = crossroads || require('../../../dist/crossroads');
//end node



describe('crossroads.create()', function(){

    afterEach(function(){
        crossroads.removeAllRoutes();
    });


    describe('new Router instance', function(){

        it('should work in new instances', function(){
            var cr = crossroads.create();

            cr.addRoute('/{foo}');
            var parse1 = cr.parse('/lorem_ipsum');

            expect( parse1.params[0] ).toBe( 'lorem_ipsum' );
        });


        it('shouldn\'t affect static instance', function(){
            var cr = crossroads.create();

            var a = cr.addRoute('/{foo}');
            var b = crossroads.addRoute('/{foo}');
            
			var t1 = cr.parse('/lorem_ipsum');

            expect( t1.route ).toBe( a );
        });


        it('shouldn\'t be affected by static instance', function(){
            var cr = crossroads.create();

            var a = crossroads.addRoute('/{foo}');
            var b = cr.addRoute('/{foo}');
			
            var parse1 = crossroads.parse('/lorem_ipsum');

            expect( parse1.route ).toBe( a );
        });


        it('should allow a different lexer per router', function () {
            var cr = crossroads.create();
            var count = 0;
            cr.patternLexer = {
                getParamIds : function(){
                    return ['a','b'];
                },
                getOptionalParamsIds : function(){
                    return [];
                },
                getParamValues : function(){
                    return [123, 456];
                },
                compilePattern : function(){
                    return (/foo-bar/);
                }
            };
            var vals = [];
            var inc = function(a, b){
                vals[0] = a;
                vals[1] = b;
                count++;
            };
			
            cr.addRoute('test', inc);
            
			var parse1 = cr.parse('foo-bar');
            
            expect( parse1.params[0] ).toEqual( 123 );
            expect( parse1.params[1] ).toEqual( 456 );
			
            expect( cr.patternLexer ).not.toBe( crossroads.patternLexer );
        });


    });

});
