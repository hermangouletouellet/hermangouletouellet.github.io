from math import factorial

def generalized_euclid(a,b):
    q,r = (a//b),a-(a//b)*b
    q+=(r>=b/2)
    r-=(r>=b/2)*b
    return q,r

def find_hyperplanes(a,m,d):
    v = [(a**k)%m for k in range(1,d-1)]
    c = (a**(d-1))%m
    res = []
    for b in reversed(v):
        q,r = generalized_euclid(c,b)
        res.append( (q,r) )
        c=r
    return ([-q for q,_ in res] + [-res[-1][-1]])

for d in range(3,10):
    coeffs = find_hyperplanes(65539,2**31,d)
    print("RANDU, d={}:".format(d),coeffs)
    print("Marsaglia upper bound:",int((factorial(d)*2**31)**(1/d)))
    print("Number of hyperplanes:",sum(abs(x) for x in coeffs))

print("===================")
for d in range(3,10):
    coeffs = find_hyperplanes(14627392582107131917,2**64,d)
    print("Steele and Vigna, d={}:".format(d),coeffs)
    print("Marsaglia upper bound:",int((factorial(d)*2**31)**(1/d)))
    print("Number of hyperplanes:",sum(abs(x) for x in coeffs))