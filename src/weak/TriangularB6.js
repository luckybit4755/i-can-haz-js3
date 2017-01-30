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

    self.triangleDraw = function(pt1, pt2, pt3, normal ) {
        self.clearScanlines();
		self.normal = normal;

        var minY = Math.min(pt1.y, Math.min(pt2.y, pt3.y));
        var maxY = Math.max(pt1.y, Math.max(pt2.y, pt3.y)) + 1;

        if (minY < 0) minY = 0;
        if (maxY >= self.h) maxY = self.h;

        /* scan the 3 sides of the triangle */

        bresenham6d(
            pt1.x, pt1.y, pt1.z, pt1.r, pt1.g, pt1.b,
            pt2.x, pt2.y, pt2.z, pt2.r, pt2.g, pt2.b,
            self.scanner
        );

        bresenham6d(
            pt2.x, pt2.y, pt2.z, pt2.r, pt2.g, pt2.b,
            pt3.x, pt3.y, pt3.z, pt3.r, pt3.g, pt3.b,
            self.scanner
        );

        bresenham6d(
            pt3.x, pt3.y, pt3.z, pt3.r, pt3.g, pt3.b,
            pt1.x, pt1.y, pt1.z, pt1.r, pt1.g, pt1.b,
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
    };

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
	  
		x = Math.floor( x );
		y = Math.floor( y );
					
        if ( z > self.zbuffer[ y ][ x ]) return;

		self.zbuffer[ y ][ x ] = z;
		var index = 4 * ( x + y * self.w );
		
		/* texture hack for the win! */
		if ( -1 == b && self.texture ) {
			var s = Math.floor( r * self.textureW / 256);	
			var t = Math.floor( g * self.textureH / 256 );	
			if ( s < 0 ) s+= self.textureW;
			if ( t < 0 ) t+= self.textureH;

			var tIndex = 4 * ( s + t * self.textureW );
			r = self.texture[ tIndex + 0 ];
			g = self.texture[ tIndex + 1 ];
			b = self.texture[ tIndex + 2 ];
		}

		if ( self.normal ) {
			var q = 0.1 + self.normal.z * 0.9;
			r *= q;
			g *= q;
			b *= q;
		}

		self.imageData.data[index + 0 ] = r;
		self.imageData.data[index + 1 ] = g;
		self.imageData.data[index + 2 ] = b;
		self.imageData.data[index + 3 ] = 255;
    };
	
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
