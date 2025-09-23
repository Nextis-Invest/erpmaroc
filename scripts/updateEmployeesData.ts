import { connectToDB } from '@/lib/database/connectToDB';
import Employee from '@/model/hr/employee';

const updateEmployeesWithMissingFields = async () => {
  try {
    await connectToDB();
    console.log('Connected to database...');

    // Sample CNSS numbers and contract types for updates
    const employeeUpdates = [
      { employeeId: 'EMP001', cnssNumber: '123456789012', contractType: 'cdi' },
      { employeeId: 'EMP002', cnssNumber: '234567890123', contractType: 'cdd' },
      { employeeId: 'EMP003', cnssNumber: '345678901234', contractType: 'freelance' },
      { employeeId: 'EMP004', cnssNumber: '456789012345', contractType: 'cdi' },
      { employeeId: 'EMP005', cnssNumber: '567890123456', contractType: 'cdd' },
      { employeeId: 'EMP006', cnssNumber: '678901234567', contractType: 'cdi' },
      { employeeId: 'EMP007', cnssNumber: '789012345678', contractType: 'freelance' },
      { employeeId: 'EMP008', cnssNumber: '890123456789', contractType: 'cdi' },
    ];

    console.log('Updating employees with CNSS numbers and contract types...');

    for (const update of employeeUpdates) {
      const result = await Employee.updateOne(
        { employeeId: update.employeeId },
        {
          $set: {
            cnssNumber: update.cnssNumber,
            contractType: update.contractType,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Updated employee ${update.employeeId} with CNSS: ${update.cnssNumber}, Contract: ${update.contractType}`);
      } else {
        console.log(`⚠️  Employee ${update.employeeId} not found in database`);
      }
    }

    // Update employees without cnssNumber
    const updateCNSS = await Employee.updateMany(
      {
        $or: [
          { cnssNumber: { $exists: false } },
          { cnssNumber: null },
          { cnssNumber: '' }
        ]
      },
      {
        $set: {
          cnssNumber: 'PENDING',
          updatedAt: new Date()
        }
      }
    );

    // Update employees without contractType
    const updateContract = await Employee.updateMany(
      {
        $or: [
          { contractType: { $exists: false } },
          { contractType: null },
          { contractType: '' }
        ]
      },
      {
        $set: {
          contractType: 'cdi',
          updatedAt: new Date()
        }
      }
    );

    console.log(`📊 Updated ${updateCNSS.modifiedCount} employees with CNSS numbers`);
    console.log(`📊 Updated ${updateContract.modifiedCount} employees with contract types`);

    // Get count of all employees
    const totalEmployees = await Employee.countDocuments();
    console.log(`📈 Total employees in database: ${totalEmployees}`);

    // Get employees with missing fields (should be 0 after update)
    const missingCNSS = await Employee.countDocuments({
      $or: [
        { cnssNumber: { $exists: false } },
        { cnssNumber: null },
        { cnssNumber: '' }
      ]
    });

    const missingContract = await Employee.countDocuments({
      $or: [
        { contractType: { $exists: false } },
        { contractType: null },
        { contractType: '' }
      ]
    });

    console.log(`📋 Employees missing CNSS number: ${missingCNSS}`);
    console.log(`📋 Employees missing contract type: ${missingContract}`);

    console.log('✅ Employee update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating employees:', error);
  } finally {
    process.exit(0);
  }
};

updateEmployeesWithMissingFields();