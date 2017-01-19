#!/usr/bin/env node 

const Matrix = require( '../../src/util/Matrix' );

const MatrixTest = function() {
	const self = this;

	self.main = function( args ) {
		console.log( 'hello MatrixTest' );

		var matrix = new Matrix();
		var m1, m2, rz;


		matrix.common();

		console.log( '-----------' );

		m1 = [ ['x'] ,['y'] ,['z'] ];
		m2 = [ ['a','b','c'] ];
		rz = matrix.writeMultiplication( m1, m2 );
		self.symbolic( rz, m1, m2 );
		
		m1 = [ ['a','b','c'] ];
		m2 = [ ['x'] ,['y'] ,['z'] ];
		rz = matrix.writeMultiplication( m1, m2 );
		self.symbolic( rz, m1, m2 );

		m1 = [ ['a','b','c'] ];
		m2 = [ ['x'] ,['y'] ,['z'] ];
		rz = matrix.writeMultiplication( m1, m2 );
		self.symbolic( rz, m1, m2 );

		m1 = [ ['a','b'] , ['c','d'] ];
		m2 = [ ['x','y'] , ['z','q'] ];
		rz = matrix.writeMultiplication( m1, m2 );
		self.symbolic( rz, m1, m2 );

		m1 = [ ['a','b','c'] ];           //  1x3    = n × m , n = 1, m = 3
		m2 = [ ['x'] ,['y'] ,['z'] ];     //  3x1    = m × p , m = 3, p = 1 --> n × p = 1 x 1
		rz = matrix.writeMultiplication( m1, m2 );
		self.symbolic( rz, m1, m2 );

		///
		console.log( matrix.multiply( [[1,2,3]] , [[4],[5],[6]]) );
		console.log( matrix.typedMultiply( '1x3 * 3x1', [[1,2,3]] , [[4],[5],[6]]) );

		console.log( 'point:' + matrix.rotatePoint( 1,0,0, 0,Math.PI/2,0 ) );
	};

	self.symbolic = function ( rz, m1, m2 ) {
		console.log( rz );
		rz = self.symbolicReplace( rz, m1, 'm1' );
		rz = self.symbolicReplace( rz, m2, 'm2' );
		console.log( rz );
		console.log( '-----------' );
	}

	self.symbolicReplace = function( rz, m, l ) {
		for ( var i = 0 ; i < m.length ; i++ ) {

			var row = m[ i ];
			for ( var j = 0 ; j < row.length ; j++ ) {
				var s = l + '\\[' + i + '\\]\\[' + j + '\\]';
				var x = new RegExp( s, 'gm' );
				rz = rz.replace( x, m[i][j] );
			}
		}
		return rz;
	};
};

new MatrixTest().main( process.argv.slice( 2 ) );
