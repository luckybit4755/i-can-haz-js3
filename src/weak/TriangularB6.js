/* this doesn't really belong here, but the web interface for github is so ridiculous and I didn't want to fool with the CLI, here it is for now... */

/*from https://sites.google.com/site/proyectosroboticos/bresenham-6d*/
const bresenham6d_min = function(a, f, o, i, r, s, t, b, h, n, M, c, e) {
    var l, u, v, d, g, j, m, k, p, q, w, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, N, O, P, Q, R, S, T, U, V, W;
    if (l = u = v = d = g = j = m = k = p = q = w = x = y = z = A = B = C = D = E = F = G = H = I = J = K = L = N = O = P = Q = R = S = T = U = V = W = 0, e || (e = function(a, f, o, i, r, s) {}), K = a, L = f, N = o, O = i, P = r, Q = s, e(K, L, N, O, P, Q), l = t - a, u = b - f, v = h - o, d = n - i, g = M - r, j = c - s, y = 0 > l ? -1 : 1, z = 0 > u ? -1 : 1, A = 0 > v ? -1 : 1, B = 0 > d ? -1 : 1, C = 0 > g ? -1 : 1, D = 0 > j ? -1 : 1, m = Math.abs(l), k = Math.abs(u), p = Math.abs(v), q = Math.abs(d), w = Math.abs(g), x = Math.abs(j), E = 2 * m, F = 2 * k, G = 2 * p, H = 2 * q, I = 2 * w, J = 2 * x, m >= k && m >= p && m >= q && m >= w && m >= x)
        for (R = F - m, S = G - m, T = H - m, U = I - m, V = J - m, W = 1; m > W; W++) R > 0 && (L += z, R -= E), S > 0 && (N += A, S -= E), T > 0 && (O += B, T -= E), U > 0 && (P += C, U -= E), V > 0 && (Q += D, V -= E), R += F, S += G, T += H, U += I, V += J, K += y, e(K, L, N, O, P, Q);
    if (k > m && k >= p && k >= q && k >= w && k >= x)
        for (R = E - k, S = G - k, T = H - k, U = I - k, V = J - k, W = 1; k > W; W++) R > 0 && (K += y, R -= F), S > 0 && (N += A, S -= F), T > 0 && (O += B, T -= F), U > 0 && (P += C, U -= F), V > 0 && (Q += D, V -= F), R += E, S += G, T += H, U += I, V += J, L += z, e(K, L, N, O, P, Q);
    if (p > m && p > k && p >= q && p >= w && p >= x)
        for (R = F - p, S = E - p, T = H - p, U = I - p, V = J - p, W = 1; p > W; W++) R > 0 && (L += z, R -= G), S > 0 && (K += y, S -= G), T > 0 && (O += B, T -= G), U > 0 && (P += C, U -= G), V > 0 && (Q += D, V -= G), R += F, S += E, T += H, U += I, V += J, N += A, e(K, L, N, O, P, Q);
    if (q > m && q > k && q > p && q >= w && q >= x)
        for (R = E - q, S = F - q, T = G - q, U = I - q, V = J - q, W = 1; q > W; W++) R > 0 && (K += y, R -= H), S > 0 && (L += z, S -= H), T > 0 && (N += A, T -= H), U > 0 && (P += C, U -= H), V > 0 && (Q += D, V -= H), R += E, S += F, T += G, U += I, V += J, O += B, e(K, L, N, O, P, Q);
    if (w > m && w > k && w > p && w > q && w >= x)
        for (R = E - w, S = F - w, T = G - w, U = H - w, V = J - w, W = 1; w > W; W++) R > 0 && (K += y, R -= I), S > 0 && (L += z, S -= I), T > 0 && (N += A, T -= I), U > 0 && (O += B, U -= I), V > 0 && (Q += D, V -= I), R += E, S += F, T += G, U += H, V += J, P += C, e(K, L, N, O, P, Q);
    if (x > m && x > k && x > p && x > q && x > w)
        for (R = E - x, S = F - x, T = G - x, U = H - x, V = I - x, W = 1; x > W; W++) R > 0 && (K += y, R -= J), S > 0 && (L += z, S -= J), T > 0 && (N += A, T -= J), U > 0 && (O += B, U -= J), V > 0 && (P += C, V -= J), R += E, S += F, T += G, U += H, V += I, Q += D, e(K, L, N, O, P, Q)
};

