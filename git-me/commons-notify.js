// pykelet commons project
// By Andrew Kingdom 2024
// MIT License | CC By
console.log('commons-notify 1.0.2');

function notifyAlert(message, nearElement) {
    // Check if dark mode is preferred
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Create a message element
    const copiedMessage = document.createElement('span');
    copiedMessage.textContent = message;
    copiedMessage.style.position = 'absolute'; // Position it near the icon
    copiedMessage.style.padding = '5px';
    copiedMessage.style.borderRadius = '4px';
    copiedMessage.style.zIndex = '1000';
    copiedMessage.style.transition = 'opacity 0.5s';
    copiedMessage.style.opacity = '1';

    // Set styles for light or dark mode
    if (isDarkMode) {
        copiedMessage.style.backgroundColor = '#333'; // Dark background for dark mode
        copiedMessage.style.color = '#fff'; // Light text for dark mode
    } else {
        copiedMessage.style.backgroundColor = '#e0ffe0'; // Light green background for light mode
        copiedMessage.style.color = '#333'; // Dark text for light mode
    }

    // Position it near the message trigger element
    const iconRect = nearElement.getBoundingClientRect();
    copiedMessage.style.left = `${iconRect.right + 5}px`;
    copiedMessage.style.top = `${iconRect.top}px`;

    // Append the copied message to the body or parent
    document.body.appendChild(copiedMessage);

    // Fade out the message after 2 seconds
    setTimeout(() => {
        copiedMessage.style.opacity = '0';
        setTimeout(() => {
            copiedMessage.remove(); // Remove after fade out
        }, 500); // Wait for fade out to finish
    }, 2000);
}
