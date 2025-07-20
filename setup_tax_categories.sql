-- Insert initial CRA tax categories for landlord accounting
INSERT INTO tax_categories (id, name, description, "isActive", "createdAt", "updatedAt") VALUES
('cat_adv', 'Advertising', 'Marketing and advertising expenses for rental properties', true, NOW(), NOW()),
('cat_ins', 'Insurance', 'Property insurance, liability insurance, and other insurance costs', true, NOW(), NOW()),
('cat_int', 'Interest & Bank Charges', 'Mortgage interest, bank fees, and financing costs', true, NOW(), NOW()),
('cat_maint', 'Maintenance & Repairs', 'Property maintenance, repairs, and improvements', true, NOW(), NOW()),
('cat_mgmt', 'Management & Administration Fees', 'Property management fees and administrative costs', true, NOW(), NOW()),
('cat_vehicle', 'Motor Vehicle', 'Vehicle expenses related to property management', true, NOW(), NOW()),
('cat_office', 'Office Expenses', 'Office supplies, equipment, and related expenses', true, NOW(), NOW()),
('cat_prof', 'Professional Fees', 'Legal fees, accounting fees, and professional services', true, NOW(), NOW()),
('cat_proptax', 'Property Taxes', 'Municipal property taxes and assessments', true, NOW(), NOW()),
('cat_salary', 'Salaries, Wages & Benefits', 'Employee wages and benefits for property management', true, NOW(), NOW()),
('cat_travel', 'Travel', 'Travel expenses for property management and maintenance', true, NOW(), NOW()),
('cat_util', 'Utilities', 'Electricity, water, gas, internet, and other utility costs', true, NOW(), NOW()),
('cat_other', 'Other Expenses', 'Miscellaneous expenses not covered by other categories', true, NOW(), NOW());

-- Update existing transactions to have default tax categories based on their current categories
UPDATE transactions 
SET "taxCategoryId" = CASE 
    WHEN category ILIKE '%insurance%' THEN 'cat_ins'
    WHEN category ILIKE '%mortgage%' OR category ILIKE '%interest%' THEN 'cat_int'
    WHEN category ILIKE '%maintenance%' OR category ILIKE '%repair%' THEN 'cat_maint'
    WHEN category ILIKE '%management%' OR category ILIKE '%admin%' THEN 'cat_mgmt'
    WHEN category ILIKE '%tax%' OR category ILIKE '%property tax%' THEN 'cat_proptax'
    WHEN category ILIKE '%utility%' OR category ILIKE '%electric%' OR category ILIKE '%water%' OR category ILIKE '%gas%' THEN 'cat_util'
    WHEN category ILIKE '%legal%' OR category ILIKE '%accounting%' OR category ILIKE '%professional%' THEN 'cat_prof'
    WHEN category ILIKE '%travel%' THEN 'cat_travel'
    WHEN category ILIKE '%office%' OR category ILIKE '%supply%' THEN 'cat_office'
    WHEN category ILIKE '%vehicle%' OR category ILIKE '%car%' THEN 'cat_vehicle'
    WHEN category ILIKE '%advertising%' OR category ILIKE '%marketing%' THEN 'cat_adv'
    WHEN category ILIKE '%salary%' OR category ILIKE '%wage%' OR category ILIKE '%employee%' THEN 'cat_salary'
    ELSE 'cat_other'
END
WHERE "taxCategoryId" IS NULL AND type = 'EXPENSE'; 