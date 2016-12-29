#环形缓冲区 & 数据包序列化/反序列化

###下载
`
npm install node-smart-buffer
`


###使用
```javascript
const smartbuffer = require( 'node-smart-buffer' );
```

###环形缓冲区InputBuffer/OutputBuffer

```javascript
smartbuffer.InputBuffer.length
smartbuffer.InputBuffer.endain = smartbuffer.LE | smartbuffer.BE;
smartbuffer.InputBuffer.clear()
smartbuffer.InputBuffer.reset()
smartbuffer.InputBuffer.skip( cursor )
smartbuffer.InputBuffer.skipTo( cursor )
smartbuffer.InputBuffer.remaining()
smartbuffer.InputBuffer.read( length )
smartbuffer.InputBuffer.add( arrayBuffer )
smartbuffer.InputBuffer.discard( length )
smartbuffer.InputBuffer.int8()/uint8()
smartbuffer.InputBuffer.int16()/uint16()
smartbuffer.InputBuffer.int32()/uint32()
smartbuffer.InputBuffer.int64()/uint64()(返回buffer)
smartbuffer.InputBuffer.float()
smartbuffer.InputBuffer.double()

smartbuffer.OutputBuffer.length
smartbuffer.OutputBuffer.endain = smartbuffer.LE | smartbuffer.BE;
smartbuffer.OutputBuffer.clear()
smartbuffer.OutputBuffer.skip( cursor )
smartbuffer.OutputBuffer.skipTo( cursor )
smartbuffer.OutputBuffer.toBuffer()
smartbuffer.OutputBuffer.write( arrayBuffer )
smartbuffer.OutputBuffer.int8( number )/uint8( number )
smartbuffer.OutputBuffer.int16( number )/uint16( number )
smartbuffer.OutputBuffer.int32( number )/uint32( number )
smartbuffer.OutputBuffer.int64( buffer )/uint64( buffer )
smartbuffer.OutputBuffer.float( number )
smartbuffer.OutputBuffer.double( number )
```

###包编译格式

```javascript
const packet = smartbuffer.compile( {
	utf8: {
		encode: function( buffer, data ) {
			data = Buffer.from( data );
			buffer.uint16( data.length );
			buffer.write( data );
		},
		decode: function( buffer ) {
			return buffer.read( buffer.uint16() ).toString();
		},
	},
	DEMO: [
		'name:utf8',
		'data:uint8[uint16]',
	],
} );
```

###序列化数据

```javascript
const output = new smartbuffer.OutputBuffer();
packet.encode.DEMO( output, {
	name: 'Job',
	data: [ 1, 2, 3, 4 ],
} );
console.log( output.toBuffer() );
// echo: <Buffer 00 03 4a 6f 62 00 04 01 02 03 04>
```

###反序列化数据

```javascript
const input = new smartbuffer.InputBuffer();
input.add( output.toBuffer() );
console.log( packet.decode.DEMO( input ) );
// echo: { name: 'Job', data: [ 1, 2, 3, 4 ] }
```
