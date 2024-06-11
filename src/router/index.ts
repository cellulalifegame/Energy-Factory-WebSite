import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { setupRouterGuard } from 'src/router/guard'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Root',
        component: () => import('src/view/layout/index.vue'),
        redirect: '/welcome',
        children: [
            {
                path: '/home',
                component: () => import('src/view/home/index.vue'),
                name: 'Home',
                meta: {
                    title: 'Home'
                }
            },
            {
                path: '/welcome',
                component: () => import('src/view/welcome/index.vue'),
                name: 'Welcome',
                meta: {
                    title: 'Welcome'
                }
            },
            // {
            //     path: '/team',
            //     component: () => import('src/view/team/index.vue'),
            //     name: 'Team',
            //     meta: {
            //         title: 'Team'
            //     }
            // },
            {
                path: 'bitlife/:token',
                component: () => import('src/view/cellula/mine/cellula/detail.vue'),
                name: 'BitLifeDetail',
                meta: {
                    title: 'BitLifeDetail'
                }
            },
            {
                path: 'bitcell/:token',
                component: () => import('src/view/cellula/mine/cell/detail.vue'),
                name: 'BitCellDetail',
                meta: {
                    title: 'BitCellDetail'
                }
            },
            {
                path: '/hub',
                component: () => import('src/view/cellula/index.vue'),
                name: 'Hub',
                meta: {
                    title: 'Hub'
                },
                redirect: '/hub/shop',
                children: [
                    {
                        path: 'shop',
                        component: () => import('src/view/cellula/featured/index.vue'),
                        name: 'Shop',
                        meta: {
                            title: 'Shop'
                        }
                    },
                    {
                        path: 'bitlife',
                        component: () => import('src/view/cellula/mine/cellula/index.vue'),
                        name: 'BitLife',
                        meta: {
                            title: 'BitLife'
                        }
                    },
                    {
                        path: 'bitcell',
                        component: () => import('src/view/cellula/mine/cell/index.vue'),
                        name: 'BitCell',
                        meta: {
                            title: 'BitCell'
                        }
                    },
                    {
                        path: 'mint',
                        component: () => import('src/view/cellula/mine/craft/index.vue'),
                        name: 'Mint',
                        meta: {
                            title: 'Mint BitLife'
                        }
                    }
                ]
            },
            {
                path: '/popular-bitlife',
                component: () => import('src/view/top/index.vue'),
                name: 'PopularBitLife',
                meta: {
                    title: 'Popular BitLife'
                }
            },
            {
                path: '/top-gamers',
                component: () => import('src/view/top/gamers.vue'),
                name: 'TopGamers',
                meta: {
                    title: 'Top Gamers'
                }
            },
            // {
            //     path: '/comingsoon',
            //     component: () => import('src/view/coming/index.vue'),
            //     name: 'ComingSoon',
            //     meta: {
            //         title: 'ComingSoon'
            //     }
            // },
            {
                path: '/guide',
                component: () => import('src/view/guide/index.vue'),
                name: 'Guide',
                meta: {
                    title: 'Guide'
                }
            },
            {
                path: '/pdf',
                component: () => import('src/view/pdf/index.vue'),
                name: 'PDF',
                meta: {
                    title: 'PDF'
                }
            },
            {
                path: '/life-points',
                component: () => import('src/view/points/index.vue'),
                name: 'LifePoints',
                meta: {
                    title: 'Life Points'
                }
            },
            {
                path: '/cashback',
                component: () => import('src/view/cashback/index.vue'),
                name: 'Cashback',
                meta: {
                    title: 'Cashback'
                }
            },
            {
                path: '/convert',
                component: () => import('src/view/convert/index.vue'),
                name: 'Convert',
                meta: {
                    title: 'Convert'
                }
            },
            {
                path: '/:pathMatch(.*)*',
                name: 'NotFound',
                component: () => import('src/view/not/index.vue'),
            },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})
setupRouterGuard(router)
export default router
