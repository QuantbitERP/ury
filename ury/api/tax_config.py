import frappe
from frappe import _

@frappe.whitelist()
def get_tax_config():
    config = {
        "vat_rate": 0,
        "vat_effective_date": "",
        "vat_history": [],
        "payroll_brackets": [],
        "catering_levy": 0,
        "catering_effective_date": "",
        "history": []
    }
    
    # 1. Fetch VAT Info from Item Tax Template
    try:
        vat_templates = frappe.get_all(
            "Item Tax Template",
            filters={"name": ("like", "%VAT%")},
            fields=["name", "creation", "modified"],
            order_by="creation desc"
        )
        for i, template in enumerate(vat_templates):
            doc = frappe.get_doc("Item Tax Template", template.name)
            rate = 0
            if hasattr(doc, 'tax_rates') and doc.tax_rates:
                rate = doc.tax_rates[0].tax_rate
            elif hasattr(doc, 'taxes') and doc.taxes:
                rate = doc.taxes[0].tax_rate
            
            effective_date = template.creation.strftime("%Y-%m-%d") if template.creation else ""
            end_date = "-"
            status = "Active" if i == 0 else "Archived"
            
            if i == 0:
                config["vat_rate"] = rate
                config["vat_effective_date"] = effective_date
                
            entry = {
                "rate": rate,
                "effective_date": effective_date,
                "end_date": end_date,
                "description": f"Rate from {template.name}",
                "status": status
            }
            config["vat_history"].append(entry)
            
            config["history"].append({
                "tax_type": "VAT",
                "category": template.name,
                "rate": f"{rate}%",
                "effective_date": effective_date,
                "end_date": end_date,
                "description": "Standard VAT Rate Update",
                "status": status,
                "created": effective_date
            })
            
    except Exception as e:
        frappe.log_error(f"Error fetching VAT Config: {str(e)}", "Tax Config")

    # 2. Fetch Catering Levy from Item Tax Template
    try:
        catering_templates = frappe.get_all(
            "Item Tax Template",
            filters={"name": ("like", "%Catering%Levy%Register%")},
            fields=["name", "creation", "modified"],
            order_by="creation desc"
        )
        if not catering_templates:
            catering_templates = frappe.get_all(
                "Item Tax Template",
                filters={"name": ("like", "%Catering%Levy%")},
                fields=["name", "creation", "modified"],
                order_by="creation desc"
            )
            
        for i, template in enumerate(catering_templates):
            doc = frappe.get_doc("Item Tax Template", template.name)
            rate = 0
            if hasattr(doc, 'tax_rates') and doc.tax_rates:
                rate = doc.tax_rates[0].tax_rate
            elif hasattr(doc, 'taxes') and doc.taxes:
                rate = doc.taxes[0].tax_rate
            
            effective_date = template.creation.strftime("%Y-%m-%d") if template.creation else ""
            status = "Active" if i == 0 else "Archived"
            
            if i == 0:
                config["catering_levy"] = rate
                config["catering_effective_date"] = effective_date
                
            config["history"].append({
                "tax_type": "Catering Levy",
                "category": template.name,
                "rate": f"{rate}%",
                "effective_date": effective_date,
                "end_date": "-",
                "description": "Catering Levy Rate Update",
                "status": status,
                "created": effective_date
            })
            
    except Exception as e:
        frappe.log_error(f"Error fetching Catering Config: {str(e)}", "Tax Config")

    # 3. Fetch Payroll Brackets from Income Tax Slab
    try:
        if frappe.db.exists("DocType", "Income Tax Slab"):
            slabs = frappe.get_all(
                "Income Tax Slab",
                fields=["name", "effective_from", "creation"],
                order_by="effective_from desc"
            )
            if slabs:
                latest_slab = slabs[0]
                doc = frappe.get_doc("Income Tax Slab", latest_slab.name)
                effective_from = latest_slab.effective_from.strftime("%Y-%m-%d") if latest_slab.effective_from else ""
                
                # Assume child table fieldname might be 'slabs', 'taxable_salary_slabs', 'tax_brackets'
                child_table = []
                if hasattr(doc, 'taxable_salary_slabs') and doc.taxable_salary_slabs:
                    child_table = doc.taxable_salary_slabs
                elif hasattr(doc, 'slabs') and doc.slabs:
                    child_table = doc.slabs
                
                for row in child_table:
                    config["payroll_brackets"].append({
                        "name": row.name,
                        "from_amount": getattr(row, 'from_amount', 0),
                        "to_amount": getattr(row, 'to_amount', -1),
                        "percent_deduction": getattr(row, 'percent_deduction', getattr(row, 'tax_rate', 0)),
                        "effective_from": effective_from
                    })
                    
                for idx, slab in enumerate(slabs):
                    eff_date = slab.effective_from.strftime("%Y-%m-%d") if slab.effective_from else ""
                    config["history"].append({
                        "tax_type": "Payroll Tax",
                        "category": slab.name,
                        "rate": "Various Brackets",
                        "effective_date": eff_date,
                        "end_date": "-",
                        "description": "PAYE Income Tax Slab Update",
                        "status": "Active" if idx == 0 else "Archived",
                        "created": slab.creation.strftime("%Y-%m-%d") if slab.creation else ""
                    })

    except Exception as e:
        frappe.log_error(f"Error fetching Payroll Config: {str(e)}", "Tax Config")

    # Sort history by effective date descending
    config["history"] = sorted(config["history"], key=lambda x: x["effective_date"], reverse=True)
    return config

