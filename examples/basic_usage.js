const { SuiDomain } = require('../src/index');

(async()=>{
	
	let opt={
		//
		// set network 'mainnet' / 'testnet' / 'devnet', default: 'mainnet' 
		//
		network: 'testnet'

		//
		// Or you can set the node url and contract address
		//
		// for mainnet
		//nodeUrl:'https://fullnode.mainnet.sui.io',
		//contractAddress:'-',

		// for testnet
		//nodeUrl:'https://fullnode.testnet.sui.io',
		//contractAddress:'0x23c1d988e3abfc616040ac9a2f32132ff72113703bb062cb8d5da14e00311c97',

		// for devtest
		//nodeUrl:'https://fullnode.devnet.sui.io',
		//contractAddress:'0x2d077874f4169a1e22889ad85128512bc726bb1af05ac077fd21f8f6c5b37191',
	};

	let suidomain=new SuiDomain(opt);

	const test_domain = 'test007@sui';
	const test_address = '0x0d24362b397b46d020ad66ae287bb612d0abcbda4787c40b98568ef4be1f9ca4';
	
	///////////////////////////////////////////
    // basic using on promise

	let { address } = await suidomain.lookup( test_domain);
	console.log( `[promise] ${test_domain} => ${address}` );

	let { domain } = await suidomain.reverse( test_address );
	console.log( `[promise] ${test_address} => ${domain}` );

	let data = await suidomain.getDomainRecord(test_domain);
	console.log( `[promise] ${test_domain} => ${JSON.stringify(data,null,'  ')}` );

	///////////////////////////////////////////
	 // basic using on callback

	suidomain.lookup(test_domain,(status,address)=>{
		console.log( `[callback] ${test_domain} => ${address}` );
	});

	suidomain.reverse(test_address,(status,domain)=>{
		console.log( `[callback] ${test_address} => ${domain}` );
	});

	suidomain.getDomainRecord(test_domain,(status,data)=>{
		console.log( `[callback] ${test_domain} => ${JSON.stringify(data,null,'  ')}` );
	});
	
	///////////////////////////////////////////
	// domain object

	// request a domain object by addres or domain 
	// if domain not exist , return null

	let domainObj = await suidomain.getDomainObj(test_address);

	if( domainObj ){
		console.log("domainObj.address(): ",		domainObj.address());
		console.log("domainObj.avatar(): ",			domainObj.avatar());
		console.log("domainObj.url(): ",			domainObj.url());
		console.log("domainObj.email(): ",			domainObj.email());
		
		console.log("domainObj.discord(): ",		domainObj.discord());
		console.log("domainObj.github(): ",			domainObj.github());
		console.log("domainObj.reddit(): ",			domainObj.reddit());
		console.log("domainObj.twitter(): ",		domainObj.twitter());
		console.log("domainObj.telegram(): ",		domainObj.telegram());

		console.log("domainObj.record('APT'): ",	domainObj.record('APT'));
		console.log("domainObj.record('SUI'): ",	domainObj.record('SUI'));
		console.log("domainObj.record('ETH'): ",	domainObj.record('ETH'));
		console.log("domainObj.record('BTC'): ",	domainObj.record('BTC'));
		console.log("domainObj.record('Solana'): ",	domainObj.record('Solana'));
	}
    
})();
