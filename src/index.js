"use strict";

// External Deps
const { Connection, normalizeSuiAddress, JsonRpcProvider, getTransactionEffects, Network } = require('@mysten/sui.js');

const { GroupList, FieldFormatTable } = require("./format_tbl");

require('isomorphic-fetch');

// Const
const BASE_SUFFIX = '@sui';

const Okay = 200;
const ErrorNotFound = 404;
const ErrorUnknow = 500;

class SuiDomainObject {
	constructor(records) {
		this.records=records?records:{};
		this.fields={};
		
		if( this.records && this.records.data && this.records.data.data ){
			for( let cur of this.records.data.data ){
				this.fields[cur.name]=cur.value;
			}
		}
	}
	
	address()	{return this.record('SUI');}
	avatar()	{return this.record('avatar')}
	url()		{return this.record('url')}
	email()		{return this.record('email')}
	
	discord()	{return this.record('com.discord')}
	github()	{return this.record('com.github')}
	reddit()	{return this.record('com.reddit')}
	twitter()	{return this.record('com.twitter')}
	telegram()	{return this.record('com.telegram')}

	record(name){
		return this.fields[name]?this.fields[name]:'';
	}

}

class SuiDomain {

	constructor(opts = {}) {

		//Init params
		this._network = opts && opts.network ? opts.network : 'mainnet';

		switch( this._network ){
		case	'mainnet':
			this._nodeUrl='https://fullnode.mainnet.sui.io';
			this._contractAddress='0x777821c78442e17d82c3d7a371f42de7189e4248e529fe6eee6bca40ddbb';
			break;
		case	'testnet':
			this._nodeUrl='https://fullnode.testnet.sui.io';
			this._contractAddress='0x23c1d988e3abfc616040ac9a2f32132ff72113703bb062cb8d5da14e00311c97';
			this._globalMapObject='0x5c9da6b91e2fe91452bb10c905d7135608f968e82a65c32d443dbe91a1719112';
			break;
		case	'devnet':
			this._nodeUrl='https://fullnode.devnet.sui.io';
			this._contractAddress='0x2d077874f4169a1e22889ad85128512bc726bb1af05ac077fd21f8f6c5b37191';
			this._globalMapObject='0x361c04b92b6c14aa5df3ca84d0c34bb0bbb6f5c289f685a7f36e0d47671b8b47';
			break;
		default:
			console.warn(`SuiDomain: Unknow Network setting on ${this._network} `);
			break;
		}

		if( opts && opts.nodeUrl ){
			this._nodeUrl = opts.nodeUrl;
		}

		if( opts && opts.contractAddress ){
			this._contractAddress = opts.contractAddress;
		}

		if( opts && opts.globalMapObject ){
			this._globalMapObject = opts.globalMapObject;
		}

		//Init handles
		this._client = new JsonRpcProvider(new Connection({
			fullnode: this._nodeUrl,
		}),{
			websocketClient:false,
			WITH_CREDENTIALS:false
		});
	}

	_process_domain(domain) {
		return domain ? domain.toLowerCase().replace(BASE_SUFFIX, '') : '';
	}

	_isAddress(val) {
		return val?(val.startsWith('0x') && val.length>=20):false;
	}

	_isSuiDomain(val) {
		return val?val.toLowerCase().endsWith(BASE_SUFFIX):false;
	}

	format_domain_data(cur) {

		if( !cur || !cur.data || !cur.data.fields || !cur.data.fields.contents )
			return cur;

		cur.addr = "0x0";
		
		cur.data.data=[];

		for(let x of cur.data.fields.contents){
			let dt=x.fields;
			let format=FieldFormatTable[dt.key];
			
			//subdomains
			if( dt.key>=100000001 && dt.key<=100010001 ){
				format=FieldFormatTable[100000001];
			}

			if(format){
				dt.name=format.name;
				dt.type=format.type;
				dt.group=format.group;
				if( dt.type=='hexnumber' ){
					dt.value=Buffer.from(dt.value).readUInt32LE(0)+'';
				}
				else{
					dt.value=Buffer.from(dt.value).toString();
				}

				switch(dt.type){
				case	'string':	if(dt.value.startsWith('string::')) dt.value=dt.value.replace('string::',''); break;
				//case	'number':	dt.value=Number(dt.value); break;
				case	'unixtime':	dt.value=new Date(parseInt(dt.value)*1000).format('Y-M-d h:m:s');	break;
				}
			}else{
				dt.name='Unknow';
				dt.type='Unknow';
			}
			
			//sui address
			if( dt.key==1 ){
				cur.addr=dt.value;
			}

			cur.data.data.push(dt);
		}

		return cur;
	}
	
