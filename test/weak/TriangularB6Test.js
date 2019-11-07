#!/usr/bin/env node 

const fs = require( 'fs' );
const jpeg = require('jpeg-js');
const util = require('util');


const bresenham6d = require( '../../src/weak/Bresenham6d' );
const TriangularB6 = require( '../../src/weak/TriangularB6' );
const CanvasHack = require( '../common/CanvasHack' );

const TriangularB6Test = function() {
	const self = this;

	self.vertex = function( x, y, z ) {
		return { value:[ [x],[y],[z] ] };
	};

	self.point = function( s, t, x, y, z ) {
		return { s:s, t:t, vertex:self.vertex( x, y, z ) };
	};

	self.main = function( args ) {
		let canvas = CanvasHack.create( 1024, 1024 );
		let tb6 = new TriangularB6( canvas );
		tb6.clear();

		let q = 0.1;
		q = 0;
		q = Math.sqrt(2)/2;
		q = 0.2;

		let u = 1;

		let f = 2.0;
		q *= f;
		u *= f;

		let point1 = self.point( 0, 0,   -u, +q, +u );
		let point2 = self.point( 1, 0,   +u, +q, +u );
		let point3 = self.point( 0, 1,    0, -q,  0 );

		let texture = self.makeTexture( canvas );

		self.split( tb6, texture, point1, point2, point3, 1 );

		canvas.saveToJpg( jpeg, 'tb6.jpg' );
		console.log( 'ok' );
	};

	self.split = function( tb6, texture, point1, point2, point3, level, theQ ) {
		let max = 1;
		max = 8;

		if ( level > max ) { 
			//console.log( 'let us draw a triangle at level ' + level ); 
			self.drawTriangle( tb6, texture, point1, point2, point3 );
		} else {
			if ( Math.random() < -0.02 ) { 
				self.triangleSplit1( tb6, texture, point1, point2, point3, level, theQ );
			} else {
				self.triangleSplit2( tb6, texture, point1, point2, point3, level, theQ );
			}
		}
	}

	/**
	 *
	 * this takes the midpoint on the triangle and moves it up or down 
	 *
	 *       ^                     ^
	 *      / \                   /|\
	 *     /   \                 / | \
	 *    /     \      --->     /  |  \
	 *   /       \             /   x   \
	 *  /         \           / .'   `. \
	 * `___________'         `/_________\'
	 *
	 */
	self.triangleSplit1 = function( tb6, texture, point1, point2, point3, level, theQ ) {
		let points = [ point1, point2, point3 ];
		let pointz = [];
		let midPoint = [0,0,0];
		let s = 0;
		let t = 0;
		for ( let i = 0 ; i < points.length ; i++ ) {
			let point = points[ i ];
			pointz[ i ] = [];
			for ( let j = 0 ; j < 3 ; j++ ) {
				pointz[ j ] = point.vertex.value[ j ][ 0 ];
				midPoint[ j ] += pointz[ j ] / 3;
			}
			s += point.s;
			t += point.t 
		}
		s /= 3;
		t /= 3;

		let normal = self.xyzzy( point1, point2, point3 );
		//normal.value = [[0],[-1],[0]];
		self.log( 'at level', level, 'normal is', normal.value );

		let nu = [];

		let qzar = 0.1 + 0.2 * Math.random();
		qzar = 0.3 + 0.7 * Math.random();
		if ( Math.random() < 0.33 ) {
			qzar = -qzar;
		}

		let q = theQ || qzar;

		q /= ( level * level ); // exponential decay

		for ( let j = 0 ; j < 3 ; j++ ) {
			nu[ j ] = midPoint[ j ] + normal.value[ j ][ 0 ] * q;
		}

		let nuPoint = self.point( s, t, nu[ 0 ], nu[ 1 ], nu[ 2 ] );

		self.split( tb6, texture, point1, point2, nuPoint, level + 1, theQ );
		self.split( tb6, texture, point2, point3, nuPoint, level + 1, theQ );
		self.split( tb6, texture, point3, point1, nuPoint, level + 1, theQ );
	}

	/**
	 *
	 * this takes the midpoints of the edges and moves them up or down 
	 *    
	 *         1                      1
	 *         ^                      ^       
	 *        / \                    / \      
	 *       /   \                  / a \     
	 *      /     \      --->     2x-----x0
	 *     /       \              / \ d / \   
	 *    /         \            / c \ / b \  
	 *   `___________'          `_____x_____' 
	 *  3             2        3      1      2
	 *
	 */
	self.triangleSplit2 = function( tb6, texture, point1, point2, point3, level, theQ ) {
		theQ = theQ || {uid:33}

		let q = 0.8 / ( level * level );
		let points = [ point1, point2, point3 ];
		let midpoints = [];

		for ( let i = 0 ; i < points.length ; i++ ) {
			let point = points[ i ];
			if ( !( 'id' in point ) ) {
				point.id = theQ.uid++;
			}
		}
		
		for ( let i = 0 ; i < points.length ; i++ ) {
			let point = points[ i ];
			let next = points[ ( i + 1 ) % points.length ];

			let key = point.id + 'x' + next.id;
			if ( key in theQ ) {
				let midpoint = theQ[ key ];
				//self.log( 'q hit:', midpoint.vertex.value );
				midpoints.push( midpoint );
				continue;
			} 

			let from = self.from( point, next );
			let s = point.s + 0.5 * ( next.s - point.s )
			let t = point.t + 0.5 * ( next.t - point.t )
			let x = point.vertex.value[ 0 ][ 0 ] + from[ 0 ] * 0.5;
			let y = point.vertex.value[ 1 ][ 0 ] + from[ 1 ] * 0.5;
			let z = point.vertex.value[ 2 ][ 0 ] + from[ 2 ] * 0.5;

			y += q * Math.random() - q * Math.random();
			
			let midpoint = self.point( s, t, x, y, z );
			//self.log( point.vertex.value, 'to', next.vertex.value, 'midpoint is', midpoint.vertex.value );
			midpoints.push( midpoint );

			theQ[ key ] = midpoint;
		}
			
		self.split( tb6, texture, point1, midpoints[ 0 ], midpoints[ 2 ], level + 1 ); // a
		self.split( tb6, texture, midpoints[ 0 ], point2, midpoints[ 1 ], level + 1 ); // b
		self.split( tb6, texture, midpoints[ 1 ], point3, midpoints[ 2 ], level + 1 ); // c
		self.split( tb6, texture, midpoints[ 0 ], midpoints[ 1 ], midpoints[ 2 ], level + 1 ); // d
	};

	self.drawTriangle = function( tb6, texture, point1, point2, point3 ) {
		let normal = self.xyzzy( point1, point2, point3 );
		//if ( normal.value[ 2 ][ 0 ] < 0 ) return;

		let min = 0.02;
		for ( let i = 0 ; i < normal.value.length ; i++ ) {
			if ( min > normal.value[ i ][ 0 ] ) {
				normal.value[ i ][ 0 ] = min;
			}
		}

		// brighten things up a bit...
		if ( false ) {
			let brighten = 0.4; // should be less that 0.5, closer to zero is brighter
			normal.value[ 0 ][ 0 ] = Math.pow( normal.value[ 0 ][ 0 ], brighten );
			normal.value[ 1 ][ 0 ] = Math.pow( normal.value[ 1 ][ 0 ], brighten );
			normal.value[ 2 ][ 0 ] = Math.pow( normal.value[ 2 ][ 0 ], brighten );
		}

		//normal.value[ 0 ][ 0 ] = normal.value[ 1 ][ 0 ] = normal.value[ 2 ][ 0 ] = 1;
		
		point1.normal = point2.normal = point3.normal = normal;

		let tmp = self.vertex( 1,1,1 );
		normal = point1.normal = point2.normal = point3.normal = tmp;
		
		tb6.jack( point1, point2, point3, normal, texture );
	};

	self.xyzzy = function( point1, point2, point3 ) {
		let x = 0;
		let y = 1;
		let z = 2;
		let a = self.normallyFrom( point2, point1 );
		let b = self.normallyFrom( point2, point3 );
		let crossed = self.normalize(
			  ( a[y] * b[z] ) - ( a[z] * b[y] )  // x=yzzy
			, ( a[z] * b[x] ) - ( a[x] * b[z] )  // y=zxxz
			, ( a[x] * b[y] ) - ( a[y] * b[x] )  // z=xyyx
		);
		return self.vertex( crossed[ x ], crossed[ y ], crossed[ z ] );
	};

	self.normallyFrom = function( start, stop ) {
		let from = self.from( start, stop );
		return self.normalize( from[ 0 ], from[ 1 ], from[ 2 ] );
	};

	self.from = function( start, stop ) {
		return [
			  stop.vertex.value[ 0 ][ 0 ] - start.vertex.value[ 0 ][ 0 ]
			, stop.vertex.value[ 1 ][ 0 ] - start.vertex.value[ 1 ][ 0 ]
			, stop.vertex.value[ 2 ][ 0 ] - start.vertex.value[ 2 ][ 0 ]
		]
	};

	self.normalize = function( x, y, z ) {
		let s = ( x * x ) + ( y * y ) + ( z * z );
		if ( 0 === s ) {
			s = 1;
		} else {
			s = Math.sqrt( s );
		}

		let normalized = [ x/s, y/s, z/s ];
		return normalized;
	};

	self.makeTexture = function( canvas ) {
		if ( false ) {
			let texture = canvas.makeImageData(2,2);
			let i = 0;
			texture.data[i++] = 255; texture.data[i++] =   0; texture.data[i++] =   0; texture.data[i++] = 255;
			texture.data[i++] =   0; texture.data[i++] = 255; texture.data[i++] =   0; texture.data[i++] = 255;
			texture.data[i++] =   0; texture.data[i++] =   0; texture.data[i++] = 255; texture.data[i++] = 255;
			texture.data[i++] =   0; texture.data[i++] = 255; texture.data[i++] = 255; texture.data[i++] = 255;
			return texture;
		}

		let n = 256;
		let texture = canvas.makeImageData( n, n );

		let index = 0;
		let color_increment = 255 / n;
		let r = 0;
		let b = 128
		for ( let y = 0 ; y < n ; y++, r += color_increment ) {
			let g = 0;
			for ( let x = 0 ; x < n ; x++, g += color_increment ) {
				texture.data[ index++ ] = r;
				texture.data[ index++ ] = g;
				texture.data[ index++ ] = b;
				texture.data[ index++ ] = 255;
			}
		}

		if ( false ) {
			let rawImageData = { data:texture.data, width:n, height:n }
			let jpegImageData = jpeg.encode( rawImageData, 50 );
			fs.writeFile( 'texture.jpg', jpegImageData.data, function(){} );
		}

		return texture;
	}

	self.log = function() {
		let s = '';
		let q = '';
		for ( let i in arguments ) {
			s += q + self.appendix( arguments[ i ] );
			q = ' ';
		}
		console.log( s );
	};

	self.appendix = function( lulz ) {
		let s = '';
		
		let type = typeof( lulz );
		if ( util.isArray( lulz ) ) {
			type = 'array';
		}

		switch ( type ) {
			case 'object':
				s = '{';
				let luld = false;
				for ( let i in lulz ) {
					s += ( luld ? ', ' : ' ' ) +  i + ':' + self.appendix( lulz[ i ] );
					luld = true;

				}
				if ( luld ) s +=  ' '; 
				s += '}';
				break;
			case 'array':
				s = '[';
				for ( let i = 0 ; i < lulz.length ; i++ ) {
					s += ( i ? ', ' : ' ' ) + self.appendix( lulz[ i ] );
				}
				if ( lulz.length ) s += ' ';
				s += ']';
				break;
			case 'number':
				if ( Number.isInteger( lulz ) ) {
					if ( lulz < 0 ) { 
						return lulz;
					} else {
						return '+' + lulz;
					}
				} 
				let precision = 1000;
				lulz = Math.floor( precision * lulz ) / precision;
				if ( lulz < 0 ) {
					s = lulz;
				} else {
					s = '+' + lulz;
				}
				break;
			case 'string':
				s = lulz;
				break;
			default:
				console.log( 'idk:' + type );
				return lulz;
		};
		return s;
	}
};

new TriangularB6Test().main( process.argv.slice( 2 ) );
