class Call:
    def __init__(self, source, destination, operator, status="Pending"):
        self.source = source
        self.destination = destination
        self.operator = operator
        self.status = status

    def to_dict(self):
        return {
            "source": self.source,
            "destination": self.destination,
            "operator": self.operator,
            "status": self.status
        }