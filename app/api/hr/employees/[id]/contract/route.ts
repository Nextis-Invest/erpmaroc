import Employee from '@/model/hr/employee';
import { connectToDB } from '@/lib/database/connectToDB';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const { id } = params;
    const body = await request.json();
    const { contractType, reason, changedBy } = body;

    // Validation des types de contrat autorisés
    const validContractTypes = ['cdi', 'cdd', 'freelance'];
    if (!validContractTypes.includes(contractType)) {
      return NextResponse.json(
        { error: 'Type de contrat invalide. Types autorisés: cdi, cdd, freelance' },
        { status: 400 }
      );
    }

    // Trouver l'employé
    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employé non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le type de contrat est différent
    if (employee.contractType === contractType) {
      return NextResponse.json(
        { error: 'Le type de contrat est déjà ' + contractType },
        { status: 400 }
      );
    }

    // Utiliser la méthode pour changer le type de contrat
    employee.changeContractType(contractType, reason, changedBy);

    // Sauvegarder les changements
    await employee.save();

    console.log(`✅ Type de contrat changé pour ${employee.firstName} ${employee.lastName}: ${employee.contractType}`);

    return NextResponse.json({
      success: true,
      message: `Type de contrat changé en ${contractType} avec préservation de l'ancienneté`,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        previousContractType: employee.contractHistory[employee.contractHistory.length - 2]?.contractType,
        currentContractType: employee.contractType,
        originalHireDate: employee.originalHireDate,
        currentHireDate: employee.hireDate,
        yearsOfService: employee.getYearsOfService(),
        contractHistory: employee.contractHistory
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors du changement de type de contrat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET pour récupérer l'historique des contrats
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const { id } = params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employé non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        currentContractType: employee.contractType,
        originalHireDate: employee.originalHireDate,
        currentHireDate: employee.hireDate,
        yearsOfService: employee.getYearsOfService(),
        contractHistory: employee.contractHistory
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'historique:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}