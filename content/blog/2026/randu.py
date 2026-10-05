class RANDU:

    def __init__(self,seed):
        self.state=seed
        self.a = 65539
        self.m = 2**32

    def next(self):
        self.state = (self.a*self.state)%self.m
        return self.state