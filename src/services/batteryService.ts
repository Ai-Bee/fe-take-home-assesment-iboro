// Service to load and process battery data
import batteryData from '@/data/battery.json';

export interface BatteryRecord {
  academyId: number;
  batteryLevel: number; // 0-1 float
  employeeId: string;
  serialNumber: string;
  timestamp: string; // ISO8601
}

export interface DeviceHealth {
  serialNumber: string;
  averageDailyUsage: number | 'unknown';
  unhealthy: boolean;
  records: BatteryRecord[];
}

export interface SchoolBatteryReport {
  academyId: number;
  unhealthyDevices: DeviceHealth[];
  healthyDevices: DeviceHealth[];
}

// Helper: group by key
function groupBy<T, K extends keyof any>(arr: T[], key: (item: T) => K): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

// Calculate average daily battery usage for a device
function calculateAverageDailyUsage(records: BatteryRecord[]): number | 'unknown' {
  if (records.length < 2) return 'unknown';
  // Sort by timestamp
  const sorted = [...records].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  let totalDrop = 0;
  let totalHours = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const drop = prev.batteryLevel - curr.batteryLevel;
    const hours = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 36e5;
    if (drop > 0) {
      totalDrop += drop;
      totalHours += hours;
    }
    // If drop <= 0, skip (charging or no change)
  }
  if (totalHours === 0) return 'unknown';
  // Scale to 24 hours
  const avgPerDay = (totalDrop / totalHours) * 24 * 100; // percent per day
  return avgPerDay;
}

export function getSchoolBatteryReports(): SchoolBatteryReport[] {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  // Assume batteryData is an array of BatteryRecord objects
  const records: BatteryRecord[] = batteryData;
  const byDevice = groupBy(records, r => r.serialNumber);
  const deviceHealths: Record<string, DeviceHealth> = {};
  Object.entries(byDevice).forEach(([serialNumber, recs]) => {
    const avg = calculateAverageDailyUsage(recs);
    deviceHealths[serialNumber] = {
      serialNumber,
      averageDailyUsage: avg,
      unhealthy: typeof avg === 'number' && avg > 30,
      records: recs
    };
  });
  // Group by academyId
  const bySchool = groupBy(records, r => r.academyId);
  return Object.entries(bySchool).map(([academyId, recs]) => {
    const devices = groupBy(recs, r => r.serialNumber);
    const unhealthyDevices: DeviceHealth[] = [];
    const healthyDevices: DeviceHealth[] = [];
    Object.keys(devices).forEach(sn => {
      const health = deviceHealths[sn];
      if (health.unhealthy) unhealthyDevices.push(health);
      else healthyDevices.push(health);
    });
    return {
      academyId: Number(academyId),
      unhealthyDevices,
      healthyDevices
    };
  });
}
