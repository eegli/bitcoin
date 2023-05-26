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
    }
}