
class LCG:

    def __init__(self,seed,a,c,m):
        self.state=seed
        self.a = a
        self.m = m
        self.c = c

    def next(self):
        self.state = (self.a*self.state)%self.m
        return self.state

# 1st computationnally easy LCG proposed by Steele and Vigna
a = 0xCAFEF00DDEADF00D
SV1 = LCG(3,a,0,2**64)

# printing multiplier
print(a, a%8)

# printing first 9 values in hex
for k in range(2**4+1):
    print(format(SV1.next(),"016x"))

# printing first 9 values in bin
for k in range(2**4+1):
    print(format(SV1.next(),"064b"))

# generating data for Marsaglia table
from math import factorial
for k in [16,32,36,48,64,128]:
    m = 2**k
    row = [(factorial(d)*m)**(1/d) for d in range(3,11)]
    print(" | ".join(str(round(k)) for k in row))