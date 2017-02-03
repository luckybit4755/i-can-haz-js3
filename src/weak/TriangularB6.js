/**
 *
 * Simple rendering engine for triangles that use a zbuffer, 6d implementation
 * of the bresenham line drawing algorithm and a simplistic scanline triangle
 * rendering mechanism similar to my work with Ghia
 * 
 * It supports primitive texturing and shading.
 *
 */
const TriangularB6 = function(canvas) {
    var self = this;
    self.zFar = 3344;

    self.init = function(canvas) {
		self.fillStyle = 'black';
        self.canvas = canvas || document.getElementsByTagName('canvas')[0];
        self.context = self.canvas.getContext('2d');

		self.w = parseInt( self.canvas.width );
		self.h = parseInt( self.canvas.height );

		self.w2 = self.w / 2;
		self.h2 = self.h / 2;

        /* create the zbuffer and scan line buffers */

        self.zbuffer = [];
        self.left = [];
        self.right = [];

		// avoid object creation as much as possible
        self.leftPoint = [];
        self.rightPoint = [];

        for (var y = 0; y < self.h; y++) {
            self.left.push(false);
            self.right.push(false);

			self.leftPoint.push( self.newPoint() );
			self.rightPoint.push( self.newPoint() );

			var zbufferRow = [];
            self.zbuffer.push( zbufferRow );

            for (var x = 0; x < self.w; x++ ) {
				zbufferRow[ x ] = self.zFar;
            }
        }

		self.shadingMethod = 0;
		self.shadingShiftValue = 7;
		self.shadingSubtractValue = 131;

		self.tmpNormal = {x:0,y:0,z:0};
    };

	self.toScreen = function( v ) {
		return Math.floor( self.w2 + v * self.w2 * 0.9 );
	};

    self.clear = function() {
        self.clearPixels();
        self.clearScanlines();
        self.clearZbuffer();
    };

    self.clearPixels = function() {
		if ( self.fillStyle instanceof HTMLImageElement ) {
			var image = self.fillStyle;
			self.context.drawImage( image, 0, 0, image.width, image.height, 0, 0, self.w, self.h );
		} else {
			self.context.fillStyle = self.fillStyle;
			self.context.fillRect(0, 0, self.w, self.h);
		}
		self.imageData = self.context.getImageData(0, 0, self.w, self.h);
    };

    self.flush = function() {
        self.context.putImageData(self.imageData, 0, 0);
    };

    self.clearZbuffer = function() {
		var h = self.h;
		var w = self.w;
		var z = self.zFar;
		var b = self.zbuffer;
        for (var y = 0; y < h ; y++) {
			var row = b[ y ];
            for (var x = 0; x < w ; x++) {
               	row[ x ] = z;
            }
        }
    };

    self.clearScanlines = function() {
		self.left.fill( false );
		self.right.fill( false );
    };
    
    self.setTexture = function( imageData ) {
        self.texture = imageData;
		self.pixels = imageData ? imageData.data : false;
    };

	self.into = function( v ) {
		return Math.floor( 256 * v );
		return v;
	}

	self.jack = function( facePoint1, facePoint2, facePoint3, normal, texture ) {
		self.tmpNormal.x = normal.value[ 0 ][ 0 ];
		self.tmpNormal.y = normal.value[ 1 ][ 0 ];
		self.tmpNormal.z = normal.value[ 2 ][ 0 ];
		self.normal = self.tmpNormal;
		self.setTexture( texture );
		
		var text_no = !true;
		
		var v = ( true
			&& 0 == self.into( facePoint1.s )
			&& 0 == self.into( facePoint1.t )
			&& 0 == self.into( facePoint2.s )
			&& 0 == self.into( facePoint2.t )
			&& 0 == self.into( facePoint3.s )
			&& 0 == self.into( facePoint3.t )
		) ? 64 : 256;

		if ( 64 == v ) return;

		self.monkey(
			  self.toScreen( facePoint1.vertex.value[ 0 ][ 0 ] )
			, self.toScreen( facePoint1.vertex.value[ 1 ][ 0 ] )
			, self.into( facePoint1.vertex.value[ 2 ][ 0 ] )
			, text_no ? v : self.into( facePoint1.s )
			, text_no ? 0 : self.into( facePoint1.t )
			, text_no ? 0 : -1

			, self.toScreen( facePoint2.vertex.value[ 0 ][ 0 ] )
			, self.toScreen( facePoint2.vertex.value[ 1 ][ 0 ] )
			, self.into( facePoint2.vertex.value[ 2 ][ 0 ] )
			, text_no ? 0 : self.into( facePoint2.s )
			, text_no ? v : self.into( facePoint2.t )
			, text_no ? 0 : -1
			
			, self.toScreen( facePoint3.vertex.value[ 0 ][ 0 ] )
			, self.toScreen( facePoint3.vertex.value[ 1 ][ 0 ] )
			, self.into( facePoint3.vertex.value[ 2 ][ 0 ] )
			, text_no ? 0 : self.into( facePoint3.s )
			, text_no ? 0 : self.into( facePoint3.t )
			, text_no ? v : -1
		);
	};

    self.triangleDraw = function(pt1, pt2, pt3, normal, light ) {
		self.normal = normal;
		self.light = light;
	
		self.monkey(
			pt1.x, pt1.y, pt1.z, pt1.r, pt1.g, pt1.b,
			pt2.x, pt2.y, pt2.z, pt2.r, pt2.g, pt2.b,
			pt3.x, pt3.y, pt3.z, pt3.r, pt3.g, pt3.b
		);
    };

	self.monkey = function( x1, y1, z1, r1, g1, b1,	x2, y2, z2, r2, g2, b2,	x3, y3, z3, r3, g3, b3 ) {
        var minY = Math.min(y1, Math.min(y2, y3));
        var maxY = Math.max(y1, Math.max(y2, y3)) + 1;

		//console.log( JSON.stringify( { x1:x1,y1:y1,z1:z1,r1:r1,g1:g1,b1:b1,x2:x2,y2:y2,z2:z2,r2:r2,g2:g2,b2:b2,x3:x3,y3:y3,z3:z3,r3:r3,g3:g3,b3:b3 }));

        if (minY < 0) minY = 0;
        if (maxY >= self.h) maxY = self.h;

        /* scan the 3 sides of the triangle */

        bresenham6d(
            x1, y1, z1, r1, g1, b1,
            x2, y2, z2, r2, g2, b2,
            self.scanner
        );

        bresenham6d(
            x2, y2, z2, r2, g2, b2,
            x3, y3, z3, r3, g3, b3,
            self.scanner
        );

        bresenham6d(
            x3, y3, z3, r3, g3, b3,
            x1, y1, z1, r1, g1, b1,
            self.scanner
        );

        for (var y = minY; y < maxY; y++) {
            var ptL = self.left[y];
            var ptR = self.right[y];

            bresenham6d(
                ptL.x, ptL.y, ptL.z, ptL.r, ptL.g, ptL.b,
                ptR.x, ptR.y, ptR.z, ptR.r, ptR.g, ptR.b,
                self.zput
            )
        };

		self.left.fill(  false, minY, maxY );
		self.right.fill( false, minY, maxY );
	}

    self.scanner = function(x, y, z, r, g, b) {
        if ( y < 0 || y >= self.h ) return;

        /* for fun */
		if ( self.outline ) {
        	self.zput(x, y, z -0.0001, x, y, z);
		}

        if (!self.left[y] || x <= self.left[y].x) {
            self.left[y] = self.setPoint( self.leftPoint[ y ], x-1, y, z, r, g, b);
        }
        if (!self.right[y] || x >= self.right[y].x) {
            self.right[y] = self.setPoint( self.rightPoint[ y ], x+1, y, z, r, g, b);
        }
    };
	
    self.zput = function( x, y, z, r, g, b ) {
        if ( y < 0 || x < 0 || y >= self.h || x >= self.w ) return; 
	 
	   	// should already be integers....	
		//x = Math.floor( x );
		//y = Math.floor( y );

        if ( z > self.zbuffer[ y ][ x ]) return;

		self.zbuffer[ y ][ x ] = z;
		var index = ( x + y * self.w ) << 2;

		/* texture hack for the win! */
		if ( -1 == b && self.texture ) {
			var w = self.texture.width;
			var h = self.texture.height;

			var s = ( r % 256 ) / 256 * w;
			var t = ( g % 256 ) / 256 * h;

			if ( s < 0 ) s += w;
			if ( t < 0 ) t += h;

			var textureIndex = ( s + t * w ) << 2;
			r = self.pixels[ textureIndex + 0 ];
			g = self.pixels[ textureIndex + 1 ];
			b = self.pixels[ textureIndex + 2 ];
		}

		if ( self.normal ) {
			switch ( self.shadingMethod ) {
				case 1:
					// subtract based on the orientation
					var q = ( self.shadingSubtractValue * self.normal.z ) - self.shadingSubtractValue;
					r += q;
					g += q;
					b += q;
					break;
				case 2:
					// shift based on the orientation
					var q = self.shadingShiftValue - ( ( 1 + self.shadingShiftValue ) * self.normal.z );
					r = r >> q; g = g >> q; b = b >> q;
					break;
				case 3:
					// bands based on orientation
					// larger multiplier increment means fewer bands;
					var multiplier = 1.2;
					var q = 1;
					for ( q = 0.2 ; q < self.normal.z ; q *= multiplier );
					r *= q;
					g *= q;
					b *= q;
				case 4:
					// based on the distance from the light
					if ( self.light ) {
						var xd = self.light.x - ( x / self.w - self.w /2 ) / self.w /2 ;
						var yd = self.light.y - ( y / self.h - self.h /2 ) / self.w /2 ;
						var zd = self.light.z - z;
						var d2 = xd * xd + yd * yd + zd * zd;
						d2 = d2 / self.light.power
						r = r * 0.1 + 0.9 * r / d2 * self.normal.z;
						g = r * 0.1 + 0.9 * g / d2 * self.normal.z;
						b = r * 0.1 + 0.9 * b / d2 * self.normal.z;
						break;
					}
				default:
					// based on the orientation
					var q = 0.2 + self.normal.z * 0.8;
					r *= q;
					g *= q;
					b *= q;
			}
		}

		self.imageData.data[index + 0 ] = r;
		self.imageData.data[index + 1 ] = g;
		self.imageData.data[index + 2 ] = b;
		self.imageData.data[index + 3 ] = 255;
    };
	self.qqq = 0;
	
    self.newPoint = function() {
		return self.makePoint(0,0,0, 0,0,0);
    };

    self.makePoint = function(x, y, z, r, g, b) {
        return { x: x, y: y, z: z, r: r, g: g, b: b };
    };

    self.setPoint = function(point, x, y, z, r, g, b) {
		point.x = x; point.y = y; point.z = z; point.r = r; point.g = g; point.b = b;
		return point;
    };

    /*******/

    self.init(canvas);
};