const bresenham6d = function(Old1, Old2, Old3, Old4, Old5, Old6, New1, New2, New3, New4, New5, New6, callback) {
    bresenham6d_min(Old1, Old2, Old3, Old4, Old5, Old6, New1, New2, New3, New4, New5, New6, callback);
};

const TriangularB6 = function(canvas) {
    var self = this;
    self.zFar = 3344;
    self.init = function(canvas) {
		self.fillStyle = 'black';
        self.canvas = canvas || document.getElementsByTagName('canvas')[0];
        self.context = self.canvas.getContext('2d');

        /* create the zbuffer and scan line buffers */

        self.zbuffer = [];
        self.left = [];
        self.right = [];

        for (var i = 0; i < self.canvas.height; i++) {
            self.left.push(false);
            self.right.push(false);
            self.zbuffer.push([]);
            for (var j = 0; j < self.canvas.width; j++) {
                self.zbuffer[i][j] = self.zFar;
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
        self.context.fillRect(0, 0, self.canvas.width, self.canvas.height);
        self.imageData = self.context.getImageData(0, 0, self.canvas.width, self.canvas.height);
    };

    self.flush = function() {
        self.context.putImageData(self.imageData, 0, 0);
    };

    self.clearZbuffer = function() {
        for (var i = 0; i < self.canvas.height; i++) {
            for (var j = 0; j < self.canvas.width; j++) {
                self.zbuffer[i][j] = self.zFar;
            }
        }
    };

    self.clearScanlines = function() {
        for (var i = 0; i < self.canvas.height; i++) {
            self.left[i] = self.right[i] = false;
        }
    };
    
    self.setTexture = function( pixels, w, h ) {
        self.texture = pixels;
        self.textureW =  w;
        self.textureH = h;
    };

    self.zput = function(x, y, z, r, g, b) {
        if ( y < 0 ) y  = 0;
        if ( y >= self.canvas.height ) y = self.canvas.height - 1;
        if ( x < 0 ) x  = 0;
        if ( x >= self.canvas.width ) x = self.canvas.width - 1;
        
        x = Math.floor(x);
        y = Math.floor(y);
        
        if (z < self.zbuffer[y][x]) {
            self.zbuffer[y][x] = z;
            var index = 4 * (x + y * self.canvas.width);
            var zCue = 64 + 192 - 192 * z / self.canvas.width;
            
            /* texture hack for the win! */
            if ( -1 == b && self.texture ) {
                   var s = Math.floor( self.textureW * r / 255 );
                   var t = Math.floor( self.textureH * g / 255 );
                   while ( s < 0 ) s += self.textureW;
                   while ( t < 0 ) t += self.textureH;
                   while ( s >= self.textureW ) s -= self.textureW;
                   while ( t >= self.textureH ) t -= self.textureH;
                   var tIndex = 4 * ( s + t * self.textureW );
                    r = self.texture[ tIndex++ ];
                    g = self.texture[ tIndex++ ];
                    b = self.texture[ tIndex++ ];
            }

			if ( self.dot ) {
				var q = 0.1 + self.dot * 0.9;
				//q = self.dot * self.dot;
				r = Math.floor( r * q );
				g = Math.floor( g * q );
				b = Math.floor( b * q );
			}

            self.imageData.data[index++] = r;
            self.imageData.data[index++] = g;
            self.imageData.data[index++] = b;
            self.imageData.data[index++] = zCue;
        }
    };

    self.makePoint = function(x, y, z, r, g, b) {
        return {
            x: x,
            y: y,
            z: z,
            r: r,
            g: g,
            b: b
        };
    };

    self.scanner = function(x, y, z, r, g, b) {
        if (y < 0 || y >= self.canvas.height) return;

        /* for fun */
		if ( self.outline ) {
        	self.zput(x, y, z -0.0001, x, y, z);
		}

        if (!self.left[y] || x <= self.left[y].x) {
            self.left[y] = self.makePoint(x-1, y, z, r, g, b);
        }
        if (!self.right[y] || x >= self.right[y].x) {
            self.right[y] = self.makePoint(x+1, y, z, r, g, b);
        }
    };

    self.triangleDraw = function(pt1, pt2, pt3,dot) {
        self.clearScanlines();
		self.dot = dot;

        var minY = Math.min(pt1.y, Math.min(pt2.y, pt3.y));
        var maxY = Math.max(pt1.y, Math.max(pt2.y, pt3.y)) + 1;
        if (minY < 0) minY = 0;
        if (maxY >= self.canvas.height) maxY = self.canvas.height;

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

    /*******/
    self.init(canvas);
};
