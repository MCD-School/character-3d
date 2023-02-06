var bob, trigger, jump = false, oy = 0, vy = 0;

function demo() {

    //log significa inicio. Esta frase aparece a la izquierda de la pantalla cuando se carga el juego
    phy.log('use key WSAD or ZSQD<br>SPACE for jump')

    // setting and start oimophysics
    phy.set({ substep: 4, gravity: [0, -9.81, 0] })


    // add static plane 
    //si cambias el type de 'box' a 'plane' el objeto se aplana cuando cae al suelo.
    //phy.add({ type:'plane', name:'floor', size:[ 300,1,300 ], visible:false });
    phy.add({ type: 'box', name: 'floor', size: [300, 1, 300], pos: [0, -0.5, 0], visible: false })

    // create character
    //si cambias el argumento de type de 'capsule' a 'box' y el argumento de size de [ r,1.8-(2*r) ] a [ 1,1,1 ]... 
    //...la forma del objeto se convierte en un cubo 

    let r = 0.3
    bob = phy.add({
        type: 'box', name: 'bob', material: 'hero',
        size: [1, 1, 1], pos: [0, 3, 0], angularFactor: [0, 1, 0],
        density: 2, damping: [0.01, 0], friction: 0.8, group: 32,
        order: 'YXZ',

    })

    phy.follow('bob', { direct: true, simple: true })

    phy.add({ type: 'contact', b1: 'bob', b2: 'floor', callback: showContact })

    //trigger significa poner en movimiento
    //phy.add({ type:'box', name:'trigger', size:[2, 2, 2], pos:[0,-0.99,-3], material:'debug', mask:32 })
    trigger = phy.add({ type: 'box', name: 'trigger', size: [2, 2, 2], pos: [0, 1, -3], material: 'debug', mask: 0, isTrigger: true })

    phy.add({ type: 'contact', b1: 'bob', b2: 'trigger', callback: triggerContact })

    //si cambio el valor de la variable i cambia el número de cajas de obstáculo que aparecen
    //let i = 0, s,a,d;

    //while(i--){

    //s = math.rand( 0.2, 2 )
    //a = math.rand(-math.Pi, math.Pi)
    //d = 10 + math.rand(1, 5)

    //phy.add({ type:'box', size:[s], pos:[ d * Math.sin(a), (s*0.5), d * Math.cos(a)], rot:[0,a*math.todeg,0], density:math.randInt(0,1)? 0: s })

    //}

    // update after physic step
    phy.setPostUpdate(update)
}

function showContact(d) {

    if (d.hit) bob.material.color.setHex(0x3d0000)
    else bob.material.color.setHex(0x570000)
    if (d.move) bob.mterial.color.setHex(0x0d6b600)

    //console.log('bob collision on floor')
}

function triggerContact(d) {

    if (d.hit) trigger.material.color.setHex(0xFF0000)
    else trigger.material.color.setHex(0xFFFF00)
}

function update() {

    //console.log('done')

    let dt = phy.getDelta()
    let r = phy.getAzimut()
    let key = phy.getKey()

    bob.rotation.y = r

    let rs = key[0]; // Q-D or A-D or left-right
    let ts = key[1]; // Z-S or W-S or up-down

    if (!jump && key[4]) { vy = 30; jump = true; } // SPACE KEY

    if (jump) {

        vy -= 1;
        if (vy <= 0) {
            vy = 0;
            if (bob.position.y === oy) jump = false;
        }

        //


        // if()bob.position.y === oy
    }



    // gravity
    let g = (-9.81) + vy;

    //rs *= -4;
    //rs *= math.torad;

    //var s = Math.abs( bob.rotation.z * math.todeg ) > 0 ? Math.PI : 0;
    //var r = bob.rotation.y - s;

    math.tmpV1.set(rs * 20, g, ts * 20).applyAxisAngle({ x: 0, y: 1, z: 0 }, r);
    //math.tmpV2.set( 0, rs, 0 );
    math.tmpV2.set(0, 0, 0);

    // gravity
    // math.tmpV1.y = -9.81

    //phy.update( { name:'bob', linearVelocity: math.tmpV1.toArray(), angularVelocity: math.tmpV2.toArray(), inTime: true, forceWake:true } );

    phy.update({ name: 'bob', linearVelocity: math.tmpV1.toArray(), angularVelocity: math.tmpV2.toArray(), wake: true });

    oy = bob.position.y;

}

