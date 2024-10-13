document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    
    let query = document.getElementById('query').value;
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'query': query
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        displayResults(data);
        displayChart(data);
    });
});

function displayResults(data) {
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>';
    for (let i = 0; i < data.documents.length; i++) {
        let docDiv = document.createElement('div');
        docDiv.innerHTML = `<strong>Document ${data.indices[i]}</strong><p>${data.documents[i]}</p><br><strong>Similarity: ${data.similarities[i]}</strong>`;
        resultsDiv.appendChild(docDiv);
    }
}


function displayChart(data) {
    // Input: data (object) - contains the following keys:
    //        - documents (list) - list of documents
    //        - indices (list) - list of indices   
    //        - similarities (list) - list of similarities
    // TODO: Implement function to display chart here
    //       There is a canvas element in the HTML file with the id 'similarity-chart'

    // Log the entire data object to see its structure
    console.log('Data received for chart:', data);
    
    // Log the similarities array to check its contents
    console.log('Similarities:', data.similarities);
    
    // Log the length of the similarities array
    console.log('Length of similarities:', data.similarities ? data.similarities.length : 'No similarities array');
    
    // If similarities are invalid, return early
    if (!data.similarities || data.similarities.length === 0) {
        console.error('No valid similarities data to display.');
        return;
    }

     // Destroy existing chart if it exists
     if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    // Select the canvas element using its ID and get the 2D context for Chart.js
    const ctx = document.getElementById('similarity-chart').getContext('2d');
    
    // Create the chart using Chart.js
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            // Map the indices to "Doc X" format for labeling the x-axis
            labels: data.indices.map(i => `Doc ${i}`),
            datasets: [{
                label: 'Cosine Similarity',
                // Data for the bar heights (cosine similarity values)
                data: data.similarities,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',  // Bar color
                borderColor: 'rgba(75, 192, 192, 1)',  // Bar border color
                borderWidth: 1  // Width of the bar border
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true  // Ensures y-axis starts at 0
                }
            }
        }
    });
}