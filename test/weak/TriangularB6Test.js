#!/usr/bin/env node 

const fs = require( 'fs' );
const jpeg = require('jpeg-js');
const util = require('util');


const bresenham6d = require( '../../src/weak/Bresenham6d' );
const TriangularB6 = require( '../../src/weak/TriangularB6' );
const CanvasHack = require( '../common/CanvasHack' );

const TriangularB6Test = function() {
	const self = this;
	self.width = 1024;
	self.height = 1024;
	
	self.random = function() {
		return Math.random();
		return 0.5;
	}

	self.main = function( args ) {
		let canvas = CanvasHack.create( self.width, self.height );
		let tb6 = new TriangularB6( canvas );
		tb6.clear();

		self.drawLameWater( tb6 );

		let q = 0.1;
		let u = 1;

		let f = 2.0;
		q *= f;
		u *= f;

		let point1 = self.vertex( -u, +q, +u,  0, 0, 1 );
		let point2 = self.vertex( +u, +q, +u,  1, 0, 0 );
		let point3 = self.vertex(  0, -q,  0,  0, 1, 0 );

		let texture = self.makeTexture( canvas );
		tb6.setTexture( texture );
		self.split( tb6, point1, point2, point3, 1 );
self.nasty( tb6 );

		// tried to draw water, without much luck...
		if ( false ) {
			tb6.setTexture( false );

			f = 2.0;
			q *= f;
			u *= f;

			point1 = self.vertex( -u, +q, -u,  0,0,255 );
			point2 = self.vertex( +u, +q, -u,  0,0,255 );
			point3 = self.vertex(  0, -q, 0,  0,0,255 );
			self.drawTriangle( tb6, point1, point2, point3 );
		}

		canvas.saveToJpg( jpeg, 'tb6.jpg' );
		console.log( 'ok' );
	};

	self.split = function( tb6, point1, point2, point3, level, theQ ) {
		let max = 1;
		max = 7;

		if ( level > max ) { 
			self.drawTriangle( tb6, point1, point2, point3 );
		} else {
			if ( self.random() < -0.10 ) { 
				self.triangleSplit1( tb6, point1, point2, point3, level, theQ );
			} else {
				self.triangleSplit2( tb6, point1, point2, point3, level, theQ );
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
	self.triangleSplit1 = function( tb6, point1, point2, point3, level, theQ ) {
		let midpoint = {
			  x: ( point1.x + point2.x + point3.x ) / 3
			, y: ( point1.y + point2.y + point3.y ) / 3
			, z: ( point1.z + point2.z + point3.z ) / 3
			, r: ( point1.r + point2.r + point3.r ) / 3
			, g: ( point1.g + point2.g + point3.g ) / 3
			, b: ( point1.b + point2.b + point3.b ) / 3
		}
			 
		let normal = self.xyzzy( point1, point2, point3 );
		self.log( 'at level', level, 'normal is', normal );

		let qzar = 0.1 + 0.2 * self.random();
		qzar = 0.3 + 0.7 * self.random();
		if ( self.random() < 0.33 ) {
			qzar = -qzar;
		}

		let q = theQ || qzar;

		q /= ( level * level ); // exponential decay

		let nu = {
			  x: midpoint.x + normal.x * q
			, y: midpoint.y + normal.y * q
			, z: midpoint.z + normal.z * q
		};

		self.split( tb6, point1, point2, nu, level + 1, theQ );
		self.split( tb6, point2, point3, nu, level + 1, theQ );
		self.split( tb6, point3, point1, nu, level + 1, theQ );
	}

	/**
	 *
	 * this takes the midpoints of the edges and moves them up or down 
	 *    
	 *         1                      1
	 *         ^                      ^       
	 *        / \                    / \      
	 *       /   \                  / a \     
	 *      /     \      --->    2 x-----x 0      0:midpt1
	 *     /       \              / \ d / \       1:midpt2
	 *    /         \            / c \ / b \      2:midpt3 
	 *   `___________'          `_____x_____' 
	 *  3             2        3      1      2
	 *
	 */
	self.cache = {uid:33,points:{},midpoints:{}}
	self.triangleSplit2 = function( tb6, point1, point2, point3, level ) {
		//self.drawTriangle( tb6, point1, point2, point3 );

		let q = 0.8 / ( level * level );
		let points = [ point1, point2, point3 ];
		let midpoints = [];

		let froms = [];
		
		for ( let i = 0 ; i < points.length ; i++ ) {
			let point = points[ i ];
			let next = points[ ( i + 1 ) % points.length ];

			let id1 = point.id;
			let id2 = next.id;

			if ( id2 < id1 ) {
				let tmp = id1;
				id1 = id2;
				id2 = tmp;
			}

			// moved just for debugging...
			let from = self.from( point, next );
			froms.push( from );

			let key = id1 + 'x' + id2;
			if ( !false ) { 
				if ( key in self.cache.midpoints ) {
					// this cache caused a lot of problems...
					midpoints.push( self.cache.midpoints[ key ] );
					continue;
				} 
			}

			let x = point.x + from.x * 0.5;
			let y = point.y + from.y * 0.5;
			let z = point.z + from.z * 0.5;
			let r = point.r + from.r * 0.5;
			let g = point.g + from.g * 0.5;
			let b = point.b + from.b * 0.5;

			let yi = q * self.random() - q * self.random();

			// doesn't help...
			//if ( key in theQ ) yi = theQ[ key ]; else theQ[ key ] = yi;

			y += yi;

			// doesn't help...
			//if ( key in theQ ) y = theQ[ key ]; else theQ[ key ] = y;
			
			let midpoint = self.vertex( x,y,z, r,g, b );
			self.cache.midpoints[ key ] = midpoint;
			//self.log( point, 'to', next, 'midpoint is', midpoint );
			midpoints.push( midpoint );

			//theQ[ key ] = midpoint;
		}

		let midpt1 = midpoints[ 0 ];
		let midpt2 = midpoints[ 1 ];
		let midpt3 = midpoints[ 2 ];
/*
t[ 0 ] =  pt1, mid1, mid3
t[ 1 ] = mid1,  pt2, mid2
t[ 2 ] = mid3, mid2,  pt3 ???
t[ 3 ] = mid1, mid2, mid3
*/
			
if( self.samesies( tb6, point1, midpt1, midpt3 ) ) console.log( 'samsies a' ); else
		self.split( tb6, point1, midpt1, midpt3, level + 1 ); // a

if( self.samesies( tb6, midpt1, point2, midpt2 ) ) console.log( 'samsies b' ); else
		self.split( tb6, midpt1, point2, midpt2, level + 1 ); // b

if( self.samesies( tb6, midpt2, point3, midpt3 ) ) console.log( 'samsies c' ); else
		self.split( tb6, midpt3, midpt2, point3, level + 1 ); // c ???
		//self.split( tb6, midpt2, point3, midpt3, level + 1 ); // c

if( self.samesies( tb6, midpt1, midpt2, midpt3 ) ) {
	console.log( 'samsies d' ); 
	self.log( 'bonner.1_', point1 )
	self.log( 'bonner.1>', midpt1 )
	self.log( 'bonner.2-', point2 );
	self.log( 'bonner.2>', midpt2 );
	self.log( 'bonner.3_', point3 );
	self.log( 'bonner.3>', midpt3 );
	self.log( 'bonner.1_', point1 )
	self.log( 'bonner................................^^^' )
} else {
		self.split( tb6, midpt1, midpt2, midpt3, level + 1 ); // d
}
	};

	self.samesies = function( tb6, point1, point2, point3 ) {
		let s1 = self.appendix( point1 )
		let s2 = self.appendix( point2 );
		let s3 = self.appendix( point3 );
		let same = ( s1 === s2 && s2 === s3 );
		if ( same ) {
			self.drawTriangle( tb6, point1, point2, point3 );
		}

		return same;
	}

	self._triangles = [];
	self.drawTriangle = function( tb6, point1, point2, point3 ) {
self.log( 'fck', point1.id, point2.id, point3.id );
		return self._triangles.push( [point1.id, point2.id, point3.id] );

		let normal = self.xyzzy( point1, point2, point3 );

		let screened1 = self.toScreen( point1 );
		let screened2 = self.toScreen( point2 );
		let screened3 = self.toScreen( point3 );

		let pixelsDrawn = tb6.triangleDraw( screened1, screened2, screened3, normal );
	};
	self.nasty = function( tb6 ) {
		for ( let i = 0 ; i < self._triangles.length ; i++ ) {
			let ids = self._triangles[ i ];
			self.log( 'shit', ids );
			let point1 = self.cache.points[ ids[ 0 ] ]
			let point2 = self.cache.points[ ids[ 1 ] ]
			let point3 = self.cache.points[ ids[ 2 ] ]

			self.log( 'n1', point1, 'id:', ids[ 0 ] );
			self.log( 'n2', point2, 'id:', ids[ 2 ] );
			self.log( 'n3', point3, 'id:', ids[ 2 ] );

			let normal = self.xyzzy( point1, point2, point3 );

			let screened1 = self.toScreen( point1 );
			let screened2 = self.toScreen( point2 );
			let screened3 = self.toScreen( point3 );

			let pixelsDrawn = tb6.triangleDraw( screened1, screened2, screened3, normal );
		}
	}

	self.vertex = function( x, y, z, r, g, b ) {
		let v = { x:x, y:y, z:z, r:r, g:g, b:b, id:self.cache.uid++ };
		self.cache.points[ v.id ] = v;
		return v;
	};

	self.toScreen = function( point ) {
		let screened = {
			  x: self.into( point.x, 1024 )
			, y: self.into( point.y, 1024 )
			, z: self.into( point.z, 1024 )
			, r: self.into( point.r, 256  )
			, g: self.into( point.g, 256  )
			, b: self.into( point.b, 256  )
		}

		return screened;
	};
	
	self.into = function( r, i ) {
		return Math.floor( i * 0.5  + i * 0.5 * r );
	};

	self.xyzzy = function( point1, point2, point3 ) {
		let a = self.normallyFrom( point2, point1 );
		let b = self.normallyFrom( point2, point3 );
		return self.normalize(
			{
				  x: ( a.y * b.z ) - ( a.z * b.y ) // x:yzzy
				, y: ( a.z * b.x ) - ( a.x * b.z ) // y:zxxz
				, z: ( a.x * b.y ) - ( a.y * b.x ) // z:xyyx
			}
		);
	};

	self.normallyFrom = function( start, stop ) {
		return self.normalize( self.from( start, stop ) );
	};

	self.from = function( start, stop ) {
		let from = {};
		for ( let key in start ) {
			if ( key in stop ) {
				from[ key ] = stop[ key ] - start[ key ];
			}
		}
		return from;
	};

	self.normalize = function( point ) {
		let s = ( point.x * point.x ) + ( point.y * point.y ) + ( point.z * point.z );
		if ( 0 === s ) {
			s = 1;
		} else {
			s = Math.sqrt( s );
		}

		return self.vertex( point.x / s, point.y / s, point.z / s );
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

		if ( Number.isInteger( lulz ) ) {
			lulz += 0.00000000001; // we all float down here
		}
		
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
				let precision = 100000;
				lulz = Math.floor( precision * lulz ) / precision;
				if ( lulz < 0 ) {
					s = '' + lulz;
				} else {
					s = '+' + lulz;
				}

				if ( -1 == s.indexOf( '.' ) ) {
					s += '.';
				}
				while ( s.length < 8 ) s += '0';

				break;
			case 'string':
				s = lulz;
				break;
			default:
				//console.log( 'idk:' + type );
				return lulz;
		};
		return s;
	}

	self.drawLameWater = function( tb6 ) {
		let i = 0;
		for ( let y = 0 ; y < self.height ; y++ ) {
			for ( let x = 0 ; x < self.width ; x++ ) {
				tb6.imageData.data[ i++ ] = 0;
				tb6.imageData.data[ i++ ] = y < self.height / 2 ? 255 : 0;
				tb6.imageData.data[ i++ ] = 255;
				tb6.imageData.data[ i++ ] = 255;
			}
		}
	}
};

new TriangularB6Test().main( process.argv.slice( 2 ) );
