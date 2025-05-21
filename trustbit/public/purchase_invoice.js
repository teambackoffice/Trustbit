frappe.ui.form.on('Purchase Invoice Item', {
    item_code: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        if (!row.item_code) return;

        // Fetch last_purchase_rate from Item master
        frappe.db.get_value("Item", row.item_code, "last_purchase_rate", function(data) {
            if (data && data.last_purchase_rate) {
                row.custom_price = data.last_purchase_rate;
                row._base_custom_price = data.last_purchase_rate;

                row.price_list_rate = data.last_purchase_rate;
                row.rate = data.last_purchase_rate;

                applyDiscounts(frm, cdt, cdn);
                frm.refresh_field("items");
            }
        });
    },

    custom_price: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        row._base_custom_price = row.custom_price;
        row.price_list_rate = row.custom_price;
        row.rate = row.custom_price;

        applyDiscounts(frm, cdt, cdn);
    },

    custom_discount_amounts: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.custom_price && row.custom_discount_amounts !== undefined) {
            row.custom_discount_ = (row.custom_discount_amounts / row.custom_price) * 100;
        }
        applyDiscounts(frm, cdt, cdn);
    },

    custom_discount_: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.custom_price && row.custom_discount_ !== undefined) {
            row.custom_discount_amounts = (row.custom_price * row.custom_discount_) / 100;
        }
        applyDiscounts(frm, cdt, cdn);
    },

    price_list_rate: function(frm, cdt, cdn) {
        applyDiscounts(frm, cdt, cdn);
    },

    
});

// Central discount application logic
function applyDiscounts(frm, cdt, cdn) {
    let row = locals[cdt][cdn];

    let base_price = row._base_custom_price || row.custom_price;
    if (!base_price) return;

    let discounted_rate = base_price;

    if (row.custom_discount_amounts) {
        discounted_rate = base_price - row.custom_discount_amounts;
    } else if (row.custom_discount_) {
        discounted_rate = base_price * (1 - (row.custom_discount_ / 100));
    } else {
        discounted_rate = base_price;
    }

    discounted_rate = Math.max(0, discounted_rate);

    row.custom_price = discounted_rate;
    row.rate = row.custom_price;
    row.price_list_rate = row.custom_price;
    row.amount = (row.qty || 0) * row.rate;

    frm.refresh_field('items');
}


