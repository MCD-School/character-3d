var chess = ['king', 'queen', 'bishop', 'knight', 'rook', 'pawn'];
var h = [ 3.785, 3.4, 2.716, 2.648, 2.138, 1.973 ];
var chessSize = 0.25;

function demo() {

    phy.view({ envmap:'room', ground:true })

    phy.set({ substep:2 })

    let grid = new THREE.GridHelper( 8, 8, 0x000000, 0x000000 )
    grid.material.opacity = 0.0001
    grid.position.y = 0.01
    //grid.material.depthWrite = false
    grid.material.transparent = true

    phy.addDirect( grid )

    // add static ground
    //phy.add({ type:'plane', size:[300,1,300], visible:false });
    phy.add({ type:'box', size:[300,1,300], pos:[0, -0.5, 0], visible:false })

    phy.load(['./assets/models/chess.glb'], onComplete );



}

function onComplete(){

    const model = phy.getMesh('chess')

    let m = phy.texture({ url:'./assets/textures/chess.jpg', flip:false, encoding:true })
    phy.material({ name:'B', color:0x343434, roughness: 0.2, metalness: 0.7, map:m })
    phy.material({ name:'W', color:0xcbad7b, roughness: 0.2, metalness: 0.7, map:m })


    let p = [

    { type:'rook', id:1 },
    { type:'knight', id:1, rot:[0,-90,0] },
    { type:'bishop', id:1 },
    { type:'queen', id:0 },
    { type:'king', id:0, rot:[0,90,0] },
    { type:'bishop', id:2},
    { type:'knight', id:2, rot:[0,90,0] },
    { type:'rook', id:2 },

    { type:'pawn', id:1 },
    { type:'pawn', id:2 },
    { type:'pawn', id:3 },
    { type:'pawn', id:4 },
    { type:'pawn', id:5 },
    { type:'pawn', id:6 },
    { type:'pawn', id:7 },
    { type:'pawn', id:8 },

    { type:'pawn', id:1, black:true, decal:[-4*4,0] },
    { type:'pawn', id:2, black:true },
    { type:'pawn', id:3, black:true },
    { type:'pawn', id:4, black:true },
    { type:'pawn', id:5, black:true },
    { type:'pawn', id:6, black:true },
    { type:'pawn', id:7, black:true },
    { type:'pawn', id:8, black:true },
    { type:'rook', id:1, black:true },
    { type:'knight', id:1, black:true, rot:[0,-90,0] },
    { type:'bishop', id:1, black:true, rot:[0,180,0] },
    { type:'queen', id:0, black:true },
    { type:'king', id:0, black:true, rot:[0,90,0] },
    { type:'bishop', id:2, black:true, rot:[0,180,0] },
    { type:'knight', id:2, black:true, rot:[0,90,0] },
    { type:'rook', id:2, black:true }

    ];

    calculatePosition( p )

    let i = p.length
    while(i--) phy.add( addPiece( p[i], i, model ))

}

function calculatePosition ( items ) {

    let cell = [4,8]
    let space = [4,4]
    let center = [-8,0]

    let x = cell[0]
    let z = cell[1]
    let sx = space[0]
    let sz = space[1]
    let dx = ((x*sx)*0.5) - x*0.5
    let dz = ((z*sz)*0.5) - z*0.5
    dz+=2
    let n = 0
    let item

    for(let i = 0; i < x; i++){
    	for(let j = 0; j < z; j++){

            item = items[n]
            if( item.decal !== undefined ){
                dx += item.decal[0]
                dz += item.decal[1]
            }
            item.pos = [ (i*sx)+center[0]-dx, 0, (j*sz)+center[1]-dz ]
            n++
    	}
    }
}

function addPiece ( o, i, model ) {

    var n = chess.indexOf( o.type )

    let name = (o.black ? 'B_' : 'W_') + o.type + ( o.id ? '_' + o.id : '' )

    math.scaleArray( o.pos, chessSize )

    return {

    	name: name, 
    	shape: model[ o.type + '_shape' ].geometry,
    	mesh: model[ o.type ],
    	meshScale: [ chessSize ],
    	material: o.black ? 'B' : 'W', 
    	type: 'convex', 
    	size: [ chessSize ], 
    	pos: [ o.pos[0] || 0,( o.pos[1] || 0) + h[n]*chessSize, o.pos[2] || 0 ], 
    	rot: o.rot || [0,0,0],
    	density: 1,
    	friction:o.friction || 0.5,
    	restitution:0,
    	//rolling:0.9,
    	//damping:[0, 0.5],
    	margin:0.000001,
    	
    }
	

};