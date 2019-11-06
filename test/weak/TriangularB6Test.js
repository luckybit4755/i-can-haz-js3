#!/usr/bin/env node 

const fs = require( 'fs' );
const jpeg = require('jpeg-js');

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
		let canvas = CanvasHack.create( 640, 480 );
		let tb6 = new TriangularB6( canvas );
		tb6.clear();

		let q = -0.1;
		let point1 = self.point( 0, 0,   -1, 0, +1 );
		let point2 = self.point( 1, 0,   +1, 0, +1 );
		let point3 = self.point( 0, 1,    0, q, -1 );

		let texture = self.makeTexture( canvas );

		self.triangle( tb6, texture, point1, point2, point3 );

		canvas.saveToJpg( jpeg, 'tb6.jpg' );
		console.log( 'ok' );
	};

	self.triangle = function( tb6, texture, point1, point2, point3 ) {
		let normal = self.xyzzy(  point1, point2, point3 );
		if ( normal.value[ 2 ][ 0 ] < 0 ) return;

		// brighten things up a bit...
		if ( !false ) {
			normal.value[ 0 ][ 0 ] = Math.pow( normal.value[ 0 ][ 0 ], 0.2 );
			normal.value[ 1 ][ 0 ] = Math.pow( normal.value[ 1 ][ 0 ], 0.2 );
			normal.value[ 2 ][ 0 ] = Math.pow( normal.value[ 2 ][ 0 ], 0.2 );
		}
		
		point1.normal = point2.normal = point3.normal = normal;
		
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
		let x = stop.vertex.value[ 0 ][ 0 ] - start.vertex.value[ 0 ][ 0 ];
		let y = stop.vertex.value[ 1 ][ 0 ] - start.vertex.value[ 1 ][ 0 ];
		let z = stop.vertex.value[ 2 ][ 0 ] - start.vertex.value[ 2 ][ 0 ];
		return self.normalize( x, y, z );
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


	self.split = function() {
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
};

new TriangularB6Test().main( process.argv.slice( 2 ) );
