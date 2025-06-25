<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">School Battery Health Report</h1>
    <el-button type="primary" @click="exportCSV" class="mb-4">Export as CSV</el-button>
    <el-table
      :data="sortedSchools"
      style="width: 100%"
      :default-sort="{ prop: sortKey, order: sortOrder }"
      @sort-change="onSortChange"
      row-key="academyId"
    >
      <el-table-column prop="academyId" label="School ID" sortable="custom" width="120" />
      <el-table-column prop="unhealthyCount" label="Unhealthy Devices" sortable="custom" width="180">
        <template #default="scope">
          <span :class="scope.row.unhealthyCount > 0 ? 'text-red-600 font-bold' : 'text-green-600'">
            {{ scope.row.unhealthyCount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Devices">
        <template #default="scope">
          <el-table :data="scope.row.devices" size="small" style="width: 100%">
            <el-table-column prop="serialNumber" label="Serial Number" width="180" />
            <el-table-column prop="averageDailyUsage" label="Avg Usage (%/day)" width="160">
              <template #default="d">
                <span v-if="d.row.averageDailyUsage === 'unknown'">unknown</span>
                <span v-else :class="d.row.unhealthy ? 'text-red-600 font-bold' : ''">
                  {{ d.row.averageDailyUsage.toFixed(1) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="unhealthy" label="Status" width="120">
              <template #default="d">
                <el-tag v-if="d.row.unhealthy" type="danger">Unhealthy</el-tag>
                <el-tag v-else-if="d.row.averageDailyUsage === 'unknown'" type="info">Unknown</el-tag>
                <el-tag v-else type="success">Healthy</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getSchoolBatteryReports } from '@/services/batteryService';

const sortKey = ref('unhealthyCount');
const sortOrder = ref('descending');

const schools = computed(() => {
  return getSchoolBatteryReports().map(s => ({
    academyId: s.academyId,
    unhealthyCount: s.unhealthyDevices.length,
    devices: [...s.unhealthyDevices, ...s.healthyDevices]
  }));
});

const sortedSchools = computed(() => {
  const arr = [...schools.value];
  arr.sort((a, b) => {
    if (sortKey.value === 'academyId') {
      return sortOrder.value === 'ascending' ? a.academyId - b.academyId : b.academyId - a.academyId;
    } else if (sortKey.value === 'unhealthyCount') {
      return sortOrder.value === 'ascending' ? a.unhealthyCount - b.unhealthyCount : b.unhealthyCount - a.unhealthyCount;
    }
    return 0;
  });
  return arr;
});

function onSortChange({ prop, order }: { prop: string; order: string }) {
  sortKey.value = prop;
  sortOrder.value = order;
}

function exportCSV() {
  const rows = schools.value.flatMap(school =>
    school.devices.map(device => ({
      academyId: school.academyId,
      serialNumber: device.serialNumber,
      averageDailyUsage: device.averageDailyUsage,
      unhealthy: device.unhealthy ? 'Unhealthy' : device.averageDailyUsage === 'unknown' ? 'Unknown' : 'Healthy'
    }))
  );
  const header = ['academyId', 'serialNumber', 'averageDailyUsage', 'status'];
  const csv = [
    header.join(','),
    ...rows.map(r =>
      [r.academyId, r.serialNumber, r.averageDailyUsage, r.unhealthy].join(',')
    )
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'battery_report.csv';
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.text-red-600 { color: #dc2626; }
.text-green-600 { color: #16a34a; }
.font-bold { font-weight: bold; }
.p-6 { padding: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
</style>
