const SkyBox = function( splits ) {
	this.init( splits ? splits : 4 );
};

const FacePoint = function( vertexIndex, s, t ) {
	this.vertexIndex = vertexIndex;
	this.s = s;
	this.t = t;

	this.tween = function( a, b ) {
		this.s = a.s + ( b.s - a.s ) * 0.5;
		this.t = a.t + ( b.t - a.t ) * 0.5;
		return this;
	}

	this.toString = function() {
		var self = this;
		return JSON.stringify( {vertexIndex:self.vertexIndex,s:self.s,t:self.t} );
	};
};

const Face = function( textureIndex, facePoints ) {
	this.textureIndex = textureIndex;
	this.facePoints = facePoints;
	this.children = null;
};

Face.prototype = {
	middle: function( point2, point1, vertices, lookup, debug ) {
		var middle = new Point().tween( point2, point1, 0.5 );
		var hash = middle.normalize().hashCode();
		var index = -1;

		if ( hash in lookup ) {
			index = lookup[ hash ];
		} else {
			index = vertices.length;
			vertices.push( middle );
			lookup[ hash ] = index;
		}

		return index;
	}

	, toString: function() {
		var s = '{f';
		if ( this.children ) {
			s += ',k:[';
			for ( var i = 0 ; i < this.children.length ; i++ ) {
				s += ( i ? ',' : '' ) + this.children[i].toString();
			}
			s += ']';
		}
		s += '}';
		return s;
	}

	, split: function( iterations, vertices, lookup ) {
		var f1 = this.facePoints[ 0 ];
		var f2 = this.facePoints[ 1 ];
		var f3 = this.facePoints[ 2 ];

		var index1 = f1.vertexIndex;
		var index2 = f2.vertexIndex;
		var index3 = f3.vertexIndex;
if ( index1 == index2 || index1 == index3 || index2 == index3 ) {
console.log( 'dammit:' + [index1,index2,index3].join( ', ' ) );
}

		var point1 = vertices[ index1 ];
		var point2 = vertices[ index2 ];
		var point3 = vertices[ index3 ];

		var self = this;

		var debug = false;
		if ( debug ) {
			console.log( 'indexes:' + [
				self.facePoints[ 0 ].vertexIndex ,
				self.facePoints[ 1 ].vertexIndex ,
				self.facePoints[ 2 ].vertexIndex ].join( ',' )
				+ ' of ' + vertices.length
			);
		}

		var edge1 = new Point().initPoint( point2 ).minus( point1 );
		var edge2 = new Point().initPoint( point3 ).minus( point2 );
		var edge3 = new Point().initPoint( point1 ).minus( point3 );

		var d1 = edge1.size2();
		var d2 = edge2.size2();
		var d3 = edge3.size2();

		var ti = this.textureIndex;

		if ( d1 > d2 && d1 > d3 ) {
			// edge1 is longest
			var middleIndex = this.middle( point2, point1, vertices, lookup );
			var m = new FacePoint( middleIndex, 0, 0 ).tween( f2, f1 );
			this.children = [
				  new Face( ti, [ m, f3, f1 ] )
				, new Face( ti, [ m, f2, f3 ] )
			]
		} else {
			if ( d2 > d3 ) {
				// edge2 is longest
				var middleIndex = this.middle( point3, point2, vertices, lookup, true );
				var m = new FacePoint( middleIndex, 0, 0 ).tween( f3, f2 );
				this.children = [
					  new Face( ti, [ m, f3, f1 ] )
					, new Face( ti, [ m, f1, f2 ] )
				];
			} else {
				// edge3 is longest
				var middleIndex = this.middle( point1, point3, vertices, lookup );
				var m = new FacePoint( middleIndex, 0, 0 ).tween( f1, f3 );
				this.children = [
					  new Face( ti, [ m, f1, f2 ] )
					, new Face( ti, [ m, f2, f3 ] )
				];
			}
		}
		
		if ( !iterations ) return;

		if( debug ) console.log( 'kids: ' + this.children.length );

		this.children[ 0 ].split( iterations - 1, vertices, lookup );
		this.children[ 1 ].split( iterations - 1, vertices, lookup );
	}

	, calculateNormal: function( vertices, edge1, edge3 ) {
		var index1 = this.facePoints[ 0 ].vertexIndex;
		var index2 = this.facePoints[ 1 ].vertexIndex;
		var index3 = this.facePoints[ 2 ].vertexIndex;

		var point1 = vertices[ index1 ];
		var point2 = vertices[ index2 ];
		var point3 = vertices[ index3 ];

		edge1.initPoint( point1 ).minus( point2 );
		edge3.initPoint( point3 ).minus( point2 );

		this.normal = new Point().cross( edge1, edge3 ).normalize();

		if ( this.children ) {
			for ( var i = 0 ; i < this.children.length ; i++ ) {
				this.children[ i ].calculateNormal( vertices, edge1, edge3 );
			}
		}
	}

	, getModified( matrix, original, vertices, transformed, index ) {
		if ( !transformed[ index ] ) {
			transformed[ index ] = true;
			MatrixMath.mm_4_4_4_1( 
				matrix
				, original[ index ].value
				, vertices[ index ].value
			);
		}
		return vertices[ index ];
	}

	, display: function( tb6, matrix, original, vertices, transformed, transformedNormal, threshold, textures, sizePoint ) {
		MatrixMath.mm_4_4_4_1( matrix, this.normal.value, transformedNormal.value )
	
		var screenArea = 0;
		if ( !this.children ) {
			screenArea = -33;
		} else {
			var index1 = this.facePoints[ 0 ].vertexIndex;
			var index3 = this.facePoints[ 2 ].vertexIndex;
			var point1 = this.getModified( matrix, original, vertices, transformed, index1 ); //vertices[ index1 ];
			var point3 = this.getModified( matrix, original, vertices, transformed, index3 ); //vertices[ index3 ];

			// this is fiddly hackery :-(
			sizePoint.initPoint( point3 ).minus( point1 );
			screenArea = sizePoint.size2() * tb6.w2 * 4; 
		}
			
		if ( screenArea < threshold ) {
			return this.drawSelf( tb6, matrix, original, vertices, transformed, transformedNormal, threshold, textures );
		} else {
			var count = this.drawChildren( tb6, matrix, original, vertices, transformed, transformedNormal, threshold, textures, sizePoint );
			if ( count < 2 ) {
				count += this.drawSelf( tb6, matrix, original, vertices, transformed, transformedNormal, threshold, textures );
			}
			return count;
		}
	}

	, drawSelf: function( tb6, matrix, original, vertices, transformed, transformedNormal, threshold, textures ) {
		if ( transformedNormal.value[2][0] < 0 ) return 0;

		var texture = textures ? textures[ this.textureIndex ] : false;

		var index1 = this.facePoints[ 0 ].vertexIndex;
		var index2 = this.facePoints[ 1 ].vertexIndex;
		var index3 = this.facePoints[ 2 ].vertexIndex;

		var point1 = this.getModified( matrix, original, vertices, transformed, index1 );
		var point2 = this.getModified( matrix, original, vertices, transformed, index2 );
		var point3 = this.getModified( matrix, original, vertices, transformed, index3 );
		
		this.facePoints[ 0 ].vertex = point1;
		this.facePoints[ 1 ].vertex = point2;
		this.facePoints[ 2 ].vertex = point3;

		if ( !point1 || !point2 || !point3 ) {
			console.log( 'ug'
				+ ' pt1:' + point1 
				+ ' pt2:' + point2 
				+ ' pt3:' + point3 
			)
		}

		tb6.jack(
			  this.facePoints[ 0 ]
			, this.facePoints[ 1 ]
			, this.facePoints[ 2 ]
			, transformedNormal
			, texture
		);

		return 1;
	}

	, drawChildren: function( tb6, matrix, original, vertices, transformed, transformedNormal, threshold, textures, sizePoint ) {
		var count = 0;
		for ( var i = 0 ; i < this.children.length ; i++ ) {
			count += this.children[ i ].display( tb6, matrix, original, vertices, transformed, transformedNormal, threshold, textures, sizePoint );
		}
		return count;
	}
}

