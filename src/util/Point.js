const Point = function(x,y,z) {
	const self = this;

	self.init = function(x,y,z) {
		self.initXYZ( x?x:0, y?y:0, z?z:0 );
	};

	self.initXYZ = function( x, y, z ) {
		self.value = [ [x], [y], [z], [0] ];
		return self;
	};

	self.initPoint = function( other ) {
		return self.initValue( other.value );
	};

	self.initValue = function( value ) {
		return self.initXYZ( value[ 0 ][ 0 ], value[ 1 ][ 0 ], value[ 2 ][ 0 ] );
	};

	self.initArray = function( value ) {
		return self.initXYZ( value[ 0 ], value[ 1 ], value[ 2 ] );
	};

	self.toXYZ = function() {
		return {
			  x : self.value[ 0 ][ 0 ]
			, y : self.value[ 1 ][ 0 ]
			, z : self.value[ 2 ][ 0 ]
		};
	}

	self.copy = function() {
		return ( new Point() ).initPoint( self );
	};

	self.x = function() { return self.value[ 0 ][ 0 ]; }
	self.y = function() { return self.value[ 1 ][ 0 ]; }
	self.z = function() { return self.value[ 2 ][ 0 ]; }

	self.minus = function( other ) {
		self.value[ 0 ][ 0 ] -= other.value[ 0 ][ 0 ];
		self.value[ 1 ][ 0 ] -= other.value[ 1 ][ 0 ];
		self.value[ 2 ][ 0 ] -= other.value[ 2 ][ 0 ];
		return self;
	};

	self.add = function( other ) {
		self.value[ 0 ][ 0 ] += other.value[ 0 ][ 0 ];
		self.value[ 1 ][ 0 ] += other.value[ 1 ][ 0 ];
		self.value[ 2 ][ 0 ] += other.value[ 2 ][ 0 ];
		return self;
	};

	self.normalize = function() {
		var size2 = self.size2();
		if ( 0 == size2 ) return;
		size2 = Math.sqrt( size2 );

		self.value[ 0 ][ 0 ] /= size2;
		self.value[ 1 ][ 0 ] /= size2;
		self.value[ 2 ][ 0 ] /= size2;
		return self;
	};

	self.size = function() {
		return Math.sqrt( self.size2() );
	};

	self.size2 = function() {
		return self.dot( self );
	};

	self.dot = function( other ) {
		return ( 0 +
			+ self.value[ 0 ][ 0 ] * other.value[ 0 ][ 0 ]
			+ self.value[ 1 ][ 0 ] * other.value[ 1 ][ 0 ]
			+ self.value[ 2 ][ 0 ] * other.value[ 2 ][ 0 ]
		);
	};

	self.cross = function( b, c ) {
		return self.initXYZ(
			  b.value[ 1 ][ 0 ] * c.value[ 2 ][ 0 ] - b.value[ 2 ][ 0 ] * c.value[ 1 ][ 0 ] //b.y * c.z - b.z - c.y
			, b.value[ 2 ][ 0 ] * c.value[ 0 ][ 0 ] - b.value[ 0 ][ 0 ] * c.value[ 2 ][ 0 ] //b.z * c.x - b.x - c.z
			, b.value[ 0 ][ 0 ] * c.value[ 1 ][ 0 ] - b.value[ 1 ][ 0 ] * c.value[ 0 ][ 0 ] //b.x * c.y - b.y - c.x
		);
	};

	self.toString = function() {
		return JSON.stringify( self.toXYZ() );
	};

	self.scale = function( scalar ) {
		self.value[ 0 ][ 0 ] *= scalar;
		self.value[ 1 ][ 0 ] *= scalar;
		self.value[ 2 ][ 0 ] *= scalar;
		return this;
	};

	self.tween = function( a, b, t ) {
		return self.initPoint( a ).minus( b ).scale( t ).add( b );
	};

	///

	self.init( x, y, z );
};

try {
	exports.Point = Point;
	module.exports = Point;
} catch(e){}
