// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BatteryReport from './BatteryReport.vue';

// Mock the data service to return minimal valid data using a relative path
vi.mock('../services/batteryService', () => ({
  getSchoolBatteryReports: () => [
    {
      academyId: 1,
      unhealthyDevices: [],
      healthyDevices: [
        { serialNumber: 'D1', averageDailyUsage: 10, unhealthy: false, records: [] }
      ]
    }
  ]
}));

describe('BatteryReport.vue', () => {
  it('mounts without crashing', () => {
    const wrapper = mount(BatteryReport);
    expect(wrapper.exists()).toBe(true);
  });
});
