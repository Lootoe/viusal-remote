export const routes = [
  {
    path: '/',
    redirect: '/pad/control',
  },
  {
    path: '/pad/control',
    component: () => import('@/pages/Pad/index.vue'),
  },
  {
    path: '/home',
    component: () => import('@/pages/Home.vue'),
  },
]
