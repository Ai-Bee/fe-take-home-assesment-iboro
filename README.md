# Field Support for Batteries

## Instructions

Fork this repository.

The exercise requirements and test cases are provided in the Word document you received.

Use the provided data file at data/battery.json as your data source.

## Good luck!

------------------------


### Design & Assumptions
- The app loads battery data from a static JSON file (`src/data/battery.json`).
- Each record includes: `academyId`, `batteryLevel`, `employeeId`, `serialNumber`, and `timestamp`.
- Battery health is calculated by averaging battery drop per day, ignoring intervals where the battery level increases (charging events).
- Devices with only one data point are marked as "unknown".
- A device is "unhealthy" if it uses more than 30% battery per day on average.
- The simple UI shows all schools, highlights those with battery issues, and lists unhealthy devices.
- Sorting and CSV export are available in the UI.

### How to Run
1. Install dependencies:
   ```sh
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```
2. Start the development server:
   ```sh
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```
3. Open your browser to the local address shown in the terminal (usually http://localhost:5173).


### High-Level Strategy for Further Work
- Replace static JSON with real API integration using Axios or Vue Query
- Add filtering and search UI for schools/devices
- Implement authentication if required
- Add device/battery detail views and navigation
- Improve UI/UX for mobile and accessibility
- Fix unit tests and add E2E tests using Cypress or Playwright
- More wholistic data would be required when API is available to details like school name and the likes 
can be populated so the table can easily understood
- Optimize performance for large datasets (pagination, virtualization)


