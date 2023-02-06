
import {
    Group, MeshPhysicalMaterial, MeshBasicMaterial, Vector3
} from '../../build/three.module.js';

import { root, math, mat, Utils } from './root.js';

import { Ray } from './Ray.js';
import { Body } from './Body.js';
import { Solid } from './Solid.js';
import { Joint } from './Joint.js';
import { Contact } from './Contact.js';

import { User } from './User.js';


//--------------
//  THREE SIDE 
//--------------

let callback = null;
let Ar, ArPos = {}, ArMax = 0

let worker = null
let isWorker = false
let isBuffer = false
let isTimeout = true

let directMessage = null
let controls = null
let first = true

const ray = new Ray()
const body = new Body()
const solid = new Solid()
const joint = new Joint()
const contact = new Contact()

const user = new User()

let azimut = function(){ return 0 }
let endReset = function(){}
let postUpdate = function(){}
let extraTexture = function(){}
let extraMaterial = function(){}

export class Motor {

	static setExtraTexture ( f ) { extraTexture = f }
	static setExtraMaterial ( f ) { extraMaterial = f }

	static setPostUpdate ( f ) { postUpdate = f !== null ? f : function(){} }
	static setAzimut ( f ) { azimut = f }

	static getKey () { return user.key }
	static getKey2 () { return user.key2 }
	static getAzimut () { return azimut() }

	static setContent ( Scene ) {

		Scene.add( root.scene )
		Scene.add( root.scenePlus )

	}

	static setControl ( Controls ) { 

		controls = Controls
		azimut = controls.getAzimuthalAngle

	}

	static message ( m ){

		let e = m.data;
		if( e.Ar ) Ar = e.Ar;
		if( e.reflow ) root.reflow = e.reflow
		Motor[ e.m ]( e.o )

	}

	static post ( e, buffer ){

		if( isWorker ){ 

			if ( e.m === 'add' ) root.flow.add.push( e.o )
			else if ( e.m === 'remove' ) root.flow.remove.push( e.o )
			else worker.postMessage( e, buffer )

		} else {

			directMessage( { data : e } )

		}

	}

	static makeView () {

	}

	static getScene () { return root.scene; }

	static getMat () { return mat; }

	static init ( o = {} ){

		let type = o.type || 'OIMO';
		let name = type.toLowerCase()
		let mini = name.charAt(0).toUpperCase() + name.slice(1)
		let st = ''

		let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

		body.extraConvex = o.extraConvex || false

		if( o.callback ){ 
			callback = o.callback
			delete ( o.callback )
		}

		this.initArray()
		o.ArPos = ArPos
		o.ArMax = ArMax

		root.scene = new Group()
		root.scenePlus = new Group()

		root.post = this.post

		if( !o.direct ){ // is worker version

			

			switch( type ){

				case 'OIMO':

				    if( isFirefox ) worker = new Worker( './build/'+mini+'.min.js' )
				    else {
				    	try {
					        worker = new Worker('./build/'+mini+'.module.js', {type:'module'})
						    st = 'ES6'
						} catch (error) {
						    worker = new Worker( './build/'+mini+'.min.js' )
						}
				    }

				break

				/*case 'ODE':

					name = type.toLowerCase()
				    mini = name.charAt(0).toUpperCase() + name.slice(1)

				    o.blob = document.location.href.replace(/\/[^/]*$/,"/") + './build/'+name+'.js'
					worker = new Worker( './build/'+mini+'.min.js' );

				break

				case 'NRJ':

					name = type.toLowerCase()
				    mini = name.charAt(0).toUpperCase() + name.slice(1)

				    o.blob = document.location.href.replace(/\/[^/]*$/,"/") + './build/energy.js'
				    o.blob = document.location.href.replace(/\/[^/]*$/,"/") + './build/nrj.js'
					worker = new Worker( './build/'+mini+'.min.js' );

				break*/
				
				default :

				    o.blob = document.location.href.replace(/\/[^/]*$/,"/") + './build/'+name+'.wasm.js'
					worker = new Worker( './build/'+mini+'.min.js' );

				break

			}

			worker.postMessage = worker.webkitPostMessage || worker.postMessage;
			worker.onmessage = Motor.message;

			let ab = new ArrayBuffer( 1 );
			worker.postMessage( { m: 'test', ab: ab }, [ ab ] );
			isBuffer = ab.byteLength ? false : true;

			o.isBuffer = isBuffer;
			console.log( st  + ' Worker '+ type + (o.isBuffer ? ' with Shared Buffer' : '') );

			isWorker = true;

		} else { // is direct version

			directMessage = o.direct;
			o.returnMessage = Motor.message;
			console.log( type + ' is direct' );

		}

		root.engine = type
		this.post({ m:'init', o:o });

	}

