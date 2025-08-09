import { createRouter,createWebHistory } from "vue-router";
import DefaultLayout from '../components/DefaultLayout.vue'

const routes = [
    {
        path: '/',
        name: 'default',
        component: DefaultLayout,
        children: [
            {
                path: '/',
                name: 'home',
                component: () => import('../views/Home.vue')
            },
            {
                path: '/coins',
                name: 'coins',
                component: () => import('../views/Coin.vue')
            },
            {
                path: '/addCoin',
                name: 'addCoin',
                component: () => import('../views/AddCoin.vue')
            }

            
        ]
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router