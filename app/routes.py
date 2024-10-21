from flask import render_template, request, jsonify
from app import app
from app.asterisk import generate_call_file

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/make_call', methods=['POST'])
def make_call():
    data = request.json
    source = data['source']
    destination = data['destination']
    operator = data['operator']
    
    try:
        # Gerar arquivo de chamada
        filename, content = generate_call_file(source, destination, operator)
        
        # Salvar o arquivo de chamada
        with open(f"{app.config['ASTERISK_PATH']}/{filename}", 'w') as f:
            f.write(content)
        
        return jsonify({'status': 'call initiated', 'file': filename})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/load_numbers', methods=['GET'])
def load_numbers():
    try:
        with open('numbers.txt', 'r') as f:
            numbers = [line.strip() for line in f.readlines() if line.strip()]  # Remove linhas vazias
        return jsonify({'numbers': numbers})
    except Exception as e:
        return jsonify({'error': str(e)}), 500