	static pause (){

		this.post({ m:'pause' })

	}

	static flowReset ( ){

		root.flow = { tmp:[], key:[], add:[], remove:[] }

	}

	static reset ( callback ){

		if( first ){
			first = false
			callback()
			return
		}

		if( controls ) controls.resetAll()

		endReset = callback

		postUpdate = function () {}

		this.flowReset()

		ray.reset()
		body.reset()
		solid.reset()
		joint.reset()
		contact.reset()

		let i, name

		// clear temporary mesh
		for( i in root.tmpMesh ) {
			if( root.tmpMesh[i].dispose ) root.tmpMesh[i].dispose()
			else root.scene.remove( root.tmpMesh[i] )
		}
		root.tmpMesh = []

		// clear temporary geometry
		for( i in root.tmpGeo ) root.tmpGeo[i].dispose()
		root.tmpGeo = []

	    // clear temporary material
		for( i in root.tmpMat ){ 
			name = root.tmpMat[i];
			if( mat[name] ){
				mat[name].dispose()
				delete ( mat[name] )
			}
		}
		root.tmpMat = []

		// clear temporary textures
		for( i in root.tmpTex ) root.tmpTex[i].dispose()
		root.tmpTex = []


	    root.scenePlus.children = []
	    root.scene.children = []

		this.post({ m:'reset' });

	}

	static resetCallback (){

		endReset()

	}

	static ready (){

		console.log( 'Motor is ready !!' )
		if( callback ) callback()

	}

	static start ( o = {} ){

		Motor.post({ m:'start', o:o })

	}

	static setTimeout ( b ){ isTimeout = b; }
	static getTimeout ( b ){ return isTimeout }

	static set ( o = {} ){

		o.isTimeout = isTimeout;
		if(!o.gravity) o.gravity = [0,-9.81,0]
		if(!o.substep) o.substep = 2
		if(!o.fps) o.fps = 60

		Motor.post({ m:'set', o:o });

	}

	static getFps (){ return root.reflow.stat.fps }
	static getDelta (){ return root.reflow.stat.delta }

	static step ( o ){

		Motor.stepItems()

		// user key interaction 
		root.flow.key = user.update()
		//root.flow.tmp = []

		postUpdate()

		// for update static object !!! 
		//let i = root.flow.tmp.length;
		//while( i-- ) this.change( root.flow.tmp[i], true )
		this.changes( root.flow.tmp )

		// finally post flow change to physx
		if( isBuffer ) root.post( { m:'poststep', flow:root.flow, Ar:Ar }, [ Ar.buffer ] )
		else root.post( { m:'poststep', flow:root.flow, Ar:Ar })

		Motor.flowReset()

	}

	static stepItems () {

		body.step( Ar, ArPos.body );
		joint.step( Ar, ArPos.joint )
		ray.step( Ar, ArPos.ray )
		contact.step( Ar, ArPos.contact )

		// update follow camera
		if( controls ) controls.follow( this.getDelta() )

	}

    static up ( list ) {

		//if( list instanceof Array ) root.flow.tmp = root.flow.tmp.concat(list)
		if( list instanceof Array ) this.changes( list, true )
		else this.change( list, true )

	}

	static update ( list ) {

		//if( list instanceof Array ) root.flow.tmp = root.flow.tmp.concat(list)
		if( list instanceof Array ) root.flow.tmp.push( ...list )
		else root.flow.tmp.push( list )

	}

	static initArray ( max = {} ) {

		let counts = {
			body: ( max.body || 1000 ) * 11,
            joint:( max.joint || 100 ) * 16,
            ray:( max.ray || 50 ) * 8,
            contact:( max.contact || 50 ) * 8
		}

        let prev = 0;

        for( let m in counts ){ 

            ArPos[m] = prev
            ArMax += counts[m]
            prev += counts[m]

        }

	}

