const MatrixMath = {
	multiplicationTable:[]

	, init: function() {
		MatrixMath.mm_4_4_4_4 = MatrixMath.getMultiplicationMethodBySize( 4,4, 4,4 );
		MatrixMath.mm_1_4_4_4 = MatrixMath.getMultiplicationMethodBySize( 1,4, 4,4 );
		MatrixMath.mm_4_4_4_1 = MatrixMath.getMultiplicationMethodBySize( 4,4, 4,1 );
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

		//MatrixMath.mm_4_4_4_4 = MatrixMath.getMultiplicationMethodBySize( 4,4, 4,4 );
		//MatrixMath.mm_1_4_4_4 = MatrixMath.getMultiplicationMethodBySize( 1,4, 4,4 );
		//MatrixMath.mm_4_4_4_1 = MatrixMath.getMultiplicationMethodBySize( 4,4, 4,1 );

	, makeRotations: function( ax, ay, az ) {
		return MatrixMath.mm_4_4_4_4( 
			MatrixMath.mm_4_4_4_4( 
				  MatrixMath.rotateX( ax )
				, MatrixMath.rotateY( ay ) 
			)
			, MatrixMath.rotateZ( az )
		);
	}

	, rotatePoint: function( x, y, z, ax, ay, az ) {
		return MatrixMath.mm_4_4_4_4( MatrixMath.makeRotations( ax, ay, az ), MatrixMath.point( x, y, z ) );
	}

	////

	, typedMultiply: function( type, m1, m2 ) {
		return MatrixMath.multiplicationTable[ type ]( m1, m2 );
	}

	, multiply: function( m1, m2 ) {
		return (
			MatrixMath.getMultiplicationMethod( m1, m2 )( m1, m2 )
		);
	}

	, getMultiplicationMethod: function( m1, m2 ) {
		return MatrixMath.getMultiplicationMethodBySize( 
			  m1.length, m1[ 0 ].length
			, m2.length, m2[ 0 ].length
		);
	}

	, getMultiplicationMethodBySize: function( m1_rows, m1_columns, m2_rows, m2_columns ) {
		var here = MatrixMath.multiplicationTable;
		var found = true;
		var size;

		size = m1_rows; 
		if ( size > here.length ) { 
			found = false; 
			while( here.length < size ) here.push( [] );
		}
		here = here[ size - 1 ];
		
		size = m1_columns; 
		if ( size > here.length ) { 
			found = false; 
			while( here.length < size ) here.push( [] );
		} 
		here = here[ size - 1 ];

		size = m2_rows; 
		if ( size > here.length ) { 
			found = false; 
			while( here.length < size ) here.push( [] );
		} 
		here = here[ size - 1 ];

		size = m2_columns; 
		if ( size > here.length ) { 
			found = false; 
			while( here.length < size ) here.push( false );
		} 
		here = here[ size - 1 ];

		if ( found && here ) {
			return here;
		} 

		var body = MatrixMath.writeMultiplicationSized( m1_rows, m1_columns, m2_rows, m2_columns )
		console.log( [m1_rows, m1_columns, m2_rows, m2_columns] + ' -> ' + body );

		var funk = new Function( 'm1', 'm2', body );
		MatrixMath.multiplicationTable[m1_rows-1][m1_columns-1][m2_rows-1][m2_columns-1] = funk;

		return funk;
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