@frappe.whitelist()
def update_vat_rate(rate, effective_date):
    """ Creates a new Item Tax Template for the new VAT rate """
    try:
        new_template = frappe.new_doc("Item Tax Template")
        new_template.title = f"{rate}% VAT"
        new_template.append("taxes", {
            "tax_type": "On Net Total", # Assuming Standard
            "account_head": "VAT - QR", # Placeholder
            "tax_rate": rate
        })
        new_template.insert(ignore_permissions=True)
        return {"status": "success", "message": "VAT Rate updated successfully"}
    except Exception as e:
        frappe.log_error(f"Failed to update VAT rate: {str(e)}")
        frappe.throw(_("Failed to update VAT rate: {0}").format(str(e)))

@frappe.whitelist()
def update_catering_levy(rate, effective_date):
    """ Creates a new Item Tax Template for the new Catering Levy rate """
    try:
        new_template = frappe.new_doc("Item Tax Template")
        new_template.title = f"{rate}% Catering Training Levy (CTL) Register"
        new_template.append("taxes", {
            "tax_type": "On Net Total", # Assuming Standard
            "account_head": "Catering Levy - QR", # Placeholder
            "tax_rate": rate
        })
        new_template.insert(ignore_permissions=True)
        return {"status": "success", "message": "Catering Levy updated successfully"}
    except Exception as e:
        frappe.log_error(f"Failed to update Catering Levy: {str(e)}")
        frappe.throw(_("Failed to update Catering Levy: {0}").format(str(e)))

@frappe.whitelist()
def update_payroll_brackets(brackets):
    """ Creates a new Income Tax Slab with updated brackets """
    import json
    if isinstance(brackets, str):
        brackets = json.loads(brackets)
        
    try:
        if not frappe.db.exists("DocType", "Income Tax Slab"):
            return {"status": "error", "message": "DocType Income Tax Slab does not exist"}
            
        new_slab = frappe.new_doc("Income Tax Slab")
        new_slab.name = f"PAYE Tracker - Latest" # A default name as per standard ERPNext
        
        # In ERPNext Income Tax Slab requires effective_from
        new_slab.effective_from = frappe.utils.today()
        new_slab.company = frappe.defaults.get_user_default("Company")
        
        child_table_name = "taxable_salary_slabs" if hasattr(new_slab, 'taxable_salary_slabs') else "slabs"
        
        for bracket in brackets:
            new_slab.append(child_table_name, {
                "from_amount": bracket.get("from_amount"),
                "to_amount": None if bracket.get("to_amount") == -1 else bracket.get("to_amount"),
                "percent_deduction": bracket.get("percent_deduction")
            })
            
        new_slab.insert(ignore_permissions=True)
        return {"status": "success", "message": "Payroll brackets updated successfully"}
    except Exception as e:
        frappe.log_error(f"Failed to update payroll brackets: {str(e)}")
        frappe.throw(_("Failed to update payroll brackets: {0}").format(str(e)))
