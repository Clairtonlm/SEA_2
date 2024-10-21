import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'chave-secreta-padrao'
    ASTERISK_PATH = '/var/spool/asterisk/outgoing/'  # Ajuste conforme necessário