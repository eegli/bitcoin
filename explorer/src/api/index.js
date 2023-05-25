// index.js
import path from  "./path"
import axios from "../utils/request"

export default {
    getBlockTest(){
        return axios.get(path.block_test)
        // return axios.get(`${path.block_test}?startIndex=${startIndex}&endIndex=${endIndex}`);
    }

}