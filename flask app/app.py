from flask import Flask, jsonify, request, render_template, send_from_directory
import os
from gtts import gTTS

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/audio'

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Track generated audios
generated_audios = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/check_text', methods=['POST'])
def check_text():
    data = request.json
    text = data['text']

    # Check if audio for this text has already been generated
    exists = any(item['text'] == text for item in generated_audios)
    return jsonify({'exists': exists})

@app.route('/generate_audio', methods=['POST'])
def generate_audio():
    global generated_audios

    data = request.json
    text = data['text']
    file_name = data['file_name']

    # Check if audio for this text has already been generated
    if any(item['text'] == text for item in generated_audios):
        return jsonify({'success': False, 'message': 'Audio for this text has already been generated.'})

    # Generate audio and save to file using gTTS
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{file_name}.mp3")

    try:
        tts = gTTS(text)
        tts.save(file_path)

        # Store generated audio information
        generated_audios.append({'text': text, 'file_name': f"{file_name}.mp3"})
        return jsonify({'success': True, 'message': 'Audio generated successfully.', 'file_name': f"{file_name}.mp3"})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/list_audios', methods=['GET'])
def list_audios():
    return jsonify({'audios': generated_audios})

@app.route('/uploads/audio/<filename>', methods=['GET'])
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/delete_audio/<file_name>', methods=['DELETE'])
def delete_audio(file_name):
    global generated_audios

    # Delete audio file
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
    if os.path.exists(file_path):
        os.remove(file_path)
        generated_audios = [item for item in generated_audios if item['file_name'] != file_name]
        return jsonify({'success': True, 'message': f'Audio {file_name} deleted successfully.'})
    else:
        return jsonify({'success': False, 'message': 'Audio not available.'})

if __name__ == '__main__':
    app.run(debug=True)
