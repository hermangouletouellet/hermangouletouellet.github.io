import matplotlib.pyplot as plt
import numpy as np

class RANDU:
    def __init__(self, seed=1): 
        self.state = seed

    def __call__(self):
        self.state = (65539 * self.state) % 2**31
        return self.state

randu = RANDU()
sample_size = 5000
values = [randu() for _ in range(sample_size+2)]

fig = plt.figure(figsize=(10,8))
ax = fig.add_subplot(projection='3d')
x,y,z = np.array(values[:-2]),np.array(values[1:-1]),np.array(values[2:])
scatter = ax.scatter(x,y,z,c=9*x-6*y+z,cmap='plasma',s=3)

m = 2**31
ax.set(
    xlim=(0,m),xlabel="$x_n$",xticks=[0,m],xticklabels=['0','$2^{31}$'],
    ylim=(0,m),ylabel="$x_{n+1}$",yticks=[0,m],yticklabels=['0','$2^{31}$'],
    zlim=(0,m),zlabel="$x_{n+2}$",zticks=[0,m],zticklabels=['0','$2^{31}$']
)
ax.view_init(elev=25, azim=-128, roll=0)

plt.show()