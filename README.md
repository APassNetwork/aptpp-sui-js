# SDK for APass SUI

## Install
```
npm install aptpp-sui-js 
```
or
```
yarn add aptpp-sui-js
```

## Usage

```
const { SuiDomain } = require('aptpp-sui-js');

// opts format:
//     network : string	             // [optional] Set network 'mainnet' / 'testnet' / 'devnet', default: 'mainnet' 
//     nodeUrl : string              // [optional] Node Url, for example 'https://fullnode.mainnet.sui.io'
//     contractAddress : string      // [optional] The Contract address
//     globalMapObject : string      // [optional] The GlobalMap Object address

let opts={network:"testnet"};
let suidomain=new SuiDomain(opts);
```

### Basic

You can using in Promise:
```
const test_domain = 'test007@sui';
const test_address = '0x0d24362b397b46d020ad66ae287bb612d0abcbda4787c40b98568ef4be1f9ca4';	

let { address } = await suidomain.lookup( test_domain);
console.log( `${test_domain} => ${address}` );

let { domain } = await suidomain.reverse( test_address );
console.log( `${test_address} => ${domain}` );

let record = await suidomain.getDomainRecord(test_domain);
console.log( `${test_domain} => ${JSON.stringify(record,null,'  ')}` );

```

Or you can using at Callback:
```
suidomain.lookup(test_domain,(status,address)=>{
	console.log( `${test_domain} => ${address}` );
});

suidomain.reverse(test_address,(status,domain)=>{
	console.log( `${test_address} => ${domain}` );
});

suidomain.getDomainRecord(test_domain,(status,record)=>{
	console.log( `${test_domain} => ${JSON.stringify(record,null,'  ')}` );
});
```

### Domain Object

Create a object of domain, get more formated data.

Here is the sample:
```
// request a domain object by addres or domain 
// if domain not exist , return null
let domainObj = await suidomain.getDomainObj('test007@sui'); 

if( domainObj ){
	console.log("domainObj.address(): ",        domainObj.address());
	console.log("domainObj.avatar(): ",         domainObj.avatar());
	console.log("domainObj.url(): ",            domainObj.url());
	console.log("domainObj.email(): ",          domainObj.email());
		
	console.log("domainObj.discord(): ",        domainObj.discord());
	console.log("domainObj.github(): ",         domainObj.github());
	console.log("domainObj.reddit(): ",         domainObj.reddit());
	console.log("domainObj.twitter(): ",        domainObj.twitter());
	console.log("domainObj.telegram(): ",       domainObj.telegram());

	console.log("domainObj.record('APT'): ",    domainObj.record('APT'));
	console.log("domainObj.record('SUI'): ",    domainObj.record('SUI'));
	console.log("domainObj.record('ETH'): ",    domainObj.record('ETH'));
	console.log("domainObj.record('BTC'): ",    domainObj.record('BTC'));
	console.log("domainObj.record('Solana'): ", domainObj.record('Solana'));
}
```

Also you can check the examples to quickstart.

## Requirement
- [Sui.JS SDK](https://www.npmjs.com/package/@mysten/sui.js)

## More infomation
- [APass SUI](https://sui.apass.network)

