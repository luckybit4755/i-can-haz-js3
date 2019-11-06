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

	self.point = function( s, t, x, y, z, nx, ny, nz ) {
		return { s:s, t:t, vertex:self.vertex( x, y, z ), normal:self.vertex(nx,ny,nz) };
	};

	self.main = function( args ) {
		let canvas = CanvasHack.create( 640, 480 );
		let tb6 = new TriangularB6( canvas );
		tb6.clear();

		let normal = self.vertex( 1, 1, 1 ); // I know...

/*
		let point1 = { s:0, t:0, vertex:self.vertex( -1, 0, +1 ), normal:normal };
		let point2 = { s:1, t:0, vertex:self.vertex( +1, 0, +1 ), normal:normal };
		let point3 = { s:0, t:1, vertex:self.vertex(  0, 0, -1 ), normal:normal };


*/
		let point1 = self.point( 0, 0,   -1, 0, +1,     1,1,1 );
		let point2 = self.point( 1, 0,   +1, 0, +1,     1,1,1 );
		let point3 = self.point( 0, 1,    0, 0, -1,     1,1,1 );

		let texture = self.makeTexture( canvas );

		tb6.jack( point1, point2, point3, normal, texture );

		canvas.saveToJpg( jpeg, 'tb6.jpg' );
		console.log( 'ok' );
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