	async getObject(object_id){

		var ret;
		try{
			ret=await this._client.getObject({
				id: object_id, 
				options: { showContent: true }
			});
			if( !ret )
				return null;
			if( ret.data && ret.data.content )
				return ret.data.content.fields;
		}
		catch(e){
			console.error(e);
			return null;
		}
		return null;
	}


	str_to_u8arr(str){
		let vec=[];
		let buf=Buffer.from(str);
		let len=buf.length;
		for(let x=0;x<len;x++){
			vec.push(buf[x]);
		}
		return vec
	}

	async _get_globalmap() {
		try {
			//If init
			if (this._globalMap) return this._globalMap;

			const res = await this.getObject(this._globalMapObject);
			if( res ){
				this._globalMap = res;
			}
			return this._globalMap;
		} catch (e) {
			//Failed to get global map
		}
		return this._globalMap;
	}

	//domain => address
	async lookup(domain, cb) {

		if( this._isAddress(domain) ){
			let ret = { status: 200, address: domain };
			if(cb) cb(ret);
			return ret;
		}

		let ret = { status: ErrorUnknow, address: null };

		try {
			let globalmap = await this._get_globalmap();

			domain = this._process_domain(domain);

			const cur = await this._client.getDynamicFieldObject({
				parentId:globalmap.domain2addr.fields.id.id,
				name:{type:'vector<u8>',value:this.str_to_u8arr(domain)},
			});

			if( !cur || !cur.data ) {
				//not found
				ret = { status: ErrorNotFound, address: null };
			} else {
				//found
				ret = { status: Okay, address: cur.data.content.fields.value };
			}
		} catch (e) {
			//not found

			if (e.status == ErrorNotFound) ret = { status: ErrorNotFound, address: null };
		}
		if (cb) cb(ret.status, ret.address);
		return ret;
	}

	//address => domain
	async reverse(address, cb) {

		if( this._isSuiDomain(address) ){
			let ret = { status: Okay, domain: address };
			if(cb) cb(ret);
			return ret;
		}

		let ret = { status: ErrorUnknow, domain: null };

		try {
			let globalmap = await this._get_globalmap();

			const name = await this._client.getDynamicFieldObject({
				parentId:globalmap.addr2domain.fields.id.id,
				name:{type:'address',value:address},
			});

			if (!name) {
				//not found
				ret = { status: ErrorNotFound, name: null };
			} else {
				let namt_str = Buffer.from(name.data.content.fields.value).toString('utf8');
				if (namt_str == "") ret = { status: 502, domain: null };else ret = { status: Okay, domain: namt_str + BASE_SUFFIX };
			}
		} catch (e) {
			console.error(e);

			//not found
			if (e.status == ErrorNotFound) ret = { status: ErrorNotFound, domain: null };
		}
		if (cb) cb(ret.status, ret.domain);
		return ret;
	}
	
	async getDomainObj(domain_or_address, cb) {
		
		let ret = await this.reverse(domain_or_address);

		if( !ret || ret.status!=Okay )
			return null;

		let domain=ret.domain;

		if( cb ){
			await this.getDomainRecord(domain,function(ret){
				if( ret.status==Okay && ret.record )
					cb( new SuiDomainObject(ret.record) );
				else
					cb( null );
			});
		}
		else{
			let ret=await this.getDomainRecord(domain);
			if( ret.status==Okay && ret.record )
				return new SuiDomainObject(ret.record);
			return null;
		}
	}

	//get all records from domain
	async getDomainRecord(domain, cb) {
		try {
			let globalmap = await this._get_globalmap();

			domain = this._process_domain(domain);

			const obj = await this._client.getDynamicFieldObject({
				parentId:globalmap.domains.fields.id.id,
				name:{type:'vector<u8>',value:this.str_to_u8arr(domain)},
			});

			if (!obj) {
				if (cb) cb(ErrorNotFound, null);
				return { status: ErrorNotFound, record: null };
			}

			let domainObject=obj.data.content.fields.value.fields;

			domainObject = this.format_domain_data(domainObject);

			if (cb) cb(Okay, domainObject);
			return { status: Okay, record: domainObject };
		} catch (e) {
			if (e.status == ErrorNotFound) {
				if (cb) cb(ErrorNotFound, null);
				return { status: ErrorNotFound, record: null };
			}
			console.error(e);
		}
		return { status: ErrorUnknow, record: null };
	}

}

module.exports = {
	SuiDomain,
	SuiDomainObject
};