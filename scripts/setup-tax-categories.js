const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupTaxCategories() {
  try {
    console.log('Setting up tax categories...')

    // Insert tax categories
    const taxCategories = [
      { id: 'cat_adv', name: 'Advertising', description: 'Marketing and advertising expenses for rental properties' },
      { id: 'cat_ins', name: 'Insurance', description: 'Property insurance, liability insurance, and other insurance costs' },
      { id: 'cat_int', name: 'Interest & Bank Charges', description: 'Mortgage interest, bank fees, and financing costs' },
      { id: 'cat_maint', name: 'Maintenance & Repairs', description: 'Property maintenance, repairs, and improvements' },
      { id: 'cat_mgmt', name: 'Management & Administration Fees', description: 'Property management fees and administrative costs' },
      { id: 'cat_vehicle', name: 'Motor Vehicle', description: 'Vehicle expenses related to property management' },
      { id: 'cat_office', name: 'Office Expenses', description: 'Office supplies, equipment, and related expenses' },
      { id: 'cat_prof', name: 'Professional Fees', description: 'Legal fees, accounting fees, and professional services' },
      { id: 'cat_proptax', name: 'Property Taxes', description: 'Municipal property taxes and assessments' },
      { id: 'cat_salary', name: 'Salaries, Wages & Benefits', description: 'Employee wages and benefits for property management' },
      { id: 'cat_travel', name: 'Travel', description: 'Travel expenses for property management and maintenance' },
      { id: 'cat_util', name: 'Utilities', description: 'Electricity, water, gas, internet, and other utility costs' },
      { id: 'cat_other', name: 'Other Expenses', description: 'Miscellaneous expenses not covered by other categories' }
    ]

    for (const category of taxCategories) {
      await prisma.taxCategory.upsert({
        where: { id: category.id },
        update: category,
        create: category
      })
      console.log(`✓ Created/updated tax category: ${category.name}`)
    }

    // Update existing transactions with tax categories
    console.log('\nUpdating existing transactions with tax categories...')

    const categoryMappings = {
      'insurance': 'cat_ins',
      'mortgage': 'cat_int',
      'interest': 'cat_int',
      'maintenance': 'cat_maint',
      'repair': 'cat_maint',
      'management': 'cat_mgmt',
      'admin': 'cat_mgmt',
      'tax': 'cat_proptax',
      'property tax': 'cat_proptax',
      'utility': 'cat_util',
      'electric': 'cat_util',
      'water': 'cat_util',
      'gas': 'cat_util',
      'legal': 'cat_prof',
      'accounting': 'cat_prof',
      'professional': 'cat_prof',
      'travel': 'cat_travel',
      'office': 'cat_office',
      'supply': 'cat_office',
      'vehicle': 'cat_vehicle',
      'car': 'cat_vehicle',
      'advertising': 'cat_adv',
      'marketing': 'cat_adv',
      'salary': 'cat_salary',
      'wage': 'cat_salary',
      'employee': 'cat_salary'
    }

    // Get all expense transactions without tax categories
    const transactions = await prisma.transaction.findMany({
      where: {
        type: 'EXPENSE',
        taxCategoryId: null
      }
    })

    let updatedCount = 0
    for (const transaction of transactions) {
      let taxCategoryId = 'cat_other' // default

      // Find matching category
      for (const [keyword, categoryId] of Object.entries(categoryMappings)) {
        if (transaction.category.toLowerCase().includes(keyword) || 
            transaction.description.toLowerCase().includes(keyword)) {
          taxCategoryId = categoryId
          break
        }
      }

      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { taxCategoryId }
      })
      updatedCount++
    }

    console.log(`✓ Updated ${updatedCount} transactions with tax categories`)

    console.log('\n✅ Tax categories setup completed successfully!')
  } catch (error) {
    console.error('Error setting up tax categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupTaxCategories() 