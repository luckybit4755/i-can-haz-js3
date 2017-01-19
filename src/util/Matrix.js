//#!/usr/bin/env node 

const Matrix = function() {
	const self = this;

	self.init = function() {
		self.multiplication = {};
	};

	self.common = function() {
	    self.getMultiplicationMethodSize( 4,4, 4,4 );
	    self.getMultiplicationMethodSize( 1,4, 4,4 );
	    self.getMultiplicationMethodSize( 4,4, 4,1 );
		return self;
	};

	////

	self.fixToString = function( lol ) {
		return lol;
		if ( lol ) lol.toString = function() { return JSON.stringify( this ) };
		return lol;
	}

	self.identity = function( radians ) {
		return self.fixToString(
			[
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, 1, 0 ],
				[ 0, 0, 0, 1 ]
			]
		);
	};

	self.rotateX = function( radians ) {
		var c = Math.cos( radians );
		var s = Math.sin( radians );
		return self.fixToString(
			[
				[ 1, 0,  0, 0 ],
				[ 0, c, -s, 0 ],
				[ 0, s,  c, 0 ],
				[ 0, 0,  0, 1 ]
			]
		);
	};

	self.rotateY = function( radians ) {
		var c = Math.cos( radians );
		var s = Math.sin( radians );
		return self.fixToString(
			[
				[  c, 0, s, 0 ],
				[  0, 1, 0, 0 ],
				[ -s, 0, c, 0 ],
				[  0, 0, 0, 1 ]
			]
		);
	};

	self.rotateZ = function( radians ) {
		var c = Math.cos( radians );
		var s = Math.sin( radians );
		return self.fixToString( 
			[
				[ c, -s, 0, 0 ],
				[ s,  c, 0, 0 ],
				[ 0,  0, 1, 0 ],
				[ 0,  0, 0, 1 ]
			]
		);
	};

	self.translate = function( dx, dy, dz ) {
		return self.fixToString( 
			[
				[ 1, 0, 0, dx ],
				[ 0, 1, 0, dy ],
				[ 0, 0, 1, dz ],
				[ 0, 0, 0,  1 ]
			]
		);
	};

	self.scale = function( dx, dy, dz ) {
		return self.fixToString( 
			[
				[ dx,  0,  0, 0 ],
				[  0, dy,  0, 0 ],
				[  0,  0, dz, 0 ],
				[  0,  0,  0, 1 ]
			]
		);
	};
	
	self.point2 = function( x, y, z ) {
		return self.fixToString( [ [ x, y, z, 0 ] ] );
	};

	self.point = function( x, y, z ) {
		return self.fixToString( [ [x], [y], [z], [0] ] );
	};

	self.makeRotations = function( ax, ay, az ) {
		return self.multiply( 
			self.multiply( 
				  self.rotateX( ax )
				, self.rotateY( ay ) 
			)
			, self.rotateZ( az )
		);
	};

	self.rotatePoint = function( x, y, z, ax, ay, az ) {
		return self.multiply( self.makeRotations( ax, ay, az ), self.point( x, y, z ) );
	};

	////

	self.typedMultiply = function( type, m1, m2 ) {
		return self.multiplication[ type ]( m1, m2 );
	};

	self.multiply = function( m1, m2 ) {
		//console.log( 'xo' );
		//console.log( 'hi:' + self.getMultiplicationMethod( m1, m2 ) );
		return self.fixToString(
			self.getMultiplicationMethod( m1, m2 )( m1, m2 )
		);
	};

	self.getMultiplicationMethod = function( m1, m2 ) {
		self.size( m1 );
		self.size( m2 );
		return self.getMultiplicationMethodSize( m1.size.rows, m1.size.columns, m2.size.rows, m2.size.columns );
	};

	self.getMultiplicationMethodSize = function( m1_rows, m1_columns, m2_rows, m2_columns ) {
		var type = (
			m1_rows + 'x' + m1_columns 
			+ ' * ' +
			m2_rows + 'x' + m2_columns
		);

		if ( type in self.multiplication ) return self.multiplication[ type ];

		var body = self.writeMultiplicationSized( m1_rows, m1_columns, m2_rows, m2_columns )
		console.log( type + ' -> ' + body );

		return self.multiplication[ type ] = new Function( 'm1', 'm2', body );
	};

	self.size = function( m ) {
		m.size = {
			rows:m.length
			,columns:m[ 0 ].length
			,toString:function(){return JSON.stringify(m.size)}
		};
	};

	self.writeMultiplication = function( m1, m2 ) {
		self.size( m1 );
		self.size( m2 );
		return self.writeMultiplicationSized( 
			m1.size.rows, m1.size.columns,
			m2.size.rows, m2.size.columns
		);
	}

	self.writeMultiplicationSized= function( m1_size_rows, m1_size_columns, m2_size_rows, m2_size_columns ) {
		if ( m1_size_columns != m2_size_rows ) {
			return;
		}

		var body = 'return [';

		var result = [];
		for ( var i = 0 ; i < m1_size_rows ; i++ ) {
			body += ( i ? ', [' : '[' );
			for ( var j = 0 ; j < m2_size_columns ; j++ ) {
				body += ( j ? ', ' : ' ' );

				for ( var k = 0 ; k < m1_size_columns ; k++ ) {
					//body += (k?' + ' : '' ) + 'm1[' + i + '][' + k + ']*m2[' + k + '][' + j + ']';
					body += (k?' + ' : '' ) + 'm1[' + i + '][' + k + ']*m2[' + k + '][' + j + ']';
				}

				body += '';
			}
			body += ']';
		}
			
		body += '];';
		return body;
	};

	self.init();
};

try {
	exports.Matrix = Matrix;
	module.exports = Matrix;
} catch(e){}
