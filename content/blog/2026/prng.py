
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
for k in [16,31,32,36,48,64,128]:
    m = 2**k
    row = [(factorial(d)*m)**(1/d) for d in range(3,11)]
    print(" | ".join(str(round(k)) for k in row))

import matplotlib.pyplot as plt
import numpy as np

# Nombre de points de la suite
sample_size = 5002
RANDU = LCG(1,65539,0,2**31)
sample = [RANDU.next() for _ in range(sample_size)]

fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(projection='3d')

x,y,z = sample[:-2], sample[1:-1], sample[2:]
k_values = 9*np.array(x) - 6 * np.array(y) + np.array(z)

scatter = ax.scatter(
    x,y,z,c=k_values,cmap='plasma',s=3
)

# --- 5. Habillage du graphique ---
ax.set_xlabel("$x_n$")
ax.set_ylabel("$x_{n+1}$")
ax.set_zlabel("$x_{n+2}$")

ax.view_init(elev=25, azim=-128, roll=0)

ax.set_xlim(0, 2**31)
ax.set_ylim(0, 2**31)
ax.set_zlim(0, 2**31)

ax.set_xticks([0, 2**31])
ax.set_xticklabels(['0', '$2^{31}$'])
ax.set_yticks([0, 2**31])
ax.set_yticklabels(['0', '$2^{31}$'])
ax.set_zticks([0, 2**31])
ax.set_zticklabels(['0', '$2^{31}$'])

plt.savefig("../../../assets/blog/2026/randu.png", dpi=300, bbox_inches='tight',transparent=True)
plt.show()