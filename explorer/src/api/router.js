// router.js
import {createRouter,  createWebHashHistory} from 'vue-router'
import Blocks from '../components/Blocks.vue'
import Transactions from '../components/Transactions.vue'

const routes = [
    {
        path: '/',
        name: 'blocks',
        component: Blocks
    },
    {
        path: '/transactions',
        name: 'transactions',
        component: Transactions
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
   })


export default router