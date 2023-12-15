let month = localStorage.getItem('month') || 11;
let year = parseInt(localStorage.getItem('year')) || 2023;

const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const monthHeader = document.getElementById('month-header');
const calendarGrid = document.getElementById("calendar-grid");
const submitButton = document.getElementById('submit-button');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const date = document.getElementById('date');
const location_input = document.getElementById('location');
const employer = document.getElementById('employer');
const workType = document.getElementById('workType');
const hourlyWage = document.getElementById('hourlyWage');

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

const response = await fetch('http://localhost:3000/jobs')
const data = await response.json();
localStorage.setItem('jobs', JSON.stringify(data));

const renderCalendar = async () => {
    const monthName = months[month].name;
    calendarGrid.innerHTML = '';
    monthHeader.textContent = `${monthName} ${year}`;
    let jobsArray = JSON.parse(localStorage.getItem('jobs'));
    let jobsMap = {};
    for (const job of jobsArray) {
        if (jobsMap[job.date]) {
            jobsMap[job.date].push(job);
        }
        else {
            jobsMap[job.date] = [job];
        }
    }
    for (let item of months[month].days) {
        let mapKey = `${year}-${parseInt(month) + 1}-${item}`;
        let gridItem = document.createElement("button");
        let modal = document.createElement("dialog");
        modal.id = `${months[month]}-${months[month].days}`
        gridItem.classList.add('grid-item');
        gridItem.classList.add('card');
        
        // Assign a function to the onclick event
        gridItem.onclick = function() {
            modal.showModal();
        };

        gridItem.innerHTML = String(item);
        
        // Define the content of the modal
        let modalContent = document.createElement('p');
        let closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            const corr_modal = modal.closest('dialog')
            corr_modal.close();
        })
        modalContent.innerHTML = `<p>${monthName} ${item}</p>`;
        // MODAL CONTENT WILL GO HERE append all jobs as list
        if (jobsMap[mapKey]) {
            console.log("THIS MAPKEY HAS JOBS", mapKey);
            for (const job of jobsMap[mapKey]) {
                let jobListItem = document.createElement('ol');
                jobListItem.textContent = JSON.stringify(job);
                modalContent.appendChild(jobListItem);
            }
        }
        else {
            modalContent.innerHTML += `<br/><p>${"No Jobs Today"}</p>`
        }
        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
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
    renderCalendar();
}

nextButton.addEventListener('click', () => {
    updateMonthHeader(true);
});

prevButton.addEventListener('click', () => {
    updateMonthHeader(false);
});

const validateString = () => {
    return true;
}

renderCalendar();