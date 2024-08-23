document.getElementById('toggleDarkMode').addEventListener('click', function() {
    const body = document.body;

    // Toggle dark mode manually
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode')
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
});

// Apply the system theme on load or use the saved theme from localStorage
window.addEventListener('load', function() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // If there is a saved theme, use it
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    } else {
        // Otherwise, use the system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-mode', prefersDark);
    }
});


document.getElementById('addCategoryButton').addEventListener('click', function() {
    const categoriesContainer = document.getElementById('categoriesContainer');

    const categoryFieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.innerText = 'New Category';

    const nameLabel = document.createElement('label');
    nameLabel.innerText = 'Category Name: ';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';

    const typeLabel = document.createElement('label');
    typeLabel.innerText = 'Category Type: ';
    const typeSelect = document.createElement('select');
    const typeBasedOption = document.createElement('option');
    typeBasedOption.value = 'type-based';
    typeBasedOption.innerText = 'Type-Based';
    const costBasedOption = document.createElement('option');
    costBasedOption.value = 'cost-based';
    costBasedOption.innerText = 'Cost-Based';
    typeSelect.append(typeBasedOption, costBasedOption);

    const addItemButton = document.createElement('button');
    addItemButton.innerText = 'Add Item';
    
    // Function to handle adding an item
    const addItem = () => {
        const itemFieldset = document.createElement('fieldset');
        const itemLegend = document.createElement('legend');
        itemLegend.innerText = 'New Item';
        itemFieldset.appendChild(itemLegend);

        const isTypeBased = typeSelect.value === 'type-based';
        
        // Fields common to both types
        const fields = [
            { label: 'Level Requirement', type: 'number' },
            { label: 'DC', type: 'number' },
            { label: 'Nat1 Penalty', type: 'number' },
            { label: 'Nat20 Bonus', type: 'number' },
            { label: 'Total Successes', type: 'number' },
            { label: 'Total Failures', type: 'number' },
            { label: 'Cooldown In Seconds', type: 'number' },
            { label: 'Hex Code', type: 'text' }, // Hex code should be a string
            { label: 'Item Cost', type: 'number' } // Always include "Item Cost"
        ];

        if (isTypeBased) {
            fields.unshift({ label: 'Item Type Name', type: 'text' });
        } else {
            fields.unshift({ label: 'Cost Threshold', type: 'number' });
        }

        fields.forEach(field => {
            const label = document.createElement('label');
            label.innerText = `${field.label}: `;
            const input = document.createElement('input');
            input.type = field.type;

            // Disable "Item Cost" if cost-based
            if (field.label === 'Item Cost' && !isTypeBased) {
                input.disabled = true;
            }

            const sanitizedLabel = field.label.replace(/\s+/g, '').toLowerCase(); // Remove spaces for class name
            input.classList.add(sanitizedLabel);

            itemFieldset.appendChild(label);
            itemFieldset.appendChild(input);
            itemFieldset.appendChild(document.createElement('br'));
        });

        categoryFieldset.appendChild(itemFieldset);
    };

    addItemButton.addEventListener('click', addItem);

    // Change label and enable/disable "Item Cost" field when category type is changed
    typeSelect.addEventListener('change', function() {
        const existingItems = categoryFieldset.querySelectorAll('fieldset');
        existingItems.forEach(itemFieldset => {
            const labels = itemFieldset.querySelectorAll('label');
            const itemCostInput = itemFieldset.querySelector('.itemcost'); // Target input by class

            if (typeSelect.value === 'type-based') {
                // Change "Cost Threshold" to "Item Type Name"
                labels[0].innerText = 'Item Type Name: ';
                if (itemCostInput) itemCostInput.disabled = false; // Enable "Item Cost"
            } else {
                // Change "Item Type Name" to "Cost Threshold"
                labels[0].innerText = 'Cost Threshold: ';
                if (itemCostInput) itemCostInput.disabled = true; // Disable "Item Cost"
            }
        });
    });

    categoryFieldset.append(legend, nameLabel, nameInput, document.createElement('br'), typeLabel, typeSelect, document.createElement('br'), addItemButton);
    categoriesContainer.appendChild(categoryFieldset);
});

document.getElementById('generateJsonButton').addEventListener('click', function() {
    const categories = {};
    let valid = true;

    document.querySelectorAll('#categoriesContainer > fieldset').forEach(categoryFieldset => {
        const categoryName = categoryFieldset.querySelector('input[type=text]').value;
        const categoryType = categoryFieldset.querySelector('select').value;
        const items = {};

        categoryFieldset.querySelectorAll('fieldset').forEach(itemFieldset => {
            const inputs = itemFieldset.querySelectorAll('input');
            const values = [];
            let itemNameOrCostThreshold = null;

            inputs.forEach((input, index) => {
                if (input && input.value === '' && !(input.classList.contains('itemcost') && categoryType === 'cost-based')) {
                    alert('All fields must be filled out!');
                    input.focus();
                    valid = false;
                    return false;
                }

                if (index === 0) {
                    itemNameOrCostThreshold = input ? input.value : null;
                } else if (input) {
                    // Ensure the hex code remains a string, and all other values are numbers
                    if (input.classList.contains('hexcode')) {
                        values.push(input.value); // Store hex code as string
                    } else if (!(input.classList.contains('itemcost') && categoryType === 'cost-based')) {
                        values.push(Number(input.value)); // Store as a number
                    }
                }
            });

            if (valid && itemNameOrCostThreshold !== null) {
                items[itemNameOrCostThreshold] = values;
            }
        });

        if (valid && categoryName) {
            categories[categoryName] = items;
        }
    });

    if (valid) {
        // Convert to JSON string
        const jsonString = JSON.stringify(categories);
        
        // Wrap in single quotes
        const quotedJsonString = `'${jsonString}'`;

        // Display in the output with formatting
        document.getElementById('output').innerText = JSON.stringify(categories, null, 4).replace(/\"/g, "'");

        // Copy to clipboard without formatting
        navigator.clipboard.writeText(quotedJsonString).then(() => {
            alert('JSON copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
});
