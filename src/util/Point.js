const Point = function() {
	this.value = [ [0], [0], [0], [0] ];
};

Point.prototype = {
	init: function(x,y,z) {
		this.initXYZ( x?x:0, y?y:0, z?z:0 );
	}

	, initXYZ: function( x, y, z ) {
		this.value = [ [x], [y], [z], [0] ];
		return this;
	}

	, initPoint: function( other ) {
		return this.initValue( other.value );
	}

	, initValue: function( value ) {
		return this.initXYZ( value[ 0 ][ 0 ], value[ 1 ][ 0 ], value[ 2 ][ 0 ] );
	}

	, initArray: function( value ) {
		return this.initXYZ( value[ 0 ], value[ 1 ], value[ 2 ] );
	}

	, toXYZ: function() {
		return {
			  x : this.value[ 0 ][ 0 ]
			, y : this.value[ 1 ][ 0 ]
			, z : this.value[ 2 ][ 0 ]
		};
	}

	, copy: function() {
		return ( new Point() ).initPoint( this );
	}

	, x: function() { return this.value[ 0 ][ 0 ] }
	, y: function() { return this.value[ 1 ][ 0 ] }
	, z: function() { return this.value[ 2 ][ 0 ] }

	, minus: function( other ) {
		this.value[ 0 ][ 0 ] -= other.value[ 0 ][ 0 ];
		this.value[ 1 ][ 0 ] -= other.value[ 1 ][ 0 ];
		this.value[ 2 ][ 0 ] -= other.value[ 2 ][ 0 ];
		return this;
	}

	, add: function( other ) {
		this.value[ 0 ][ 0 ] += other.value[ 0 ][ 0 ];
		this.value[ 1 ][ 0 ] += other.value[ 1 ][ 0 ];
		this.value[ 2 ][ 0 ] += other.value[ 2 ][ 0 ];
		return this;
	}

	, normalize: function() {
		var size2 = this.size2();
		if ( 0 == size2 ) return;
		size2 = Math.sqrt( size2 );

		this.value[ 0 ][ 0 ] /= size2;
		this.value[ 1 ][ 0 ] /= size2;
		this.value[ 2 ][ 0 ] /= size2;
		return this;
	}

	, size: function() {
		return Math.sqrt( this.size2() );
	}

	, size2: function() {
		return this.dot( this );
	}

	, dot: function( other ) {
		return ( 0 +
			+ this.value[ 0 ][ 0 ] * other.value[ 0 ][ 0 ]
			+ this.value[ 1 ][ 0 ] * other.value[ 1 ][ 0 ]
			+ this.value[ 2 ][ 0 ] * other.value[ 2 ][ 0 ]
		);
	}

	, cross: function( b, c ) {
		return this.initXYZ(
			  b.value[ 1 ][ 0 ] * c.value[ 2 ][ 0 ] - b.value[ 2 ][ 0 ] * c.value[ 1 ][ 0 ] //b.y * c.z - b.z - c.y
			, b.value[ 2 ][ 0 ] * c.value[ 0 ][ 0 ] - b.value[ 0 ][ 0 ] * c.value[ 2 ][ 0 ] //b.z * c.x - b.x - c.z
			, b.value[ 0 ][ 0 ] * c.value[ 1 ][ 0 ] - b.value[ 1 ][ 0 ] * c.value[ 0 ][ 0 ] //b.x * c.y - b.y - c.x
		);
	}

	, toString: function() {
		return JSON.stringify( this.toXYZ() );
	}

	, scale: function( scalar ) {
		this.value[ 0 ][ 0 ] *= scalar;
		this.value[ 1 ][ 0 ] *= scalar;
		this.value[ 2 ][ 0 ] *= scalar;
		return this;
	}

	, tween: function( a, b, t ) {
		return this.initPoint( a ).minus( b ).scale( t ).add( b );
	}
};

try {
	exports.Point = Point;
	module.exports = Point;
} catch(e){}
