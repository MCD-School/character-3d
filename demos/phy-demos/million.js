
var py = 8
var a = 0;
var open1 = false;
var open2 = false;
var yellow = false;
var timer = null
var game = 'start';
var result = []
var balls = [];
var startPos = []
var model = null

var tmpCanvas = document.createElement('canvas')
tmpCanvas.width = tmpCanvas.height = 128


function demo() {

    phy.log( 'SPACE to restart' )

	phy.view({
		envmap:'beach',
	})

	// setting and start oimophysics
	phy.set({ 
		substep:8,
		gravity:[0,-9.81,0],
	})

	phy.load(['./assets/models/million.glb'], onComplete )

}

function onComplete(){

	model = phy.getMesh('million')

    makeMachine()
    makeBall ()

    timer = setTimeout( activeBall, 3000 );

}

function activeBall () {

	let i = balls.length, r = [];
	while(i--){

		r.push({ name: balls[i].name, wake:true })

	}

	phy.up( r )

    timer = setTimeout( startSimulation, 3000 )
}

function replay () {

    phy.setPostUpdate ( null )

    game = 'start'

    a = 0
    yellow = false
    open1 = false
    open2 = false

    let r = [

        { name:'L_pale1', rot:[0,0,a+45], reset:true },
        { name:'L_pale2', rot:[0,0,-a],   reset:true },
        { name:'M_pale1', rot:[0,0,a+45], reset:true },
        { name:'M_pale2', rot:[0,0,-a],   reset:true },

        { name:'block1', pos:[ 0, -4.87+py, open1 ? -1 : 0 ] },
        { name:'block2', pos:[ 8.5, -4.87+py, open2 ? -1 : 0  ]}

    ]

    result = []
    onReset ()
    
    let i = balls.length;
    while(i--){
        r.push({ name: balls[i].name, sleep:true, pos:startPos[i], rot:[0,0,0], reset:true })
    }

    phy.up( r )

    timer = setTimeout( activeBall, 3000 )

}

function onReset () {

	console.log( 'bye bye' )

    if( timer !== null ) clearTimeout( timer )
    timer = null

}

function update () {

    let key = phy.getKey()
    if( key[4] === 1 ) replay()

	a+=1

	let r = [

        { name:'L_pale1', rot:[0,0,a+45], reset:true },
        { name:'L_pale2', rot:[0,0,-a],   reset:true },
        { name:'M_pale1', rot:[0,0,a+45], reset:true },
        { name:'M_pale2', rot:[0,0,-a],   reset:true },

        { name:'block1', pos:[ 0, -4.87+py, open1 ? -1 : 0 ] },
        { name:'block2', pos:[ 8.5, -4.87+py, open2 ? -1 : 0  ]}

    ]

    phy.update( r )

    if( game !== 'wantBall' ) return

    let i = balls.length, b
	while(i--){

		b = balls[i]
		if( result.indexOf( b.name ) === -1 ){
			if( b.position.y < (-5.4+py) ) haveBall( b.name );
		}

	}

}

function startSimulation () {

	phy.setPostUpdate ( update )
    timer = setTimeout( wantBall, 12000 );

}

function wantBall () {

	game = 'wantBall';

    if( yellow ) open2 = true;
    else open1 = true;
	

}

function haveBall ( name ) {

	game = 'haveBall'

	open1 = false
	open2 = false
	
	result.push( name )

	if( result.length<5 ){
		timer = setTimeout( wantBall, 6000 )
	} else if(result.length<7){
        yellow = true
        timer = setTimeout( wantBall, 6000 )
    } else {
		phy.log( result )
	}

}