SkyBox.prototype = {
	  BACK:   0
	, TOP:    1
	, FRONT:  2
	, BOTTOM: 3
	, LEFT:   4
	, RIGHT:  5

	, init: function( splits ) {
		this.textures = [];
		for ( var i = 0 ; i <= this.RIGHT; i++ ) this.textures.push( false );

		var x = Math.sqrt( 1 / 3 );
		var y = x;
		var z = x;

		this.vertices = [
			  new Point().initXYZ( -x, +y, -z ) // 0
			, new Point().initXYZ( +x, +y, -z ) // 1
			, new Point().initXYZ( +x, -y, -z ) // 2
			, new Point().initXYZ( -x, -y, -z ) // 3
			, new Point().initXYZ( -x, -y, +z ) // 4
			, new Point().initXYZ( +x, -y, +z ) // 5
			, new Point().initXYZ( +x, +y, +z ) // 6
			, new Point().initXYZ( -x, +y, +z ) // 7
		];

		this.faces = [
			  new Face( this.BACK, [ new FacePoint( 4, 0, 1 ), new FacePoint( 6, 1, 0 ), new FacePoint( 7, 0, 0 ) ] )
			, new Face( this.BACK, [ new FacePoint( 4, 0, 1 ), new FacePoint( 5, 1, 1 ), new FacePoint( 6, 1, 0 ) ] )

			, new Face( this.FRONT, [ new FacePoint( 3, 0, 0 ), new FacePoint( 0, 0, 1 ), new FacePoint( 1, 1, 1 ) ] )
			, new Face( this.FRONT, [ new FacePoint( 3, 0, 0 ), new FacePoint( 1, 1, 1 ), new FacePoint( 2, 1, 0 ) ] )

			, new Face( this.BOTTOM, [ new FacePoint( 7, 0, 1 ), new FacePoint( 1, 1, 0 ), new FacePoint( 0, 0, 0 ) ] )
			, new Face( this.BOTTOM, [ new FacePoint( 7, 0, 1 ), new FacePoint( 6, 1, 1 ), new FacePoint( 1, 1, 0 ) ] )

			, new Face( this.TOP, [ new FacePoint( 4, 0, 0 ), new FacePoint( 3, 0, 1 ), new FacePoint( 2, 1, 1 ) ] )
			, new Face( this.TOP, [ new FacePoint( 4, 0, 0 ), new FacePoint( 2, 1, 1 ), new FacePoint( 5, 1, 0 ) ] )

			, new Face( this.RIGHT, [ new FacePoint( 2, 0, 0 ), new FacePoint( 1, 0, 1 ), new FacePoint( 6, 1, 1 ) ] )
			, new Face( this.RIGHT, [ new FacePoint( 2, 0, 0 ), new FacePoint( 6, 1, 1 ), new FacePoint( 5, 1, 0 ) ] )

			, new Face( this.LEFT, [ new FacePoint( 3, 1, 0 ), new FacePoint( 7, 0, 1 ), new FacePoint( 0, 1, 1 ) ] )
			, new Face( this.LEFT, [ new FacePoint( 3, 1, 0 ), new FacePoint( 4, 0, 0 ), new FacePoint( 7, 0, 1 ) ] )
		]

		this.split( splits );
		this.normals();
		this.makeWorkspace();
	}

	, split: function( iterations ) {
		var lookup = {};
		for ( var i = 0 ; i < this.vertices.length ; i++ ) {
			this.vertices[ i ].normalize();
			lookup[ this.vertices[ i ].hashCode ] = i;
		}

		for ( var i = 0 ; i < this.faces.length ; i++ ) {
			this.faces[ i ].split( iterations, this.vertices, lookup );
		}
	}

	, normals: function() {
		var edge1 = new Point();
		var edge3 = new Point();
		for ( var i = 0 ; i < this.faces.length ; i++ ) {
			var face = this.faces[ i ];
			face.calculateNormal( this.vertices, edge1, edge3 );
		}
	}

	, makeWorkspace: function() {
		this.modifiedPoints = [];
		this.hasBeenModified = [];
		// 3 point in the triangle and 1 for the normal
		for ( var i = 0 ; i < this.vertices.length ; i++ ) {
			this.modifiedPoints.push( new Point() );
			this.hasBeenModified.push( false );
		}
		this.modifiedNormal = new Point();
		this.sizePoint = new Point();
	}

	, display: function( tb6, matrix, threshold ) {
		tb6.outline = 'snit';
		tb6.fillStyle = 'gray';

		this.hasBeenModified.fill( false );
		var count = 0;

		for ( var i = 0 ; i < this.faces.length ; i++ ) {
			var face = this.faces[ i ];
			count += face.display( tb6, matrix, this.vertices, this.modifiedPoints, this.hasBeenModified, this.modifiedNormal, threshold, this.textures, this.sizePoint );
		}

		var k2 = 0;
		for ( var i = 0 ; i < this.vertices.length ; i++ ) {
			if ( this.hasBeenModified[ i ] ) k2++;
		}

		return count + k2 / 100000.0;
	}
};

try {
	exports.SkyBox = SkyBox;
	module.exports = SkyBox;
} catch(e){}
