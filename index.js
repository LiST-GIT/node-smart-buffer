const BE = module.exports.BE = Symbol( 'BE' );
const LE = module.exports.LE = Symbol( 'LE' );

module.exports.InputBuffer = class InputBuffer {
	constructor( endian, bufferSize ) {
		this.endian = endian || BE;
		this.bufferSize = bufferSize || Math.pow( 2, 17 );
		this.buffer = Buffer.allocUnsafe( this.bufferSize + 7 );
		this.clear();
	}
	clear() {
		this.start = 0;
		this.cursor = 0;
		this.length = 0;
		return this;
	}
	reset() {
		this.cursor = 0;
		return this;
	}
	skip( cursor ) {
		if ( this.length < this.cursor + cursor ) {
			throw new RangeError( 'index out of range' );
		}
		this.cursor += cursor;
		return this;
	}
	skipTo( cursor ) {
		if ( this.length < cursor ) {
			throw new RangeError( 'index out of range' );
		}
		this.cursor = cursor;
		return this;
	}
	remaining() {
		return this.length - this.cursor;
	}
	add( data ) {
		if ( this.bufferSize - this.length < data.length ) {
			throw new RangeError( 'buffer overflow' );
		}
		const start = this.start + this.length;
		for ( var index = 0; index < data.length; index++ ) {
			this.buffer[ ( start + index ) % this.bufferSize ] = data[ index ];
		}
		for ( var index = 0; index < 7; index++ ) {
			this.buffer[ this.bufferSize + index ] = this.buffer[ index ];
		}
		this.length += data.length;
		return this;
	}
	discard( length ) {
		if ( this.length < length ) {
			throw new RangeError( 'index out of range' );
		}
		this.start += length;
		this.length -= length;
		this.cursor = 0;
		return this;
	}
	read( length ) {
		if ( this.length - this.cursor < length ) {
			throw new RangeError( 'index out of range' );
		}
		const buffer = Buffer.allocUnsafe( length );
		const start = this.start + this.cursor;
		for ( var index = 0; index < length; index++ ) {
			buffer[ index ] = this.buffer[ ( start + index ) % this.bufferSize ];
		}
		this.cursor += length;
		return buffer;
	}
	int8() {
		return this.uint8() << 24 >> 24;
	}
	uint8() {
		if ( this.length - this.cursor < 1 ) {
			throw new RangeError( 'index out of range' );
		}
		return this.buffer[ ( this.start + this.cursor++ ) % this.bufferSize ];
	}
	int16() {
		return this.uint16() << 16 >> 16;
	}
	uint16() {
		if ( this.length - this.cursor < 2 ) {
			throw new RangeError( 'index out of range' );
		}
		this.cursor += 2;
		if ( this.endian === BE ) {
			return this.buffer.readUInt16BE( ( this.start + this.cursor - 2 ) % this.bufferSize );
		} else {
			return this.buffer.readUInt16LE( ( this.start + this.cursor - 2 ) % this.bufferSize );
		}
	}
	int32() {
		if ( this.length - this.cursor < 4 ) {
			throw new RangeError( 'index out of range' );
		}
		this.cursor += 4;
		if ( this.endian === BE ) {
			return this.buffer.readInt32BE( ( this.start + this.cursor - 4 ) % this.bufferSize );
		} else {
			return this.buffer.readInt32LE( ( this.start + this.cursor - 4 ) % this.bufferSize );
		}
	}
	uint32() {
		return this.int32() >>> 0;
	}
	int64() {
		if ( this.endian === BE ) {
			return this.read( 8 );
		} else {
			return this.read( 8 ).swap64();
		}
	}
	uint64() {
		return this.int64();
	}
	float() {
		if ( this.length - this.cursor < 4 ) {
			throw new RangeError( 'index out of range' );
		}
		this.cursor += 4;
		if ( this.endian === BE ) {
			return this.buffer.readFloatBE( ( this.start + this.cursor - 4 ) % this.bufferSize );
		} else {
			return this.buffer.readFloatLE( ( this.start + this.cursor - 4 ) % this.bufferSize );
		}
	}
	double() {
		if ( this.length - this.cursor < 8 ) {
			throw new RangeError( 'index out of range' );
		}
		this.cursor += 8;
		if ( this.endian === BE ) {
			return this.buffer.readDoubleBE( ( this.start + this.cursor - 8 ) % this.bufferSize );
		} else {
			return this.buffer.readDoubleLE( ( this.start + this.cursor - 8 ) % this.bufferSize );
		}
	}
};

