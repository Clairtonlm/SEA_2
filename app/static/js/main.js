document.addEventListener('DOMContentLoaded', function() {
    loadSourceNumbers();

    document.getElementById('make-call').addEventListener('click', function() {
        const source = document.getElementById('source').value;
        const destination = document.getElementById('destination').value;
        const operator = document.getElementById('operator').value;

        // Verificação simples
        if (source === "" || destination === "") {
            alert("Por favor, preencha todos os campos!");
            return; // Para não continuar se os campos estiverem vazios
        }

        fetch('/api/make_call', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ source, destination, operator }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao iniciar a chamada."); // Lidar com erros se o status não for 200
            }
            return response.json();
        })
        .then(data => {
            alert(`Chamada iniciada: ${data.file}`);
            saveCallToLocalStorage(source, destination, operator);
            updateCallInfo(source, destination, operator, "Em andamento");
        })
        .catch(error => {
            console.error('Erro:', error);
            alert("Houve um erro ao realizar a chamada. Veja o console para mais detalhes.");
        });
    });

    // Outras funcionalidades
    document.getElementById('generate-report').addEventListener('click', function() {
        generateReport();
    });

    document.getElementById('new-call').addEventListener('click', function() {
        resetCallInfo(); // Resetar informações da chamada
    });
});

function loadSourceNumbers() {
    fetch('/api/load_numbers')
        .then(response => response.json())
        .then(data => {
            const sourceSelect = document.getElementById('source');
            if (data.numbers.length > 0) {
                data.numbers.forEach(number => {
                    const option = document.createElement('option');
                    option.value = number;
                    option.textContent = number;
                    sourceSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.textContent = "Nenhum número encontrado";
                sourceSelect.appendChild(option);
            }
        })
        .catch(error => console.error('Erro ao carregar números:', error));
}

function saveCallToLocalStorage(source, destination, operator) {
    const callInfo = { source, destination, operator, status: "Em andamento" };
    const callHistory = JSON.parse(localStorage.getItem('callHistory')) || [];
    callHistory.push(callInfo);
    localStorage.setItem('callHistory', JSON.stringify(callHistory));
}

function updateCallInfo(source, destination, operator, status) {
    document.getElementById('current-source').textContent = source;
    document.getElementById('current-destination').textContent = destination;
    document.getElementById('current-operator').textContent = operator;
    document.getElementById('current-status').textContent = status;
}

function generateReport() {
    const callHistory = JSON.parse(localStorage.getItem('callHistory')) || [];
    let reportContent = "Histórico de Chamadas:\n\n";

    callHistory.forEach((call, index) => {
        reportContent += `Chamada ${index + 1}:\n`;
        reportContent += `Número de Origem: ${call.source}\n`;
        reportContent += `Número Destino: ${call.destination}\n`;
        reportContent += `Operadora: ${call.operator}\n`;
        reportContent += `Status: ${call.status}\n\n`;
    });

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'call_report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetCallInfo() {
    document.getElementById('current-source').textContent = '';
    document.getElementById('current-destination').textContent = '';
    document.getElementById('current-operator').textContent = '';
    document.getElementById('current-status').textContent = '';
}