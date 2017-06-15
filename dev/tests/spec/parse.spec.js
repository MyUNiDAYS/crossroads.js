/*jshint onevar:false */

//for node
var crossroads = crossroads || require('../../../dist/crossroads');
//end node


describe('crossroads.parse()', function(){
    var _prevTypecast;


    beforeEach(function(){
        _prevTypecast = crossroads.shouldTypecast;
    });


    afterEach(function(){
        crossroads.removeAllRoutes();
        crossroads.shouldTypecast = _prevTypecast;
    });


    // ---


    describe('simple string route', function(){

        it('shold route basic strings', function(){

            crossroads.addRoute('/foo');
			
            expect( crossroads.parse('/bar') ).toBeDefined();
            expect( crossroads.parse('/foo') ).toBeDefined();
			expect( crossroads.parse('foo') ).toBeNull();
			
        });

        it('should pass params and allow multiple routes', function(){
            
            crossroads.addRoute('/{foo}');
            crossroads.addRoute('/{foo}/{bar}');
            
			var parse1 = crossroads.parse('/lorem_ipsum')
			expect( parse1.params[0] ).toBe( 'lorem_ipsum' );
            
			var parse2 = crossroads.parse('/maecennas/ullamcor');
			expect( parse2.params[0] ).toBe( 'maecennas' );
			expect( parse2.params[1] ).toBe( 'ullamcor' );
        });

        it('should handle a word separator that isn\'t necessarily /', function(){

            var a = crossroads.addRoute('/{foo}_{bar}');
            var b = crossroads.addRoute('/{foo}-{bar}');
            
            var t1 = crossroads.parse('/lorem_ipsum');
            var t2 = crossroads.parse('/maecennas-ullamcor');

            expect( t1.params[0] ).toBe( 'lorem' );
            expect( t1.params[1] ).toBe( 'ipsum' );
            expect( t2.params[0] ).toBe( 'maecennas' );
            expect( t2.params[1] ).toBe( 'ullamcor' );
        });

        it('should handle empty routes', function(){
            var a = crossroads.addRoute();

            var t1 = crossroads.parse('/123/456');
            var t2 = crossroads.parse('/maecennas/ullamcor');
            var t3 = crossroads.parse('');

            expect( t1 ).toBeNull();
            expect( t2 ).toBeNull();
            expect( t3 ).toBeDefined();
        });

        it('should handle empty strings', function(){
            var a = crossroads.addRoute('');

            var t1 = crossroads.parse('/123/456');
            var t2 = crossroads.parse('/maecennas/ullamcor');
            var t3 = crossroads.parse('');

            expect( t1 ).toBeNull();
            expect( t2 ).toBeNull();
            expect( t3 ).toBeDefined();
        });
    });



    describe('optional params', function(){

        it('should capture optional params', function(){
            crossroads.addRoute('foo/:lorem:/:ipsum:/:dolor:/:sit:');

            var t1 = crossroads.parse('foo/lorem/123/true/false');
            expect( t1.params[0] ).toBe( 'lorem' );
            expect( t1.params[1] ).toBe( '123' );
            expect( t1.params[2] ).toBe( 'true' );
            expect( t1.params[3] ).toBe( 'false' );
        });

        it('should only pass matched params', function(){

            crossroads.addRoute('foo/:lorem:/:ipsum:/:dolor:/:sit:');
            var t1 = crossroads.parse('foo/lorem/123');

            expect( t1.params[0] ).toBe( 'lorem' );
            expect( t1.params[1] ).toBe( '123' );
            expect( t1.params[2] ).toBeUndefined();
            expect( t1.params[3] ).toBeUndefined();
        });

    });



    describe('regex route', function(){

        it('should capture groups', function(){
            crossroads.addRoute(/^\/[0-9]+\/([0-9]+)$/); //capturing groups becomes params

            var t1 = crossroads.parse('/123/456');
            expect( t1.params[0] ).toBe( '456' );
            expect( t1.params[1] ).toBeUndefined();

            var t2 = crossroads.parse('/maecennas/ullamcor');
            expect( t2 ).toBeNull();
        });

        it('should capture even empty groups', function(){
            crossroads.addRoute(/^\/()\/([0-9]+)$/); //capturing groups becomes params

            var t1 = crossroads.parse('//456');
            expect( t1.params[0] ).toBe( '' );
            expect( t1.params[1] ).toBe( '456' );
        });
    });



    describe('typecast values', function(){

        it('should typecast values if shouldTypecast is set to true', function(){
            crossroads.shouldTypecast = true;

            crossroads.addRoute('{a}/{b}/{c}/{d}/{e}/{f}');

            var t1 = crossroads.parse('lorem/123/true/false/null/undefined');
			
			expect( t1.params[0] ).toBe( 'lorem' );
			expect( t1.params[1] ).toBe( 123 );
			expect( t1.params[2] ).toBe( true );
			expect( t1.params[3] ).toBe( false );
			expect( t1.params[4] ).toBe( null );
			expect( t1.params[5] ).toBe( undefined );
		
        });

        it('should not typecast if shouldTypecast is set to false', function(){
            crossroads.shouldTypecast = false;

            crossroads.addRoute('{lorem}/{ipsum}/{dolor}/{sit}');
            var t1 = crossroads.parse('lorem/123/true/false');
			
			expect( t1.params[0] ).toBe( 'lorem' );
			expect( t1.params[1] ).toBe( '123' );
			expect( t1.params[2] ).toBe( 'true' );
			expect( t1.params[3] ).toBe( 'false' );
            
        });

    });


    describe('rules.normalize_', function(){

        it('should normalize params before dispatching signal', function(){

            //based on: https://github.com/millermedeiros/crossroads.js/issues/21

            var myRoute = crossroads.addRoute('{a}/{b}/:c:/:d:');
            myRoute.rules = {
                a : ['news', 'article'],
                b : /[\-0-9a-zA-Z]+/,
                request_ : /\/[0-9]+\/|$/,
                normalize_ : function(request, vals){
                    var id;
                    var idRegex = /^[0-9]+$/;
                    if(vals.a === 'article'){
                        id = vals.c;
                    } else {
                    if( idRegex.test(vals.b) ){
                        id = vals.b;
                    } else if ( idRegex.test(vals.c) ) {
                        id = vals.c;
                    }
                    }
                    return ['news', id]; //return params
                }
            };
			
            var parse1 = crossroads.parse('news/111/lorem-ipsum');
            expect( parse1.params[0] ).toBe( 'news' );
            expect( parse1.params[1] ).toBe( '111' );

            var parse2 = crossroads.parse('news/foo/222/lorem-ipsum');
			expect( parse2.params[0] ).toBe( 'news' );
            expect( parse2.params[1] ).toBe( '222' );
			
            var parse3 = crossroads.parse('news/333');
            expect( parse3.params[0] ).toBe( 'news' );
            expect( parse3.params[1] ).toBe( '333' );

            var parse4 = crossroads.parse('article/news/444');
			expect( parse4.params[0] ).toBe( 'news' );
            expect( parse4.params[1] ).toBe( '444' );
            
        });

    });


    describe('crossroads.normalizeFn', function () {

        var prevNorm;

        beforeEach(function(){
            prevNorm = crossroads.normalizeFn;
        });

        afterEach(function() {
            crossroads.normalizeFn = prevNorm;
        });


        it('should work as a default normalize_', function () {

            var t1, t2, t3, t4, t5, t6, t7, t8;

            crossroads.normalizeFn = function(request, vals){
                var id;
                var idRegex = /^[0-9]+$/;
                if(vals.a === 'article'){
                    id = vals.c;
                } else {
                    if( idRegex.test(vals.b) ){
                        id = vals.b;
                    } else if ( idRegex.test(vals.c) ) {
                        id = vals.c;
                    }
                }
                return ['news', id]; //return params
            };

            var route1 = crossroads.addRoute('news/{b}/:c:/:d:');
            var parse1 = crossroads.parse('news/111/lorem-ipsum');
			
            expect( parse1.params[0] ).toBe( 'news' );
            expect( parse1.params[1] ).toBe( '111' );

            var route2 = crossroads.addRoute('{a}/{b}/:c:/:d:');
            route2.rules = {
                a : ['news', 'article'],
                b : /[\-0-9a-zA-Z]+/,
                request_ : /\/[0-9]+\/|$/,
                normalize_ : function (req, vals) {
                    return ['foo', vals.b];
                }
            };
			
            var parse2 = crossroads.parse('article/333');

            expect( parse2.params[0] ).toBe( 'foo' );
            expect( parse2.params[1] ).toBe( '333' );

        });


        it('should receive all values as an array on the special property `vals_`', function () {

            var t1, t2;

            crossroads.normalizeFn = function(request, vals){
                //convert params into an array..
                return [vals.vals_];
            };

            crossroads.addRoute('/{a}/{b}');
            crossroads.addRoute('/{a}');

            var t1 = crossroads.parse('/foo/bar');
            var t2 = crossroads.parse('/foo');
			
            expect( t1.params[0].join(';') ).toEqual( ['foo', 'bar'].join(';') );
            expect( t2.params[0].join(';') ).toEqual( ['foo'].join(';') );

        });

        describe('NORM_AS_ARRAY', function () {

            it('should pass array', function () {
                crossroads.normalizeFn = crossroads.NORM_AS_ARRAY;
                crossroads.addRoute('/{a}/{b}');
				
                var arg = crossroads.parse('/foo/bar').params[0];

                expect( {}.toString.call(arg) ).toEqual( '[object Array]' );
                expect( arg[0] ).toEqual( 'foo' );
                expect( arg[1] ).toEqual( 'bar' );
            });

        });

        describe('NORM_AS_OBJECT', function () {

            it('should pass object', function () {

                crossroads.normalizeFn = crossroads.NORM_AS_OBJECT;
                crossroads.addRoute('/{a}/{b}');
                
				var arg = crossroads.parse('/foo/bar').params[0];

                expect( arg.a ).toEqual( 'foo' );
                expect( arg.b ).toEqual( 'bar' );
            });

        });

        describe('normalizeFn = null', function () {

            it('should pass multiple args', function () {
                crossroads.normalizeFn = null;
                crossroads.addRoute('/{a}/{b}');
				
                var parse1 = crossroads.parse('/foo/bar');

                expect( parse1.params[0] ).toEqual( 'foo' );
                expect( parse1.params[1] ).toEqual( 'bar' );
            });

        });

    });


    describe('priority', function(){

        it('should enforce match order', function(){

            var a = crossroads.addRoute('/{foo}/{bar}');
            var b = crossroads.addRoute('/{foo}/{bar}', null, 1);
			
            var parse1 = crossroads.parse('/123/456');

            expect( parse1.route ).toBe( b );
        });

        it('shouldnt matter if there is a gap between priorities', function(){

            var a = crossroads.addRoute('/{foo}/{bar}', null, 4);

            var b = crossroads.addRoute('/{foo}/{bar}', null, 999);

            var parse1 = crossroads.parse('/123/456');

            expect( parse1.route ).toBe( b );
        });

    });


    describe('validate params before dispatch', function(){

        it('should ignore routes that don\'t validate', function(){
            var calls = '';

            var pattern = '{foo}-{bar}';

            var a = crossroads.addRoute(pattern);
            a.rules = {
                foo : /\w+/,
                bar : function(value, request, matches){
                    return request === 'lorem-123';
                }
            };

            var b = crossroads.addRoute(pattern);
            b.rules = {
                foo : ['123', '456', '567', '2'],
                bar : /ullamcor/
            };

            expect( crossroads.parse('45-ullamcor') ).toBeNull();
			
            var parse2 = crossroads.parse('123-ullamcor');
			expect( parse2.params[0] ).toBe( '123' );
			expect( parse2.params[1] ).toBe( 'ullamcor' );
			expect( parse2.route ).toBe( b );
				
            var parse3 = crossroads.parse('lorem-123');
			expect( parse3.params[0] ).toBe( 'lorem' );
			expect( parse3.params[1] ).toBe( '123' );
			expect( parse2.route ).toBe( a );
            
			expect( crossroads.parse('lorem-555') ).toBeNull();

        });

        it('should consider invalid rules as not matching', function(){
            var pattern = '{foo}-{bar}';

            var a = crossroads.addRoute(pattern);
            a.rules = {
                foo : 'lorem',
                bar : 123
            };

            var b = crossroads.addRoute(pattern);
            b.rules = {
                foo : false,
                bar : void(0)
            };

            expect( crossroads.parse('45-ullamcor') ).toBeNull();
            expect( crossroads.parse('lorem-123') ).toBeNull();
        });

    });


    describe('rest params', function () {

        it('should pass rest as a single argument', function () {

            var r = crossroads.addRoute('{a}/{b}/:c*:');
            r.rules = {
                a : ['news', 'article'],
                b : /[\-0-9a-zA-Z]+/,
                'c*' : ['foo/bar', 'edit', '123/456/789']
            };

            var parse1 = crossroads.parse('article/333');

            expect( parse1.params[0] ).toBe( 'article' );
            expect( parse1.params[1] ).toBe( '333' );
            expect( parse1.params[2] ).toBeUndefined();

            var parse2 = crossroads.parse('news/456/foo/bar');

            expect( parse2.params[0] ).toBe( 'news' );
            expect( parse2.params[1] ).toBe( '456' );
            expect( parse2.params[2] ).toBe( 'foo/bar' );

            var parse3 = crossroads.parse('news/456/123/aaa/bbb');

            expect( parse3 ).toBeNull();
        });

        it('should work in the middle of segment', function () {
            
            // since rest segment is greedy the last segment can't be optional
            var r = crossroads.addRoute('{a}/{b*}/{c}');
            r.rules = {
                a : ['news', 'article'],
                c : ['add', 'edit']
            };

            var parse1 = crossroads.parse('article/333/add');

            expect( parse1.params[0] ).toBe( 'article' );
            expect( parse1.params[1] ).toBe( '333' );
            expect( parse1.params[2] ).toBe( 'add' );

            var parse2 = crossroads.parse('news/456/foo/bar/edit');

            expect( parse2.params[0] ).toBe( 'news' );
            expect( parse2.params[1] ).toBe( '456/foo/bar' );
            expect( parse2.params[2] ).toBe( 'edit' );

            var parse3 = crossroads.parse('news/456/123/aaa/bbb');

            expect( parse3 ).toBeNull();
        });

        it('should handle multiple rest params even though they dont make sense', function() {

            var r = crossroads.addRoute('{a}/{b*}/{c*}/{d}');
            r.rules = {
                a : ['news', 'article']
            };
			
            var parse1 = crossroads.parse('news/456/foo/bar/this/the/end');
			expect( parse1.params[2] ).toBe( 'the' );
			expect( parse1.params[3] ).toBe( 'end' );
				
            var parse2 = crossroads.parse('news/456/foo/bar/this/is/crazy/long/the/end');
			expect( parse2.params[2] ).toBe( 'the' );
			expect( parse2.params[3] ).toBe( 'end' );
			
            var parse3 = crossroads.parse('article/weather/rain-tomorrow/the/end');
			expect( parse3.params[2] ).toBe( 'the' );
			expect( parse3.params[3] ).toBe( 'end' );

        });

    });

    describe('query string', function () {

        describe('old syntax', function () {
            it('should only parse query string if using special capturing group', function () {
                var r = crossroads.addRoute('{a}?{q}#{hash}');
				
                var parse1 = crossroads.parse('foo.php?foo=bar&lorem=123#bar');

                expect( parse1.params[0] ).toEqual( 'foo.php' );
                expect( parse1.params[1] ).toEqual( 'foo=bar&lorem=123' );
                expect( parse1.params[2] ).toEqual( 'bar' );
            });
        });

        describe('required query string after required segment', function () {
            it('should parse query string into an object and typecast vals', function () {
                crossroads.shouldTypecast = true;

                var r = crossroads.addRoute('{a}{?b}');
                
                var parse1 = crossroads.parse('foo.php?lorem=ipsum&asd=123==456==Foo&bar=false&baz=123');

                expect( parse1.params[0] ).toEqual( 'foo.php' );
                expect( parse1.params[1] ).toEqual( {lorem : 'ipsum', asd : '123==456==Foo', bar : false, baz : 123} );
            });
        });

        describe('required query string after optional segment', function () {
            it('should parse query string into an object and typecast vals', function () {
                crossroads.shouldTypecast = true;

                var r = crossroads.addRoute(':a:{?b}');
                var parse1 = crossroads.parse('foo.php?lorem=ipsum&asd=123&bar=false');

                expect( parse1.params[0] ).toEqual( 'foo.php' );
                expect( parse1.params[1] ).toEqual( {lorem : 'ipsum', asd : 123, bar : false} );

                var parse2 = crossroads.parse('?lorem=ipsum&asd=123');

                expect( parse2.params[0] ).toBeUndefined();
                expect( parse2.params[1] ).toEqual( {lorem : 'ipsum', asd : 123} );
            });
        });

        describe('optional query string after required segment', function () {
            it('should parse query string into an object and typecast vals', function () {
                crossroads.shouldTypecast = true;

                var r = crossroads.addRoute('{a}:?b:');
                
                var parse1 = crossroads.parse('foo.php?lorem=ipsum&asd=123&bar=false');

                expect( parse1.params[0] ).toEqual( 'foo.php' );
                expect( parse1.params[1] ).toEqual( {lorem : 'ipsum', asd : 123, bar : false} );

                var parse2 = crossroads.parse('bar.php');

                expect( parse2.params[0] ).toEqual( 'bar.php' );
                expect( parse2.params[1] ).toEqual( {} );
            });
        });

        describe('optional query string after optional segment', function () {
            it('should parse query string into an object and typecast vals', function () {
                crossroads.shouldTypecast = true;
                
                var r = crossroads.addRoute(':a::?b:');
                var parse1 = crossroads.parse('foo.php?lorem=ipsum&asd=123&bar=false');

                expect( parse1.params[0] ).toEqual( 'foo.php' );
                expect( parse1.params[1] ).toEqual( {lorem : 'ipsum', asd : 123, bar : false} );
				
                var parse2 = crossroads.parse('bar.php');

                expect( parse2.params[0] ).toEqual( 'bar.php' );
                expect( parse2.params[1] ).toEqual( {} );
            });
        });

        describe('optional query string after required segment without typecasting', function () {
            it('should parse query string into an object and not typecast vals', function () {
                var r = crossroads.addRoute('{a}:?b:');
				
                var parse1 = crossroads.parse('foo.php?lorem=ipsum&asd=123&bar=false');

                expect( parse1.params[0] ).toEqual( 'foo.php' );
                expect( parse1.params[1] ).toEqual( {lorem : 'ipsum', asd : '123', bar : 'false'} );
            });
        });

        describe('multiple query parameters with same name', function () {
            it('should parse values into an array', function () {
                var r = crossroads.addRoute('foo.php:?query:');

                var parse1 = crossroads.parse('foo.php?name=x&name=y');
                expect( parse1.params[0] ).toEqual( {name : ['x', 'y']} );

                var parse2 = crossroads.parse('foo.php?name=x&type=json&name=y&name=z');
                expect( parse2.params[0] ).toEqual( {name : ['x', 'y', 'z'], type : 'json'} );
            });
        });
    });


});