module.exports.OutputBuffer = class OutputBuffer {
	constructor( endian, bufferSize ) {
		this.endian = endian || BE;
		this.bufferSize = bufferSize || Math.pow( 2, 17 );
		this.buffer = Buffer.allocUnsafe( this.bufferSize );
		this.clear();
	}
	clear() {
		this.cursor = 0;
		this.length = 0;
		return this;
	}
	skip( cursor ) {
		if ( this.length < this.cursor + cursor ) {
			throw new RangeError( 'index out of range' );
		}
		this.cursor += cursor;
		return this;
	}
	skipTo( cursor ) {
		if ( this.length < cursor ) {
			throw new RangeError( 'index out of range' );
		}
		this.cursor = cursor;
		return this;
	}
	toBuffer() {
		return this.buffer.slice( 0, this.length );
	}
	write( data ) {
		if ( typeof data === 'string' ) {
			data = Buffer.from( data );
		}
		if ( this.cursor + data.length > this.buffer.length ) {
			throw new RangeError( 'index out of range' );
		}
		for ( var index = 0; index < data.length; index++ ) {
			this.buffer[ this.cursor++ ] = data[ index ];
		}
		this.length = Math.max( this.cursor, this.length );
		return this;
	}
	int8( number ) {
		return this.uint8( number );
	}
	uint8( number ) {
		if ( this.cursor + 1 > this.buffer.length ) {
			throw new RangeError( 'index out of range' );
		}
		this.buffer[ this.cursor++ ] = number & 0xff;
		this.length = Math.max( this.length, this.cursor );
		return this;
	}
	int16( number ) {
		return this.uint16( number );
	}
	uint16( number ) {
		if ( this.cursor + 2 > this.buffer.length ) {
			throw new RangeError( 'index out of range' );
		}
		if ( this.endian === BE ) {
			this.buffer[ this.cursor++ ] = number >>> 8;
			this.buffer[ this.cursor++ ] = number >>> 0;
		} else {
			this.buffer[ this.cursor++ ] = number >>> 0;
			this.buffer[ this.cursor++ ] = number >>> 8;
		}
		this.length = Math.max( this.length, this.cursor );
		return this;
	}
	int32( number ) {
		return this.uint32( number );
	}
	uint32( number ) {
		if ( this.cursor + 4 > this.buffer.length ) {
			throw new RangeError( 'index out of range' );
		}
		if ( this.endian === BE ) {
			this.buffer[ this.cursor++ ] = number >>> 24;
			this.buffer[ this.cursor++ ] = number >>> 16;
			this.buffer[ this.cursor++ ] = number >>> 8;
			this.buffer[ this.cursor++ ] = number >>> 0;
		} else {
			this.buffer[ this.cursor++ ] = number >>> 0;
			this.buffer[ this.cursor++ ] = number >>> 8;
			this.buffer[ this.cursor++ ] = number >>> 16;
			this.buffer[ this.cursor++ ] = number >>> 24;
		}
		this.length = Math.max( this.length, this.cursor );
		return this;
	}
	int64( number ) {
		return this.uint64( number );
	}
	uint64( number ) {
		if ( this.endian === BE ) {
			this.write( number );
		} else {
			this.buffer[ this.cursor++ ] = number[ 7 ];
			this.buffer[ this.cursor++ ] = number[ 6 ];
			this.buffer[ this.cursor++ ] = number[ 5 ];
			this.buffer[ this.cursor++ ] = number[ 4 ];
			this.buffer[ this.cursor++ ] = number[ 3 ];
			this.buffer[ this.cursor++ ] = number[ 2 ];
			this.buffer[ this.cursor++ ] = number[ 1 ];
			this.buffer[ this.cursor++ ] = number[ 0 ];
			this.length = Math.max( this.length, this.cursor );
		}
		return this;
	}
	float( number ) {
		if ( this.cursor + 4 > this.buffer.length ) {
			throw new RangeError( 'index out of range' );
		}
		if ( this.endian === BE ) {
			this.buffer.writeFloatBE( number, this.cursor );
		} else {
			this.buffer.writeFloatLE( number, this.cursor );
		}
		this.length = Math.max( this.length, this.cursor += 4 );
		return this;
	}
	double( number ) {
		if ( this.cursor + 8 > this.buffer.length ) {
			throw new RangeError( 'index out of range' );
		}
		if ( this.endian === BE ) {
			this.buffer.writeDoubleBE( number, this.cursor );
		} else {
			this.buffer.writeDoubleLE( number, this.cursor );
		}
		this.length = Math.max( this.length, this.cursor += 8 );
		return this;
	}
};

