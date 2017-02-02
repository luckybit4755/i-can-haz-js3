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
		self.context.fillStyle = self.fillStyle;
		self.context.fillRect(0, 0, self.w, self.h);
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
    
    self.setTexture = function( pixels, w, h ) {
        self.texture = pixels;
        self.textureW =  w;
        self.textureH = h;
    };

	self.jack = function( facePoint1, facePoint2, facePoint3, normal, texture ) {
		self.tmpNormal.x = normal.value[ 0 ][ 0 ];
		self.tmpNormal.y = normal.value[ 1 ][ 0 ];
		self.tmpNormal.z = normal.value[ 2 ][ 0 ];
		self.normal = self.tmpNormal;
		
		//self.texture = texture;

		self.monkey(
			  self.toScreen( facePoint1.vertex.value[ 0 ][ 0 ] )
			, self.toScreen( facePoint1.vertex.value[ 1 ][ 0 ] )
			, facePoint1.vertex.value[ 2 ][ 0 ]
			, 255 //facePoint1.s
			, 0 //facePoint1.t
			, 0 //-1

			, self.toScreen( facePoint2.vertex.value[ 0 ][ 0 ] )
			, self.toScreen( facePoint2.vertex.value[ 1 ][ 0 ] )
			, facePoint2.vertex.value[ 2 ][ 0 ]
			, 0 //facePoint2.s
			, 255 //facePoint2.t
			, 0 //-1
			
			, self.toScreen( facePoint3.vertex.value[ 0 ][ 0 ] )
			, self.toScreen( facePoint3.vertex.value[ 1 ][ 0 ] )
			, facePoint3.vertex.value[ 2 ][ 0 ]
			, 0 //facePoint3.s
			, 0 //facePoint3.t
			, 255 //-1
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
			var s = ( r % 256 ) / 256 * self.textureW;
			var t = ( g % 256 ) / 256 * self.textureW;
			if ( s < 0 ) s += self.textureW;
			if ( t < 0 ) t += self.textureH;

			var textureIndex = ( s + t * self.textureW ) << 2;
			r = self.texture[ textureIndex + 0 ];
			g = self.texture[ textureIndex + 1 ];
			b = self.texture[ textureIndex + 2 ];
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
