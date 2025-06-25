import { createRouter, createWebHistory } from 'vue-router';
import { env } from '@/config/env';


const router = createRouter({
  history: createWebHistory(env.APP_BASE_PATH),
  routes: [
    {
      path: '/',
      name: 'Battery Report',
      component: () => import('@/views/BatteryReport.vue')
    }
  ]
});

export default router;
