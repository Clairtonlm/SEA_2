from datetime import datetime

def generate_call_file(source, destination, operator):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"call_{timestamp}.call"
    
    content = f"""Channel: Local/{source}@from-internal
MaxRetries: 0
RetryTime: 60
WaitTime: 30
Context: from-internal
Extension: {destination}
Priority: 1
SetVar: OPERATOR={operator}
"""
    return filename, content