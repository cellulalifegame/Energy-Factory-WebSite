import { Router } from 'vue-router'
export const setupRouterGuard = (router: Router) => {
    router.beforeEach((to, from, next) => {
        next();
        if (to.meta.title) {
            // @ts-ignore
            document.title = to.meta.title;
        } else {
            // @ts-ignore
            document.title = 'NotFound'
        }
        document.documentElement.scrollTop = 0;
    });
}