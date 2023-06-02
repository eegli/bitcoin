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
        // component: Transactions,
        component: () => 
        import('../components/Transactions.vue')
    },
    {
        path: '/address/:address',
        name: 'address',
        // component: Address,
        component: () =>
        import('../components/Address.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
   })


export default router