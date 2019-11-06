const fs = require( 'fs' );
				
const CanvasHack = {
	create: function( width, height ) {
		return {
			width:width
			, height:height
			, imageData:false
			, getContext:function() {
				return this;
			}
			, makeImageData:function( w, h ) {
				let size = 4 * w * h;
				return {
                    data:Buffer.alloc( size )
					, height:h
					, width:w
					, size:size
                }
			}
			, _getImageData:function() {
				if ( !this.imageData ) {
					this.imageData = this.makeImageData( this.width, this.height )
				}
				return this.imageData;
			}
			, getImageData:function( x, y, w, h ) {
					console.log( 'why hello!' );
				if ( 0 == x && y == 0 && w == this.width && h == this.height ) {
					return this._getImageData();
				} else {
					throw( 'sorry... this is lame...' );
				}
			}
			, fillRect:function( x, y, w, h ) {
				if ( 0 == x && y == 0 && w == this.width && h == this.height ) {
					this.imageData = false;
					this.imageData = this._getImageData()
				} else {
					throw( 'sorry... this is weak...' );
				}
			}
			, putImageData:function( imageData, x, y ) {
				if ( 0 == x && 0 == y ) {
					this.imageData = imageData;
				} else {
					throw( 'sorry... this is awful...' );
				}
			}
			, saveToJpg:function( jpeg, filename, quality ) {
				let w = this.width;
				let h = this.height;
				let data = this.imageData.data;

				var rawImageData = { data:data, width:w, height: h }
				var jpegImageData = jpeg.encode( rawImageData, quality || 50 );
				fs.writeFile( filename, jpegImageData.data, function(){} );
			}

		}

	}
}

try {
    exports.CanvasHack = CanvasHack;
    module.exports = CanvasHack;
} catch(e){}