	static adds ( r = [] ){ for( let o in r ) this.add( r[o] ) }

	static add ( o = {} ){

		if ( o.constructor === Array ) return this.adds( o )

		let type = o.type || 'box', b;

		if( o.mass !== undefined ) o.density = o.mass
		if( o.bounce !== undefined ) o.restitution = o.bounce

		switch( type ){

			case 'ray': b = ray.add( o ); break;
			case 'joint': b = joint.add( o ); break;
			case 'contact': b = contact.add( o ); break;
			default: 
			    if ( !o.density && !o.kinematic ) b = solid.add( o );
			    else b = body.add( o ); 
			break;
			
		}

		return b

	}


	static removes ( r = [] ){ for( let o in r ) this.remove( r[o] ) }
	
	static remove ( name ){

		if ( name.constructor === Array ) return this.removes( o )

		let b = this.byName( name )
		if( b === null ) return;
		let type = b.type

		switch( type ){
			
			case 'ray': b = ray.clear( b ); break;
			case 'joint': b = joint.clear( b ); break;
			case 'contact': b = contact.clear( b ); break;
			case 'solid': b = solid.clear( b ); break;
			case 'body': b = body.clear( b ); break;

		}
		
		root.post( { m:'remove', o:{ name:name, type:type } })

	}


	static changes ( r = [], direct = false ){ for( let o in r ) this.change( r[o], direct ) }

	static change ( o = {}, direct = false ){

		//if ( o.constructor === Array ) return this.changes( o )

		let b = this.byName( o.name );
		if( b === null ) return null;
		let type = b.type;

		if( o.rot !== undefined ){ o.quat = math.toQuatArray( o.rot ); delete ( o.rot ); }
		if( o.localRot !== undefined ){ 

			o.quat = math.toLocalQuatArray( o.localRot, b ); delete ( o.localRot ); 
		}

		switch( type ){

			//case 'joint': b = joint.set( o, b ); break;
			case 'solid': b = solid.set( o, b ); break;
			case 'ray': b = ray.set( o, b ); direct = false; break;
			//case 'body': b = body.set( o, b ); break;

		}
		
		if( direct ) root.post( { m:'change', o:o })

	}

	static addDirect ( b ){

		root.scene.add( b )
		root.tmpMesh.push( b )

	}

	static texture ( o = {} ){

		let t = extraTexture( o )
		root.tmpTex.push( t )
		return t
	}

	static material ( o = {} ){

		let m
		if( o.isMaterial ) m = o
		else m = new MeshPhysicalMaterial( o )

		

		if( mat[ m.name ] ) return null;

		root.tmpMat.push( m.name );
		mat[ m.name ] = m;

		extraMaterial( m )

		return m;

	}

	static byName ( name ){

		return Utils.byName( name )

	}

	static getAllBody ( name ){

		return body.list

	}

	static explosion ( position = [0,0,0], radius = 10, force = 100 ){

		let r = []
	    let pos = new Vector3().fromArray( position )
	    let dir = new Vector3()
	    let i = body.list.length, b, scaling

	    while( i-- ){

	        b = body.list[i]
	        dir.copy( b.position ).sub( pos )
	        scaling = 1.0 - dir.length() / radius
	        if ( scaling < 0 ) continue;
	        dir.setLength( scaling )
	        dir.multiplyScalar( force )

	        //r.push({ name:b.name, impulse: [ ...pos.toArray(), ...dir.toArray()] })
	        r.push({ name:b.name, linearImpulse: dir.toArray() })

	    }

		this.update( r )

	}


	// CAMERA CONTROLS

	static setCamera ( o = {} ){

		controls.moveCam( o )

	}

	static follow ( m = '', o = {} ){

		let mesh = null;

		if ( typeof m === 'string' || m instanceof String ) mesh = m === '' ? null : this.byName( m )
		else if ( m.isMesh || m.isGroup ) mesh = m

		if( mesh === null ) controls.resetFollow()
		else controls.startFollow( mesh, o )

	}


}