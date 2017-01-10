#环形缓冲区 & 数据包序列化/反序列化

###安装
`
npm install node-smart-buffer
`

###InputBuffer/OutputBuffer

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

###示例

```javascript

// 引用
const smartbuffer = require( 'node-smart-buffer' );

// 编译包
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
        '@attribute',                 // 自动命名 _0
        {                             // 自动命名 _1
            index: 100,               // 设置索引
            a: 1,
            b: 2,
            c: 3,
        },
        'name:utf8',                  // 自动命名 _2
        'data:uint8[uint16]',         // 自动命名 _3
        ':DEMO2',                     // 自动命名 _4
        {
            encode: function( buffer, data ) {
                // 仅当序列化时调用
                console.log( 'DEMO.encode' );
            },
            decode: function( buffer, data ) {
                // 仅当反序列化时调用
                console.log( 'DEMO.decode' );
            },
        },
        `if ( data.name === "Job" ) {`,     // 直接使用
            'a:uint32',
        `}`,
    ],
    DEMO2: [
        'value:utf8',
    ],
} );

// 序列化数据
const output = new smartbuffer.OutputBuffer();
packet.encode.DEMO( output, {
    name: 'Job',
    data: [ 1, 2, 3, 4 ],
    _4: {
        value: 'DEMO2',
    },
    a: 2,
} );
console.log( output.toBuffer() );
/*
输出:
DEMO.encode
<Buffer 00 03 4a 6f 62 00 04 01 02 03 04 00 05 44 45 4d 4f 32 00 00 00 02>
*/

// 反序列化数据
const input = new smartbuffer.InputBuffer();
input.add( output.toBuffer() );
console.log( packet.decode.DEMO( input ) );
/*
输出:
DEMO.decode
{ name: 'Job',
  data: [ 1, 2, 3, 4 ],
  _4: { value: 'DEMO2' },
  a: 2 }
*/

// 索引
console.log( packet.indexed );
// { '100': 'DEMO' }

// 自定义属性
console.log( packet.attribute );
// { DEMO: { index: 100, a: 1, b: 2, c: 3 }, DEMO2: {} }
```
