export const routes = [
  {
    path: '/',
    redirect: '/demo/index',
  },
  {
    path: '/demo/index',
    component: () => import('@/pages/Demo/index.vue'),
  },
  {
    path: '/home',
    component: () => import('@/pages/Home.vue'),
  },
]
