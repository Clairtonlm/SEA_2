document.addEventListener('DOMContentLoaded', function() {
    loadSourceNumbers();

    document.getElementById('make-call').addEventListener('click', function() {
        const destination = document.getElementById('destination').value;
        const operator = document.getElementById('operator').value;

        if (!destination) {
            alert("Por favor, preencha o número de destino!");
            return;  // Pare se o número de destino estiver vazio
        }

        // Chamar a função para iniciar as chamadas sequenciais
        makeSequentialCalls(destination, operator);
    });

    document.getElementById('generate-report').addEventListener('click', function() {
        generateReport();
    });

    document.getElementById('new-call').addEventListener('click', function() {
        resetCallInfo(); // Resetar informações da chamada
    });
});

// Função para carregar os números de origem
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

// Função para fazer chamadas sequenciais
function makeSequentialCalls(destination, operator) {
    fetch('/api/load_numbers')
        .then(response => response.json())
        .then(data => {
            const sourceNumbers = data.numbers;
            if (sourceNumbers.length === 0) {
                alert("Nenhum número de origem encontrado!");
                return;
            }

            let callIndex = 0;

            const callNextNumber = () => {
                if (callIndex < sourceNumbers.length) {
                    const source = sourceNumbers[callIndex];
                    // Fazer a chamada
                    fetch('/api/make_call', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json' 
                        },
                        body: JSON.stringify({ source, destination, operator }),
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Erro ao iniciar a chamada. Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Salvar estado da chamada no Local Storage
                        const status = "Chamada Efetuada";  // ou a mensagem de status apropriada
                        saveCallToLocalStorage(source, destination, operator, status);
                        
                        // Adiciona o número atual à tabela do histórico de chamadas
                        addToCallList(source, destination, operator, status);

                        // Próximo número
                        callIndex++;
                        callNextNumber(); // Chamada recursiva para o próximo número
                    })
                    .catch(error => {
                        console.error('Erro durante a chamada:', error);
                        // Lidar com falha na chamada
                        const status = "Erro na Chamada"; // Status de erro
                        saveCallToLocalStorage(source, destination, operator, status);

                        // Adiciona o número atual à tabela mesmo se falhar
                        addToCallList(source, destination, operator, status);

                        // Próximo número mesmo assim
                        callIndex++;
                        callNextNumber();
                    });
                } else {
                    alert("Todas as chamadas foram realizadas.");
                }
            };

            callNextNumber();  // Iniciar a primeira chamada
        })
        .catch(error => {
            console.error('Erro ao carregar números de origem:', error);
            alert("Erro ao carregar números de origem.");
        });
}

// Função para adicionar chamada à lista
function addToCallList(source, destination, operator, status) {
    const callList = document.getElementById('call-list');

    // Cria uma nova linha para a tabela
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${source}</td>
        <td>${destination}</td>
        <td>${status}</td>
        <td>${operator}</td>
    `;
    callList.appendChild(row);
}

function saveCallToLocalStorage(source, destination, operator, status) {
    const callInfo = { source, destination, operator, status };
    const callHistory = JSON.parse(localStorage.getItem('callHistory')) || [];
    callHistory.push(callInfo);
    localStorage.setItem('callHistory', JSON.stringify(callHistory));
}

// Função para gerar relatório
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
    // Limpa o histórico de chamadas
    document.getElementById('current-source').textContent = '';
    document.getElementById('current-destination').textContent = '';
    document.getElementById('current-operator').textContent = '';
    document.getElementById('current-status').textContent = '';

    // Limpa a lista de chamadas
    const callList = document.getElementById('call-list');
    callList.innerHTML = '';
}