module.exports.compile = function( source ) {
	const container = {
		encode: {},
		decode: {},
		storage: {},
		indexes: {},
		findNameByIndex: function( index, value ) {
			if ( this.indexes[ index ] == null ) {
				const table = this.indexes[ index ] = {};
				for ( const name in this.storage ) {
					if ( index in this.storage[ name ] ) {
						table[ this.storage[ name ][ index ] ] = name;
					}
				}
			}
			return this.indexes[ index ][ value ];
		},
	};
	const names = [];
	var encode = [ `( {` ];
	var decode = [ `( {` ];
	for ( const name in source ) {
		if ( source[ name ] instanceof Array ) {
			names.push( name );
			container.storage[ name ] = {};
			encode.push( `${name}: function( buffer, data ) {` );
			decode.push( `${name}: function( buffer ) {` );
			decode.push( `const data = {};` );
			for ( var index = 0; index < source[ name ].length; index++ ) {
				var expr = source[ name ][ index ];
				switch ( typeof expr ) {
				case 'string': {
					if ( expr.startsWith( '.' ) ) {
						index++;
						switch ( expr ) {
						case '.attributes':
							Object.assign( container.storage[ name ], source[ name ][ index ] );
							break;
						}
						break;
					}
					const detail = /^(\s*[$_a-z0-9]*\s*):(\s*[$_a-z0-9]+?\s*)\s*(\[\s*([$_a-z0-9.][$_a-z0-9]*)\s*\]|)\s*$/i.exec( expr );
					if ( detail === null ) {
						encode.push( expr );
						decode.push( expr );
						break;
					}
					const attr = detail[ 1 ] || '_' + index;
					const format = detail[ 2 ];
					const corner = detail[ 4 ];
					if ( corner ) {
						if ( source[ corner ] ) {
							encode.push( `this.${corner}( buffer, data.${attr}.length );` );
						} else {
							if ( parseInt( corner ) == corner.trim() ) {
								encode.push( `data.${attr}.length = ${parseInt(corner)};` );
							} else if ( corner.startsWith( '.' ) ) {
								encode.push( `data.${attr}.length = data${corner};` );
							} else {
								encode.push( `buffer.${corner}( data.${attr}.length );` );
							}
						}
						encode.push( `for( var index = 0; index < data.${attr}.length; index++ )` );
						if ( source[ format ] ) {
							encode.push( `this.${format}( buffer, data.${attr}[ index ] );` );
						} else {
							encode.push( `buffer.${format}( data.${attr}[ index ] );` );
						}

						decode.push( `data.${attr} = [];` );
						if ( source[ corner ] ) {
							decode.push( `for ( var index = 0, length = this.${corner}( buffer ); index < length; index++ )` );
						} else {
							if ( parseInt( corner ) == corner.trim() ) {
								decode.push( `for ( var index = 0, length = ${parseInt(corner)}; index < length; index++ )` );
							} else if ( corner.startsWith( '.' ) ) {
								decode.push( `for ( var index = 0, length = data${corner}; index < length; index++ )` );
							} else {
								decode.push( `for ( var index = 0, length = buffer.${corner}(); index < length; index++ )` );
							}
						}
						if ( source[ format ] ) {
							decode.push( `data.${attr}[ index ] = this.${format}( buffer );` );
						} else {
							decode.push( `data.${attr}[ index ] = buffer.${format}();` );
						}
					} else {
						if ( source[ format ] ) {
							encode.push( `this.${format}( buffer, data.${attr} );` );
							decode.push( `data.${attr} = this.${format}( buffer );` );
						} else {
							encode.push( `buffer.${format}( data.${attr} );` );
							decode.push( `data.${attr} = buffer.${format}();` );
						}
					}
					break;
				}
				case 'function':
					expr = {
						encode: expr,
						decode: expr,
					};
				case 'object':
					if ( expr ) {
						if ( expr.encode ) {
							container.encode[ '_' + name + '_' + index ] = expr.encode;
							encode.push( `this._${name}_${index}( buffer, data );` );
						}
						if ( expr.decode ) {
							container.decode[ '_' + name + '_' + index ] = expr.decode;
							decode.push( `this._${name}_${index}( buffer, data );` );
						}
					}
					break;
				}
			}
			encode.push( `},` );
			decode.push( `return data;` );
			decode.push( `},` );
		} else if ( source[ name ] instanceof Object ) {
			container.encode[ name ] = source[ name ].encode;
			container.decode[ name ] = source[ name ].decode;
		}
	}
	encode.push( `} )` );
	decode.push( `} )` );
	encode = eval( encode.join( '\n' ) );
	decode = eval( decode.join( '\n' ) );
	names.forEach( ( name ) => container.encode[ name ] = encode[ name ] );
	names.forEach( ( name ) => container.decode[ name ] = decode[ name ] );
	return container;
};
