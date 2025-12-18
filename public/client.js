// Calculator state variables
let currentValue = '0';
let previousValue = null;
let currentOperation = null;
let shouldResetDisplay = false;
let calculationHistory = '';

// DOM elements
let resultDisplay;
let calculationDisplay;
let loadingOverlay;
let keys;

document.addEventListener('DOMContentLoaded', () => {
    resultDisplay = document.getElementById('result');
    calculationDisplay = document.getElementById('calculation');
    loadingOverlay = document.getElementById('loading');
    keys = document.querySelectorAll('.key');
});
// Update the display
function updateDisplay() {
    // Format the current value for display
    let displayValue = currentValue;

    // Handle very large or small numbers
    const numValue = parseFloat(currentValue);

    if (!isNaN(numValue)) {
        if (numValue > 99999999 || numValue < -99999999) {
            displayValue = numValue.toExponential(6);
        } else if (numValue !== 0 && Math.abs(numValue) < 0.000001) {
            displayValue = numValue.toExponential(6);
        }
    }

    // Update the main display
    resultDisplay.textContent = displayValue;
    resultDisplay.classList.remove('error');

    // Update the calculation history display
    calculationDisplay.textContent = calculationHistory;
}

// Reset the calculator to initial state
function clearPressed() {
    currentValue = '0';
    previousValue = null;
    currentOperation = null;
    shouldResetDisplay = false;
    calculationHistory = '';
    updateDisplay();
}

// Clear the current entry only
function clearEntryPressed() {
    currentValue = '0';
    updateDisplay();
}

// Toggle the sign of the current value
function signPressed() {
    if (currentValue !== '0') {
        if (currentValue.charAt(0) === '-') {
            currentValue = currentValue.substring(1);
        } else {
            currentValue = '-' + currentValue;
        }
        updateDisplay();
    }
}

// Handle number button presses
function numberPressed(num) {
    // If we just completed a calculation or pressed an operator, reset the display
    if (shouldResetDisplay || currentValue === '0') {
        currentValue = num.toString();
        shouldResetDisplay = false;
    } else {
        // Limit the number of digits to prevent overflow
        if (currentValue.replace(/[-.]/g, '').length < 12) {
            currentValue += num.toString();
        }
    }

    updateDisplay();
}

// Handle decimal point button press
function decimalPressed() {
    // If we just completed a calculation or pressed an operator, reset the display
    if (shouldResetDisplay) {
        currentValue = '0.';
        shouldResetDisplay = false;
    } else if (!currentValue.includes('.')) {
        currentValue += '.';
    }

    updateDisplay();
}

// Handle operation button presses
function operationPressed(op) {
    // If we already have a previous value and operation, calculate it first
    if (previousValue !== null && currentOperation !== null && !shouldResetDisplay) {
        calculateResult();
    }

    // Store the current value and operation
    previousValue = currentValue;
    currentOperation = op;
    shouldResetDisplay = true;

    // Update the calculation history
    calculationHistory = `${previousValue} ${op}`;
    updateDisplay();
}

// Handle equals button press
function equalPressed() {
    // If we have both values and an operation, calculate the result
    if (previousValue !== null && currentOperation !== null) {
        calculateResult();
    }
}

// Perform the calculation
function calculateResult() {
    // Don't calculate if we don't have all the required values
    if (previousValue === null || currentOperation === null) {
        return;
    }

    // Parse the values as numbers
    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);

    // Update calculation history
    calculationHistory = `${previousValue} ${currentOperation} ${currentValue} =`;

    let result;

    // Perform the calculation based on the operation
    switch (currentOperation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            // Handle division by zero
            if (current === 0) {
                resultDisplay.textContent = "Cannot divide by zero";
                resultDisplay.classList.add('error');
                previousValue = null;
                currentOperation = null;
                shouldResetDisplay = true;
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }

    // Format the result to avoid floating point precision issues
    result = parseFloat(result.toPrecision(12));

    // Handle overflow
    if (result > 1e12 || result < -1e12) {
        currentValue = result.toExponential(6);
    } else {
        // Remove trailing zeros after decimal point
        currentValue = result.toString();
        if (currentValue.includes('.')) {
            currentValue = currentValue.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '');
        }
    }

    // Reset operation state
    previousValue = null;
    currentOperation = null;
    shouldResetDisplay = true;

    updateDisplay();
}

// Simulate API call for calculation (for compatibility with original code)
function simulateAPICalculation(operand1, operand2, operation) {
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
        // Parse the values
        const prev = parseFloat(operand1);
        const current = parseFloat(operand2);

        let result;

        // Perform the calculation based on the operation
        switch (operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    setError("Cannot divide by zero");
                    setLoading(false);
                    return;
                }
                result = prev / current;
                break;
            default:
                setError("Invalid operation");
                setLoading(false);
                return;
        }

        // Format the result
        result = parseFloat(result.toPrecision(12));

        // Handle overflow
        if (result > 1e12 || result < -1e12) {
            currentValue = result.toExponential(6);
        } else {
            currentValue = result.toString();
            if (currentValue.includes('.')) {
                currentValue = currentValue.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '');
            }
        }

        // Update the display
        updateDisplay();
        setLoading(false);

        // Reset operation state
        previousValue = null;
        currentOperation = null;
        shouldResetDisplay = true;

    }, 500); // Simulate 500ms delay
}

// Set loading state
function setLoading(loading) {
    if (loading) {
        loadingOverlay.classList.add('active');
        keys.forEach(key => {
            key.classList.add('disabled');
            key.disabled = true;
        });
    } else {
        loadingOverlay.classList.remove('active');
        keys.forEach(key => {
            key.classList.remove('disabled');
            key.disabled = false;
        });
    }
}

// Set error state
function setError(message) {
    resultDisplay.textContent = message;
    resultDisplay.classList.add('error');
}

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    // Prevent default behavior for calculator keys
    if (event.key.match(/[\d+\-*/.=]|Enter|Escape/)) {
        event.preventDefault();
    }

    // Handle number keys
    if (event.key.match(/^\d$/)) {
        numberPressed(parseInt(event.key));
    }

    // Handle decimal point
    else if (event.key === '.') {
        decimalPressed();
    }

    // Handle operators
    else if (event.key === '+') {
        operationPressed('+');
    }
    else if (event.key === '-') {
        operationPressed('-');
    }
    else if (event.key === '*') {
        operationPressed('*');
    }
    else if (event.key === '/') {
        operationPressed('/');
    }

    // Handle equals and Enter key
    else if (event.key === '=' || event.key === 'Enter') {
        equalPressed();
    }

    // Handle Escape key for clear
    else if (event.key === 'Escape') {
        clearPressed();
    }

    // Handle Backspace for clear entry
    else if (event.key === 'Backspace') {
        clearEntryPressed();
    }

    // Handle +/- key
    else if (event.key === 's' || event.key === 'S') {
        signPressed();
    }
});

// Initialize the display
updateDisplay();