function makeMachine () {

    var friction = 0.5;
    var bounce = 0.0;

    let meshs = [ 
	    'L_roll', 'L_back', 'L_front', 'L_rampe', 'L_pale1', 'L_pale2',
	    'M_roll', 'M_back', 'M_front', 'M_rampe', 'M_pale1', 'M_pale2'
     ]
    let i = meshs.length, name, p, d, m

    phy.add({ 
        name:'block1', type:'box', density:0, material:'glass',
        size:[1,0.2,1], pos:[0,-4.87+py,0],
        friction: 0, restitution: 0,
        renderOrder:2,
        shadow: false,
    })

    phy.add({ 
        name:'block2', type:'box', density:0, material:'glass',
        size:[1,0.2,1], pos:[8.5,-4.87+py,0],
        friction: 0, restitution: 0,
        renderOrder:3,
        shadow: false,
    });

    while(i--){

    	name = meshs[i]
        p = name==='L_pale1' || name==='M_pale1'
        d = name==='M_rampe' ? 0 : -1.8

    	phy.add({ 
	        name:name, type:'mesh', density:0,
	        size:[10],
	        meshScale:[10],
	        mesh:model[name],
	        shape:model[name].geometry,
	        material:'glass',
	        friction: friction, restitution: bounce,
	        pos: i>5 ? [8.5,d+py,0] : [0,py,0],
	        rot: p ? [0,0,45]:[0,0,0],
	        renderOrder:4+i,
	        shadow: false,
	    })
    }

}

function makeBall () {

	let ballGeo = model.ball.geometry.clone()
	ballGeo.scale(100,100,100) 

    // add red balls
    
    var i, x, y, l, b, tmpMat, j = 0;

    for( i = 0; i < 50; i++){

        tmpMat = phy.material({
            name:'loto'+i,
            roughness: 0.4,
            metalness: 0.6,
            map: createBallTexture( i+1 )
        })

        l = Math.floor(i/10)
        x = -27 + (j*6)
        y = 75 - (l*5.)

        b = phy.add({ 
        	name:'b'+(i+1), type:'sphere', material: tmpMat, geometry:ballGeo,
        	size:[0.25], pos:[x*0.1, (y*0.1)+py, -1.16], density:0.65,
        	friction: 0.5, restitution: 0.3,
        	sleep:true,
        });
        balls.push( b )
        startPos.push( [x*0.1, (y*0.1)+py, -1.16] )
        j++;
        if(j===10) j = 0;

    }

    // add yellow balls
    
    j = 0;
    for( i = 0; i < 12; i++){

        tmpMat = phy.material({
            name:'lotox'+i,
            roughness: 0.4,
            metalness: 0.6,
            map: createBallTexture(  i+1, true )
        })

        l = Math.floor(i/6)
        x = 70 + (j*6)
        y = 25 - (l*5)

        b = phy.add({ 
            name:'x'+(i+1), type:'sphere', material: tmpMat, geometry:ballGeo,
            size:[0.25], pos:[x*0.1, (y*0.1)+py, -0.975], density:0.65,
            friction: 0.5, restitution: 0.3, 
            sleep:true,
        })
        balls.push( b )
        startPos.push( [x*0.1, (y*0.1)+py, -0.975] )
        j++;
        if(j===6) j = 0;

    }

}




function createBallTexture ( n, y ){

    //var old = view.getTexture('ball_' + n + (y ? 'R':'Y'));
    //if( old !== null ) return old;

	ctx = tmpCanvas.getContext("2d");

    ctx.clearRect(0, 0, 128, 128);

	ctx.beginPath();
	ctx.rect(0, 0, 128, 128);
	ctx.fillStyle = y ? "#e1c75f" : "#c35839";
	ctx.fill();
    
    ctx.beginPath();
	ctx.arc(55, 64, 40, 0, 2 * Math.PI);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill();

	ctx.beginPath();
	ctx.arc(73, 64, 40, 0, 2 * Math.PI);
	ctx.fill();

	ctx.beginPath();
	ctx.rect(55, 24, 18, 80);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = "#000000";
	ctx.textAlign = "center";
	ctx.font = 'bold 48px Arial';
	ctx.fillText( n, 64, 80 );

    var img = new Image(128, 128);
    img.src = tmpCanvas.toDataURL( 'image/png' );

	var t = new THREE.Texture( img );
	t.needsUpdate = true;
	t.flipY = false;
    t.name = 'ball_' + n + (y ? 'R':'Y');
    t.encoding = THREE.sRGBEncoding;

	return t;

}