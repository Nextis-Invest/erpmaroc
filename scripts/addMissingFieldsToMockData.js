const fs = require('fs');
const path = require('path');

// Path to the mock data file
const mockDataPath = path.join(__dirname, '..', 'lib', 'hr', 'mockData.ts');

// Read the current mock data
let mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

// Array of CNSS numbers and contract types for each employee
const employeeFields = [
  { employeeId: 'EMP001', cnssNumber: '123456789012', contractType: 'cdi' },
  { employeeId: 'EMP002', cnssNumber: '234567890123', contractType: 'cdd' },
  { employeeId: 'EMP003', cnssNumber: '345678901234', contractType: 'freelance' },
  { employeeId: 'EMP004', cnssNumber: '456789012345', contractType: 'cdi' },
  { employeeId: 'EMP005', cnssNumber: '567890123456', contractType: 'cdd' },
  { employeeId: 'EMP006', cnssNumber: '678901234567', contractType: 'cdi' },
  { employeeId: 'EMP007', cnssNumber: '789012345678', contractType: 'freelance' },
  { employeeId: 'EMP008', cnssNumber: '890123456789', contractType: 'cdi' },
];

// Function to add missing fields after nationalId for each employee
employeeFields.forEach(({ employeeId, cnssNumber, contractType }) => {
  const employeeRegex = new RegExp(
    `(employeeId: "${employeeId}"[\\s\\S]*?nationalId: "[^"]*",)`,
    'g'
  );

  const replacement = `$1
    cnssNumber: "${cnssNumber}",
    contractType: "${contractType}",`;

  mockDataContent = mockDataContent.replace(employeeRegex, replacement);
  console.log(`✅ Added fields for ${employeeId}`);
});

// Write the updated content back to the file
fs.writeFileSync(mockDataPath, mockDataContent, 'utf8');

console.log('🎉 Successfully updated all employees in mockData.ts');
console.log('📝 Added cnssNumber and contractType fields to all employees');