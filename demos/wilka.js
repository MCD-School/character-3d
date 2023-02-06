var bob, trigger, jump = false, oy = 0, vy = 0;

function demo() {



   var chess = ['king', 'queen', 'bishop', 'knight', 'rook', 'pawn'];
   var chessSize = 0.25;


    //phy.add({ type:'plane', size:[300,1,300], visible:false });
    phy.add({ type:'box', size:[300,1,300], pos:[0, -0.5, 0], visible:false })

    phy.load(['./assets/models/chess.glb'], onComplete );


function onComplete(){

    const model = phy.getMesh('chess')

    let m = phy.texture({ url:'./assets/textures/chess.jpg', flip:false, encoding:true })
    phy.material({ name:'B', color:0x343434, roughness: 0.2, metalness: 0.7, map:m })
    phy.material({ name:'W', color:0xcbad7b, roughness: 0.2, metalness: 0.7, map:m })


    phy.add({

    	name: 'queen', 
    	shape: model['queen_shape' ],
    	mesh: model[ 'queen' ],
    	meshScale: [ 0.25 ],
    	material:'W', 
    	type: 'convex', 
    	size: [ 0.25 ], 
    	pos: [3,0,3 ], 
    	rot: [0,0,0],
    	density: 1,
    	friction: 0.5,
    	restitution:0,
    	//rolling:0.9,
    	//damping:[0, 0.5],
    	margin:0.000001,
    	
    })
	

};






phy.add({ type:'', name:'floor', size:[300,1,300], pos:[0, -0.5, 0], visible:false })

phy.set({ substep:4, gravity:[0,-9.81,0] })


	// add static plane 
	//phy.add({ type:'plane', name:'floor', size:[ 300,1,300 ], visible:false });
	phy.add({ type:'box', name:'floor', size:[300,1,300], pos:[0, -0.5, 0], visible:false })

   // create character
   let r = 0.3
   bob = phy.add({ 
       type:'box', name:'bob', material:'hero', 
       size:[ r,1.8-(2*r) ], pos:[0,3,0], angularFactor:[0,1,0], 
       density:2, damping:[0.01,0], friction:0.8, group:32, 
       size:[1,1,1],
       order:'YXZ',
   })

   phy.follow('bob', { direct:true, simple:true })

   phy.add({ type:'contact', b1:'bob', b2:'floor', callback: showContact })

   //phy.add({ type:'box', name:'trigger', size:[2, 2, 2], pos:[0,-0.99,-3], material:'debug', mask:32 })
   trigger = phy.add({ type:'box', name:'trigger', size:[2, 2, 2], pos:[0,1,-3], material:'debug', mask:0, isTrigger:true  })

   phy.add({ type:'contact', b1:'bob', b2:'trigger', callback: triggerContact })

   let i = 200, s,a,d;
   
   while(i--){

       s = math.rand( 0.2, 2 )
       a = math.rand(-math.Pi, math.Pi)
       d = 10 + math.rand(1, 5)
       
       phy.add({ type:'', size:[s], pos:[ d * Math.sin(a), (s*0.5), d * Math.cos(a)], rot:[0,a*math.todeg,0], density:math.randInt(0,1)? 0: s })

   }

   // update after physic step
   phy.setPostUpdate ( update )

}



function showContact ( d ) {

   if( d.hit ) bob.material.color.setHex( 0x50F100 )
   else bob.material.color.setHex( 0x00FF88 ) 

   //console.log('bob collision on floor')
}

function triggerContact ( d ) {

   if( d.hit ) trigger.material.color.setHex( 0xDD1111 )
   else trigger.material.color.setHex( 0xDDDD11 )

   //console.log('bob collision on trigger')
}

function update () {

   //console.log('done')

   let dt = phy.getDelta()
   let r = phy.getAzimut()
   let key = phy.getKey()

   bob.rotation.y = r

   let rs = key[0]; // Q-D or A-D or left-right
   let ts = key[1]; // Z-S or W-S or up-down

   if( !jump && key[4] ){ vy = 30; jump = true; } // SPACE KEY

   if( jump ){

       vy-=1;
       if(vy <= 0 ){ 
           vy = 0; 
           if( bob.position.y === oy ) jump = false;
       }

       //
        

       // if()bob.position.y === oy
    }



   // gravity
   let g = (-9.81) + vy;

   //rs *= -4;
   //rs *= math.torad;

  // var s = Math.abs( bob.rotation.z * math.todeg ) > 0 ? Math.PI : 0;
   //var r = bob.rotation.y - s;

   math.tmpV1.set( rs*20, g, ts*20 ).applyAxisAngle( { x:0, y:1, z:0 }, r );
   //math.tmpV2.set( 0, rs, 0 );
   math.tmpV2.set( 0, 0, 0 );

   // gravity
  // math.tmpV1.y = -9.81

   //phy.update( { name:'bob', linearVelocity: math.tmpV1.toArray(), angularVelocity: math.tmpV2.toArray(), inTime: true, forceWake:true } );

   phy.update( { name:'bob', linearVelocity: math.tmpV1.toArray(), angularVelocity: math.tmpV2.toArray(), wake:true } );

   oy = bob.position.y;

   

}
