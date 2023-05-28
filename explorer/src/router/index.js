// index.js
import {createRouter,  createWebHashHistory} from 'vue-router'
import Blocks from '../components/Blocks.vue'
import Transactions from '../components/Transactions.vue'
import Address from '../components/Address.vue'

const routes = [
    {
        path: '/',
        name: 'blocks',
        component: Blocks
    },
    {
        path: '/transactions/:height',
        name: 'transactions',
        component: Transactions
    },
    {
        path: '/address/:address',
        name: 'address',
        component: Address
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
   })


export default router