//carga la imagen de paint 3d de microsoft de los diamantes
//phy.load('./assets/models/diamond.glb', onComplete)

//function onComplete() {

    //let list = phy.getMesh('diamond')
    //let mat = {}, n = 0, b, rand = math.rand

    //for (let m in list) {

        //mat[m] = new Diamond({
            //color: n === 0 ? 0xffffff : rand(0x000000, 0xffffff),
           // name: 'diams_' + m,
        //}, {
            //geometry: list[m].geometry,
            //renderer: Main.getRenderer()
        //});

        //n++

    //}

    //n = 4;

    //let bodys = []

    //while (n--) {
        //for (let m in list) {

            //b = phy.add({
                //type: 'convex',
                //shape: list[m].geometry,
                //pos: [rand(-4, 4), rand(3, 20), rand(-4, 4)],
                //density: 1,
                //size: [30],
                //material: mat[m]
            //})

            //bodys.push(b)

        //}

    //}
//}
    
//carga la imagen de paint 3d de microsoft de las piezas de ajedrez
/*phy.load(['./assets/models/chess.glb'], onComplete);

function onComplete() {

    const model = phy.getMesh('chess')

    let m = phy.texture({ url: './assets/textures/chess.jpg', flip: false, encoding: true })
    phy.material({ name: 'B', color: 0x343434, roughness: 0.2, metalness: 0.7, map: m })
    phy.material({ name: 'W', color: 0xcbad7b, roughness: 0.2, metalness: 0.7, map: m })

    phy.add({

        name: 'knight',
        shape: model['knight_shape'].geometry,
        mesh: model['knight'],
        meshScale: [0.25],
        material: 'B',
        type: 'convex',
        size: [0.25],
        pos: [0, 3, 0],
        rot: [0, 0, 0],
        density: 1,
        friction: 0.5,
        restitution: 0,
        //rolling:0.9,
        //damping:[0, 0.5],
        margin: 0.000001,

        })


};

phy.load(['./assets/models/charizard.glb'], onComplete);

function onComplete() {

    const model = phy.getMesh('charizard')

    let m = phy.texture({ url: './assets/textures/chess.jpg', flip: false, encoding: true })
    phy.material({ name: 'B', color: 0x343434, roughness: 0.2, metalness: 0.7, map: m })

    phy.add({

        name: 'Charizard',
        shape: model['Charizard'].geometry,
        mesh: model['Charizard'],
        meshScale: [0.25],
        material: 'B',
        type: 'convex',
        size: [0.25],
        pos: [2,3,1],
        rot: [10, 10, 0],
        density: 1,
        friction: 0.5,
        restitution: 0,
        //rolling:0.9,
        //damping:[0, 0.5],
        margin: 0.000001,

        })

  console.log(model)

};
*/




phy.load(['./assets/models/PokemonPalkia.glb'], onComplete);

function onComplete() {

    const model = phy.getMesh('PokemonPalkia')
    console.log(model)
    let m = phy.texture({ url: './assets/textures/chess.jpg', flip: false, encoding: true })
    phy.material({ name: 'B', color: 0x343434, roughness: 0.2, metalness: 0.7, map: m })

    phy.add({

        name: 'Palkia',
        shape: model['Palkia'].geometry,
        mesh: model['Palkia'],
        meshScale: [0.25],
        material: 'B',
        type: 'convex',
        size: [0.01],
        pos: [1,3,1],
        rot: [50, 50, 0],
        density: 1,
        friction: 0.5,
        restitution: 0,
        //rolling:0.9,
        //damping:[0, 0.5],
        margin: 0.000001,

        })

};

