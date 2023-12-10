let month = localStorage.getItem('month') || 11;
let year = parseInt(localStorage.getItem('year')) || 2023;

const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const monthHeader = document.getElementById('month-header');
const calendarGrid = document.getElementById("calendar-grid");

const months = [
    {name:"January", days:Array.from({ length: 31 }, (_, index) => index + 1)},
    {name:"February", days: Array.from({ length: 28 }, (_, index) => index + 1)},
    {name:"March", days: Array.from({ length: 31 }, (_, index) => index + 1)},
    {name:"April", days: Array.from({ length: 30 }, (_, index) => index + 1)},
    {name:"May", days: Array.from({ length: 31 }, (_, index) => index + 1)},
    {name:"June", days: Array.from({ length: 30 }, (_, index) => index + 1)},
    {name:"July", days: Array.from({ length: 31 }, (_, index) => index + 1)},
    {name:"August", days: Array.from({ length: 31 }, (_, index) => index + 1)},
    {name:"September", days: Array.from({ length: 30 }, (_, index) => index + 1)},
    {name:"October", days: Array.from({ length: 31 }, (_, index) => index + 1)},
    {name:"November", days: Array.from({ length: 30 }, (_, index) => index + 1)},
    {name:"December", days: Array.from({ length: 31 }, (_, index) => index + 1)},
];

const renderBoard = () => {
    const monthName = months[month].name
    calendarGrid.innerHTML = '';
    monthHeader.textContent = `${monthName} ${year}`;
    
    for (let item of months[month].days) {
        let gridItem = document.createElement("button");
        let modal = document.createElement("dialog");
        gridItem.classList.add('grid-item');
        gridItem.classList.add('card');
        
        // Assign a function to the onclick event
        gridItem.onclick = function() {
            modal.showModal();
        };

        gridItem.innerHTML = String(item);
        
        // Define the content of the modal
        modal.innerHTML = `<p>${monthName} ${item}</p> <button onclick="this.closest('dialog').close()">Close</button>`;
        
        // Append modal to the body or a specific container
        // Make sure to append the modal outside the for-loop if all items use the same modal
        document.body.appendChild(modal);

        calendarGrid.appendChild(gridItem);
    }
};

const updateMonthHeader = (next) => {
    if (next) {
        month = (month + 1) % 12;
        if (month % 12 == 0) {
            year = parseInt(year) + 1;
        }
    }
    else {
        month -= 1;
        if (month === -1) {
            month = 11;
            year = parseInt(year) - 1;
        }
    }
    localStorage.setItem('month', month);
    localStorage.setItem('year', year);
    renderBoard();
}

nextButton.addEventListener('click', () => {
    updateMonthHeader(true);
})

prevButton.addEventListener('click', () => {
    updateMonthHeader(false);
})

renderBoard()
