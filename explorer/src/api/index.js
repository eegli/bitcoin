// index.js
import path from  "./path"
import axios from "./request"

export default {
    getBlockTest(){
        return axios.get(path.block_test)
        // return axios.get(`${path.block_test}?startIndex=${startIndex}&endIndex=${endIndex}`);
    },
    getTransactionTest(height){
        const url = `${path.transactions}${height}.json`;
        return axios.get(url)
    },
    getAddressTest(address){
        const url = `${path.address}${address}.json`;
        return axios.get(url)
    },

    // getBlock(){
    //     return axios.get(path.server_block)
    // },

    getBlock(offset, limit) {
        const params = new URLSearchParams();
        params.append('limit', limit);
        params.append('offset', offset);
      
        const url = `${path.server_block}?${params.toString()}`;
        return axios.get(url);
      },
      
      

    getTransaction(height){
        const url = `${path.server_height}${height}`
        return axios.get(url)
    },
    getAddress(address, offset, limit){
        const params = new URLSearchParams();
        params.append('offset', offset);
        params.append('limit', limit);
      
        const url = `${path.server_address}${address}?${params.toString()}`;
        return axios.get(url)
    }
}