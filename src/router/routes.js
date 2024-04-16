export const routes = [
  {
    path: '/',
    redirect: '/demo/index',
  },
  {
    path: '/demo/index',
    component: () => import('@/pages/Demo/index.vue'),
  },
]
