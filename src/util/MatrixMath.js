const MatrixMath = {
	multiplication:{}

	, common: function() {
	    MatrixMath.getMultiplicationMethodSize( 4,4, 4,4 );
	    MatrixMath.getMultiplicationMethodSize( 1,4, 4,4 );
	    MatrixMath.getMultiplicationMethodSize( 4,4, 4,1 );
		return MatrixMath;
	}

	////

	, identity: function( radians ) {
		return (
			[
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, 1, 0 ],
				[ 0, 0, 0, 1 ]
			]
		);
	}

	, rotateX: function( radians ) {
		var c = Math.cos( radians );
		var s = Math.sin( radians );
		return (
			[
				[ 1, 0,  0, 0 ],
				[ 0, c, -s, 0 ],
				[ 0, s,  c, 0 ],
				[ 0, 0,  0, 1 ]
			]
		);
	}

	, rotateY: function( radians ) {
		var c = Math.cos( radians );
		var s = Math.sin( radians );
		return (
			[
				[  c, 0, s, 0 ],
				[  0, 1, 0, 0 ],
				[ -s, 0, c, 0 ],
				[  0, 0, 0, 1 ]
			]
		);
	}

	, rotateZ: function( radians ) {
		var c = Math.cos( radians );
		var s = Math.sin( radians );
		return (
			[
				[ c, -s, 0, 0 ],
				[ s,  c, 0, 0 ],
				[ 0,  0, 1, 0 ],
				[ 0,  0, 0, 1 ]
			]
		);
	}

	, translate: function( dx, dy, dz ) {
		return (
			[
				[ 1, 0, 0, dx ],
				[ 0, 1, 0, dy ],
				[ 0, 0, 1, dz ],
				[ 0, 0, 0,  1 ]
			]
		);
	}

	, scale: function( dx, dy, dz ) {
		return (
			[
				[ dx,  0,  0, 0 ],
				[  0, dy,  0, 0 ],
				[  0,  0, dz, 0 ],
				[  0,  0,  0, 1 ]
			]
		);
	}

	, point: function( x, y, z ) {
		return ( [ [x], [y], [z], [0] ] );
	}

	, point: function( x, y, z ) {
		return ( [ [x], [y], [z], [0] ] );
	}

	, minusPoint: function( point1, point2 ) {
	}

	, normalizePoint: function( point ) {
	}

	, makeRotations: function( ax, ay, az ) {
		return MatrixMath.multiply( 
			MatrixMath.multiply( 
				  MatrixMath.rotateX( ax )
				, MatrixMath.rotateY( ay ) 
			)
			, MatrixMath.rotateZ( az )
		);
	}

	, rotatePoint: function( x, y, z, ax, ay, az ) {
		return MatrixMath.multiply( MatrixMath.makeRotations( ax, ay, az ), MatrixMath.point( x, y, z ) );
	}

	////

	, typedMultiply: function( type, m1, m2 ) {
		return MatrixMath.multiplication[ type ]( m1, m2 );
	}

	, multiply: function( m1, m2 ) {
		return (
			MatrixMath.getMultiplicationMethod( m1, m2 )( m1, m2 )
		);
	}

	, getMultiplicationMethod: function( m1, m2 ) {
		MatrixMath.size( m1 );
		MatrixMath.size( m2 );
		return MatrixMath.getMultiplicationMethodSize( m1.size.rows, m1.size.columns, m2.size.rows, m2.size.columns );
	}

	, getMultiplicationMethodSize: function( m1_rows, m1_columns, m2_rows, m2_columns ) {
		var type = (
			m1_rows + 'x' + m1_columns 
			+ ' * ' +
			m2_rows + 'x' + m2_columns
		);

		if ( type in MatrixMath.multiplication ) return MatrixMath.multiplication[ type ];

		var body = MatrixMath.writeMultiplicationSized( m1_rows, m1_columns, m2_rows, m2_columns )
		console.log( type + ' -> ' + body );

		return MatrixMath.multiplication[ type ] = new Function( 'm1', 'm2', body );
	}

	, size: function( m ) {
		m.size = {
			rows:m.length
			,columns:m[ 0 ].length
			,toString:function(){return JSON.stringify(m.size)}
		}
	}

	, writeMultiplication: function( m1, m2 ) {
		MatrixMath.size( m1 );
		MatrixMath.size( m2 );
		return MatrixMath.writeMultiplicationSized( 
			m1.size.rows, m1.size.columns,
			m2.size.rows, m2.size.columns
		);
	}

	/* generate a function body to calculate the matrix multiplication of matrices with these dimensions */
	, writeMultiplicationSized: function( m1_size_rows, m1_size_columns, m2_size_rows, m2_size_columns ) {
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
	}
};

try {
	exports.MatrixMath = MatrixMath;
	module.exports = MatrixMath;
} catch(e){}
