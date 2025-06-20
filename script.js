document.addEventListener('DOMContentLoaded', () => {
    // Select the root element where the calculator will be built
    const appRoot = document.getElementById('app-root');

    // Create main calculator container with Bootstrap classes
    const calculatorContainer = document.createElement('div');
    calculatorContainer.id = 'calculator-container';
    calculatorContainer.classList.add('container-fluid'); // Make it fluid for responsiveness
    appRoot.appendChild(calculatorContainer);

    // Create display input field with Bootstrap classes
    const display = document.createElement('input');
    display.type = 'text';
    display.id = 'display';
    display.classList.add('form-control', 'mb-3'); // Bootstrap form control and margin-bottom
    display.readOnly = true;
    display.value = '0';
    calculatorContainer.appendChild(display);

    // Create buttons grid container with Bootstrap classes
    const buttonsGrid = document.createElement('div');
    buttonsGrid.className = 'buttons-grid';
    buttonsGrid.classList.add('row', 'g-2'); // Bootstrap row and gutter for spacing
    calculatorContainer.appendChild(buttonsGrid);

    // Define calculator buttons, including memory functions
    // The 'col-3' makes it a 4-column grid (12/3 = 4)
    // The 'col-6' for equals makes it span 2 columns (2 * col-3 = col-6)
    const buttons = [
        { text: 'MC', class: 'memory', type: 'memory-clear', bsColClass: 'col-3' },
        { text: 'M+', class: 'memory', type: 'memory-add', bsColClass: 'col-3' },
        { text: 'M-', class: 'memory', type: 'memory-subtract', bsColClass: 'col-3' },
        { text: 'C', class: 'clear', type: 'clear', bsColClass: 'col-3' },
        { text: '7', class: 'number', type: 'number', bsColClass: 'col-3' },
        { text: '8', class: 'number', type: 'number', bsColClass: 'col-3' },
        { text: '9', class: 'number', type: 'number', bsColClass: 'col-3' },
        { text: '/', class: 'operator', type: 'operator', bsColClass: 'col-3' },
        { text: '4', class: 'number', type: 'number', bsColClass: 'col-3' },
        { text: '5', class: 'number', type: 'number', bsColClass: 'col-3' },
        { text: '6', class: 'number', type: 'number', bsColClass: 'col-3' },
        { text: '*', class: 'operator', type: 'operator', bsColClass: 'col-3' },
        { text: '1', class: 'number', type: 'number', bsColClass: 'col-3' },
        { text: '2', class: 'number', type: 'number', bsColClass: 'col-3' },
        { text: '3', class: 'number', type: 'number', bsColClass: 'col-3' },
        { text: '-', class: 'operator', type: 'operator', bsColClass: 'col-3' },
        { text: '0', class: 'number', type: 'number', bsColClass: 'col-3' },
        { text: '00', class: 'number', type: 'number', bsColClass: 'col-3' },
        { text: '.', class: 'number', type: 'decimal', bsColClass: 'col-3' },
        { text: '+', class: 'operator', type: 'operator', bsColClass: 'col-3' }, // + moved here for layout
        { text: '%', class: 'operator', type: 'operator', bsColClass: 'col-3' }, // Modulus
        { text: '=', class: 'equals', type: 'equals', bsColClass: 'col-9' } // Make equals span 3 columns (col-9)
    ];

    let currentExpression = '';
    let resultDisplayed = false;

    // Memory variables and functions
    const MEMORY_KEY = 'calculatorMemory';
    let memoryValue = 0;

    // Function to load memory from localStorage
    function loadMemory() {
        const storedMemory = localStorage.getItem(MEMORY_KEY);
        if (storedMemory !== null) {
            memoryValue = parseFloat(storedMemory);
        } else {
            memoryValue = 0;
        }
    }

    // Call loadMemory when the script initializes
    loadMemory();

    // Function to update the display
    function updateDisplay(value) {
        // Simple display overflow prevention
        const stringValue = String(value);
        if (stringValue.length > 15 && !isNaN(value)) {
            // If it's a number, try to use scientific notation or trim decimal places
            display.value = parseFloat(value).toPrecision(10);
        } else {
            display.value = stringValue;
        }
    }

    // Function to handle button clicks
    function handleButtonClick(buttonValue, buttonType) {
        if (buttonType === 'number' || buttonType === 'decimal') {
            if (resultDisplayed) {
                currentExpression = buttonValue;
                resultDisplayed = false;
            } else {
                // Prevent multiple leading zeros for numbers
                if (buttonValue === '0' && currentExpression === '0') {
                    return;
                }
                if (buttonValue === '00' && currentExpression === '0') {
                    return; // Can't start with '00' if already '0'
                }
                // Prevent multiple decimals in the current number segment
                if (buttonValue === '.') {
                    const lastOperatorIndex = Math.max(
                        currentExpression.lastIndexOf('+'),
                        currentExpression.lastIndexOf('-'),
                        currentExpression.lastIndexOf('*'),
                        currentExpression.lastIndexOf('/'),
                        currentExpression.lastIndexOf('%')
                    );
                    const currentNumberSegment = lastOperatorIndex === -1 ? currentExpression : currentExpression.substring(lastOperatorIndex + 1);

                    if (currentNumberSegment.includes('.')) {
                        return; // Already a decimal in the current number segment
                    }
                    if (currentNumberSegment === '') { // If operator was last, prepend '0.'
                        currentExpression += '0';
                    }
                }
                currentExpression += buttonValue;
            }
            updateDisplay(currentExpression);
        } else if (buttonType === 'operator') {
            if (resultDisplayed) {
                // Start new expression with previous result
                currentExpression = display.value + buttonValue;
                resultDisplayed = false;
            } else if (currentExpression === '' && buttonValue === '-') {
                // Allow negative number input at the start
                currentExpression += buttonValue;
            } else if (currentExpression === '') {
                // Don't start with any other operator if expression is empty
                return;
            } else {
                // Replace last operator if a new one is pressed (e.g., '5++' -> '5+')
                const lastChar = currentExpression.slice(-1);
                if (['+', '-', '*', '/', '%'].includes(lastChar)) {
                    currentExpression = currentExpression.slice(0, -1) + buttonValue;
                } else {
                    currentExpression += buttonValue;
                }
            }
            updateDisplay(currentExpression);
        } else if (buttonType === 'clear') {
            currentExpression = '';
            updateDisplay('0');
            resultDisplayed = false;
        } else if (buttonType === 'equals') {
            try {
                let expressionToEvaluate = currentExpression;
                // Remove trailing operator if any before evaluating
                const lastChar = expressionToEvaluate.slice(-1);
                if (['+', '-', '*', '/', '%'].includes(lastChar)) {
                    expressionToEvaluate = expressionToEvaluate.slice(0, -1);
                }

                if (expressionToEvaluate === '') {
                    updateDisplay('0');
                    currentExpression = '';
                    resultDisplayed = true;
                    return;
                }

                // Handle division by zero explicitly before eval for cleaner message
                if (expressionToEvaluate.includes('/0') && !expressionToEvaluate.includes('/0.')) {
                    throw new Error('Division by Zero');
                }

                let result = eval(expressionToEvaluate);

                if (isNaN(result) || !isFinite(result)) {
                    throw new Error('Syntax Error'); // More specific for invalid expressions
                }
                updateDisplay(result);
                currentExpression = String(result);
                resultDisplayed = true;
            } catch (error) {
                if (error.message === 'Division by Zero') {
                    updateDisplay('Div by 0');
                } else {
                    updateDisplay('Syntax Error'); // Catch general eval errors as syntax
                }
                currentExpression = ''; // Clear expression on error
                resultDisplayed = true;
            }
        } else if (buttonType === 'memory-add') {
            try {
                const currentValue = parseFloat(display.value);
                if (!isNaN(currentValue)) {
                    memoryValue += currentValue;
                    localStorage.setItem(MEMORY_KEY, memoryValue.toString());
                    updateDisplay('M+');
                }
            } catch (error) {
                updateDisplay('Error');
            }
            resultDisplayed = true;
        } else if (buttonType === 'memory-subtract') {
            try {
                const currentValue = parseFloat(display.value);
                if (!isNaN(currentValue)) {
                    memoryValue -= currentValue;
                    localStorage.setItem(MEMORY_KEY, memoryValue.toString());
                    updateDisplay('M-');
                }
            } catch (error) {
                updateDisplay('Error');
            }
            resultDisplayed = true;
        } else if (buttonType === 'memory-clear') {
            memoryValue = 0;
            localStorage.removeItem(MEMORY_KEY);
            updateDisplay('MC');
            currentExpression = '0'; // Reset expression to '0' after MC
            resultDisplayed = true;
        }
    }

    // Create and append buttons to the grid
    buttons.forEach(button => {
        const colDiv = document.createElement('div');
        colDiv.classList.add(button.bsColClass); // Add Bootstrap column class

        const btnElement = document.createElement('button');
        btnElement.className = `calc-button ${button.class || ''}`;
        btnElement.textContent = button.text;
        btnElement.setAttribute('data-value', button.text);
        btnElement.setAttribute('data-type', button.type);

        btnElement.addEventListener('click', () => {
            handleButtonClick(button.text, button.type);
        });

        colDiv.appendChild(btnElement);
        buttonsGrid.appendChild(colDiv);
    });

    // Handle keyboard events
    document.addEventListener('keydown', (event) => {
        const key = event.key;

        // Prevent default browser behavior for common calculator keys
        if (['Enter', 'Backspace', 'Delete', '/', '*', '-'].includes(key) || event.code === 'Space') {
            event.preventDefault();
        }

        if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
            handleButtonClick(key, 'number');
        } else if (['+', '-', '*', '/'].includes(key)) {
            handleButtonClick(key, 'operator');
        } else if (key === '%') {
            handleButtonClick(key, 'operator');
        } else if (key === '.') {
            handleButtonClick(key, 'decimal');
        } else if (key === 'Enter') { // Use Enter for equals
            handleButtonClick('=', 'equals');
        } else if (key === 'Backspace') {
            if (!resultDisplayed) {
                currentExpression = currentExpression.slice(0, -1);
                updateDisplay(currentExpression === '' ? '0' : currentExpression);
            } else {
                currentExpression = '0';
                updateDisplay('0');
                resultDisplayed = false;
            }
        } else if (key === 'Delete' || key === 'c' || key === 'C') { // Delete or 'c' for clear
            handleButtonClick('C', 'clear');
        } else {
            // "Only numbers are allowed" for non-numeric/non-operator keys
            // Exclude common modifier keys (Ctrl, Alt, Shift, Meta) and function keys
            // event.repeat prevents multiple alerts for holding down a key
            if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && key.length === 1 && !event.repeat) {
                alert("Only numbers are allowed");
            }
        }
    });
});