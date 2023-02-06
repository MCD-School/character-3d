function demo() {

    phy.set({
        substep:2,
        gravity:[0,-9.81,0],
    })

    phy.add({ type:'plane' });

    addTower({ radius:1, height:18, size:[0.1, 0.2], detail:16, density:0.4 });

};

function addTower( o ){

    let tx, ty, tz;
    let detail =  o.detail === "undefined" ? 10 : o.detail;
    let density =  o.density === "undefined" ? 1 : o.density;

    if(o.pos){
        tx = o.pos[0]; ty = o.pos[1]; tz = o.pos[2]
    } else {
        tx = ty = tz = 0;
    }

    let px, py, pz, angle, rad
    let radius = o.radius || 1
    let height = o.height || 1
    let sx = o.size[0] || 1, sy = o.size[1] || 1, sz = radius * 6 / detail

    for(let j = 0; j < height; j++){
        for(let i = 0; i < detail; i++){

            rad = radius;
            angle = (Math.PI * 2 / detail * (i + (j & 1) * 0.5))
            px = tx + Math.cos(angle) * rad;
            py = (ty + sy + j * sy) - (sy*0.5)
            pz = tz - Math.sin(angle) * rad

            phy.add({

                type:"box",
                radius:0.01,
                size:[sx,sy,sz],
                pos:[px,py,pz],
                rot:[0,angle*(180 / Math.PI),0],
                density:density,
                restitution:0.1, 
                friction:0.5,
                sleep:true,


            });
        }
    }
}