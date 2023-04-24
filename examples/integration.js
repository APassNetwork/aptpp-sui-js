// Using SDK sample
const { SuiDomain } = require('../src/index');

var suidomain=new SuiDomain( {network:'testnet'} );

async function ReverseAddressName(input_address, cb) {
    if( input_address.startsWith('0x') ){

        let { domain } = await suidomain.reverse( input_address);
        if( domain ) {
            //got a domain bind on this address
            cb(input_address,domain);
        }
    }
}

const input_address = '0x0d24362b397b46d020ad66ae287bb612d0abcbda4787c40b98568ef4be1f9ca4';

ReverseAddressName(input_address,function(address,domain){
    
	// Now, you can update address to domain
    console.log(address,domain);

});
