---
title: Les générateurs congruentiels
date: 2026-10-04
published: true
description: "Un billet sur les générateurs pseudo-aléatoires et le théorème de Marsaglia." 
slug: "lcg"
---

Les générateurs pseudo-aléatoires sont des algorithmes qui génèrent de manière déterministe des suites de nombres qui imitent des suites aléatoires.
Un bon générateur exige un équilibre entre la performance et la qualité statistique. 
La qualité statistique est mesurée par différents tests, dont on retrouve plusieurs exemples dans le chapitre 3 du livre *The Art of Computer Programming* de Knuth, excellente référence sur le sujet. 

## La théorie des générateurs congruentiels linéaires

Les *générateurs congruentiels linéaires* sont des générateurs particulièrement populaires, notamment à cause de leur simplicité et leur efficacité. Cependant, ils font souvent mauvaise figure dans plusieurs tests statistiques.
Ces générateurs sont définis par la formule
$$
    x_{n+1} = (ax_n+c) \bmod m,
$$
où $a$ (le multiplicateur), $c$ (l'incrément) et $m$ (le module) sont des constantes.
Le choix de ces constantes, que les informaticiens appellent *chiffres magiques*, détermine à la fois la performance et la qualité du générateur.
Les générateurs congruentiels linéaires ont une complexité spatiale et temporelle constante, mais en pratique la performance varie significativement avec le choix des chiffres magiques.
La meilleure performance temporelle est obtenue en choisissant $c=0$ et $m = 2^k$, typiquement $k = 32$, $64$ ou $128$.
Cependant le gain d'efficacité est au prix d'une moindre qualité statistique.

Les générateurs congruentiels linéaires, comme tout générateur dont les valeurs ne dépendent que d'un nombre borné de valeurs précédentes, sont ultimement périodiques: il existe $i\geq 0,p>0$ tels que $x_{n} = x_{n+p}$ pour tous $n\geq i$. 
(Ce phénomène de périodicité est lié au fait que tout élément d'un semigroupe fini admet une puissance idempotente.)
Une période trop courte trahit la nature déterministe du générateur, avec pour corollaire une mauvaise performance statistique. 
Une longue période est préférable, bien que non suffisant pour garantir la qualité statistique du générateur (les chiffres magiques $a=1, c=0$ donnent une période maximale, mais une qualité statistique minimale). 
Pour les générateurs congruentiels d'incrément $c\neq 0$, le théorème de Hull-Dobbell caractérise précisément les chiffres magiques garantissent une période maximale (de longueur $m$).

---
**Théorème** (Hull–Dobbell). Le générateur congruentiel linéaire déterminé par les chiffres magiques $a,c,m$ a une période de longueur $m$ si et seulement si les conditions suivantes sont satisfaites:
1. $m$ et $c$ sont relativement premiers
2. $a-1$ est divisible par tous les facteurs premiers de $m$.
3. $a-1$ est divisible par 4 si $m$ l'est aussi.  
---

La situation est différente pour les générateurs d'incrément $c=0$, appelés *générateurs congruentiels multiplicatifs*.
Dans ce cas, la période est l'entier minimal $\lambda\geq 1$ tel que $a^\lambda \equiv 1 \bmod m$, appelé l'*ordre* de $a$ modulo $m$.
L'ordre des éléments est bornée par l'[indicatrice d'Euler](https://fr.wikipedia.org/wiki/Indicatrice_d%27Euler) $\varphi$; en fait,  la formule $a^{\varphi(m)} \equiv 1 \bmod m$ (le [théorème d'Euler](https://fr.wikipedia.org/wiki/Th%C3%A9or%C3%A8me_d%27Euler_(arithm%C3%A9tique))) entraîne que l'ordre de tout élément est un diviseur de $\varphi(m)$.  
Les multiplicateurs d'ordre maximal sont appelés les *éléments primitifs* modulo $m$. 
Un générateur congruentiel multiplicatif de période maximal est donc obtenu en choisissant un multiplicateur primitif relativement au module.
Si le module est une puissance de nombre premier, $m=p^k$, alors l'ordre $\lambda(p^k)$ des éléments primitifs est donné par la formule suivante, qui remonte aux *Disquisitiones arithmeticae* de Gauss:
$$
    \lambda(p^k) =
    \begin{cases}
        2^{k-1} & p=2, k\leq 2, \\\\
        2^{k-2} & p=2, k\geq 3, \\\\
        p^{k-1}(p-1) & p>2.
    \end{cases}
$$
Dans les cas où $m=2^k$, $k\geq 3$, un générateur congruentiel multiplicatif de période maximale a donc deux orbites distinctes, qu'il est aisé de déterminer.
Par exemple, un générateur congruentiel linéaire de module $m=2^{64}$ a une période maximale de $m/4 = 2^{62}$, et les éléments primitifs sont les entiers qui satisfont $a\equiv 3$ ou $5\bmod 8$ (cf. *The Art of Computer Programming*).
Si $a\equiv 3\bmod 8$, les deux orbites maximales du générateurs sont $\lbrace x \mid x \equiv 1 \text{ ou } 3 \bmod 8 \rbrace$ et $\lbrace x \mid x \equiv 5 \text{ ou } 7 \bmod 8 \rbrace$; pour $a\equiv 5\bmod 8$,  $\lbrace x \mid x \equiv 1 \text{ ou } 5 \bmod 8 \rbrace$ et $\lbrace x \mid x \equiv 3 \text{ ou } 7 \bmod 8 \rbrace$.
Dans chaque cas les orbites une partition des entiers impairs $0\leq x < 2^{64}$ (les valeurs paires ont des orbites plus petites).

Regardons plus en détail le générateur défini par les chiffres magiques 
$$a=14\\,627\\,392\\,582\\,107\\,131\\,917,\quad m = 2^{64}$$ 
tiré d'[un article de Steele et Vigna](https://doi.org/10.1002/spe.3030).
Voici les 9 premières valeurs produites par ce générateur avec valeur initiale $x_0=1$ exprimées en format hexadécimal.  
```
cafef00ddeadf00d
5f40e3d6deaa60a9
44249433e97a5895
f0714195a0f32f91
3bbc9d710bee5a5d
64038315c6aac6b9
2d98f37ce9fe8765
1c6fe342961c9021
1a396f136adf41ad
```
Le dernier chiffre de la représentation a une période de longueur 8, beaucoup plus petite que la période du générateur. 
Il s'agit d'une faiblesse bien connu des générateurs congruentiels de module $2^k$. 
Si on exprime les valeurs en format binaire, on peut voir ce défaut encore plus clairement;
par exemple, voici les 4 bits moins significatifs (c'est-à-dire les bits droite) des premières valeurs du générateur de Steele et Vigna:
```
1001
0101
0001
1101
1001
0101
0001
1101
1001
```
On voit immédiatement que les deux bits les moins significatifs sont constants, ce qui provient du fait l'élément primitif $a$ est congru à 5 modulo 8, donc à 1 modulo 4; dans le cas d'un élément primitif congru à 3 modulo 8, les quatre bits de droite auront une période de longueur 2 (donc tous les éléments primitifs ne sont pas nés égaux).
Les courtes périodes des bits les moins significatifs provient du fait que les $n$ bits de droite représente les valeurs d'un générateur multiplicatif de module $2^{n}$ (ce qui fondamentalement s'explique par le fait que la projection canonique $\mathbb{Z}\to\mathbb{Z}/2^{n}\mathbb{Z}$ se factorise le long de $\mathbb{Z}\to\mathbb{Z}/2^{m}\mathbb{Z}$). 
Il est donc préférable de n'utiliser que les $k/2$ bits les plus significatifs des valeurs d'un générateurs multiplicatifs de module $2^k$. 

## RANDU et le théorème de Marsaglia

Si la mauvaise qualité des bits les moins significatifs est un problème limité aux seuls générateurs de modules $2^k$, il existe un autre défaut fondamental qui touche tous les générateurs congruentiels linéaires, peu importe le choix du module. 
Ce défaut a été exposé par Marsaglia dans un article intitulé [*Random Numbers Fall Mainly in the Planes*](https://doi.org/10.1073/pnas.61.1.25).
Je cite ici un passage de son article (traduction libre):
> [...] tous les générateurs congruentiels multiplicatifs ont un défaut — un défaut qui les rendent mal adaptés pour plusieurs problèmes de Monte Carlo, et qui ne peut être évité en ajustant la valeur initiale, le multiplicateur ou le module.  

Ce défaut (Marsaglia parle de *nature crystalline*) concerne le *réseau* de $\mathbb{R}^d$ défini par les valeurs $x_n$ du générateur,
$$
    \Lambda_d = \lbrace (x_n,x_{n+1}\dots,x_{n+d-1}) \in\mathbb{R}^d \mid n\in\mathbb{N} \rbrace.
$$
Marsaglia montre que pour les générateurs congruentiels, le réseau $\Lambda_d$ peut être recouvert par un petit nombre d'hyperplans parallèles: en dimension $d$ et avec un module $m$, il n'en faut que
$$
    (d!m)^{1/d}.
$$
Comme dans le cas des périodes courtes, une recouvrement par un petit nombre d'hyperplans parallèles (ou autrement dit, une *structure crystalline* trop régulière) révèle une régularité dans les valeurs du générateur, ce qui se traduit par une mauvaise performance pour certains tests statistiques. 
Le tableau suivant présente quelques valeurs $\lfloor(d!m)^{1/d}\rfloor$ pour différents modules $m=2^k$ aux dimensions $3\leq d\leq 10$ (inspiré d'un tableau similaire apparaissant dans l'article de Marsaglia):

|           |  $d=3$  | $d=4$  | $d=5$ | $d=6$ | $d=7$ |
|---------  | -----   |-----   |-----  |-----  |-----  |
$m=2^{16}$  | 73      | 35     | 24    | 19    | 16    |
$m=2^{31}$  | 2344    | 476    | 192   | 108   | 73    |
$m=2^{32}$  | 2954    | 567    | 220   | 121   | 80    |
$m=2^{36}$  | 7443    | 1133   | 383   | 192   | 119   |
$m=2^{48}$  | 119087  | 9066   | 2022  | 766   | 392   |
$m=2^{64}$  | 4801280 | 145055 | 18579 | 4866  | 1911  |

Ainsi, pour un générateur congruentiel de module $2^{32}$, le réseau $\Lambda_3$ peut toujours être recouvert par $2953$ hyperplans parallèles ou moins; et dans bien des exemples, ce nombre est beaucoup plus petit.

La preuve du théorème de Marsaglia donne une piste pour trouver ces familles d'hyperplans parallèles. 
Trouver un recouvrement de $\Lambda_d$ par des hyperplans parallèles revient à trouver une solution de la congruence
$$
c_1 + c_2a + \dots + c_d a^{d-1} \equiv 0 \mod m,
$$
avec les $c_i$ entiers; en d'autres mots, on cherche un vecteur orthogonal à $(1,a,\dots,a^{d-1})$ dans $(\mathbb{Z}/m\mathbb{Z})^d$. 
Ainsi tous les vecteurs de $\Lambda_d$ sont contenus dans des hyperplans normaux à $\vec c = (c_1,\dots, c_d)$,
$$
    H = \lbrace \vec v\in\mathbb{R}^d \mid \langle \vec c, \vec v\rangle = km \rbrace,
$$
où $k$ est un certain entier. 
Les valeurs du générateur sont dans l'intervalle $[0,m-1]$, donc
$$
    -m\sum_{c_i<0}c_i < \sum c_ix_{n+i-1} < m\sum_{d_i>0}c_i.
$$
Ces bornes délimitent un intervalle contenant $(\sum |c_i|) -1$ multiples de $m$. 
La partie difficile de la preuve du théorème de Marsaglia est donc de montrer l'existence d'une solution $(c_1,\dots,c_d)$ à la congruence ci-dessus telle que 
$$
    \sum|c_i| \leq (d!m)^{1/d},
$$
ce que Marsaglia fait en réduisant le problème à une question géométrique, qui est ensuite résolue par [un théorème de Minkowski](https://fr.wikipedia.org/wiki/Th%C3%A9or%C3%A8me_de_Minkowski).

Un cas célèbre de ce défaut est le générateur RANDU utilisé par IBM dans les années 60, fréquemment cité en ligne comme un exemple de mauvais générateur.
Il s'agit du générateur multiplicatif avec les chiffres magiques $a=65539$ et $m = 2^{31}$.
Le multiplicateur satisfait $a = 2^{16}+3$, ce qui entraîne que $a^2 \equiv 6a - 9\bmod m$.
Le réseau $\Lambda_3$ est donc recouvert par seulement 15 hyperplans parallèles,
$$
    \lbrace (x,y,z)\in\mathbb{R}^3 \mid 9x-6y+z = k\cdot 2^{31} \rbrace, -5\leq k\leq 9,   
$$
soit significativement moins que la borne de 2343 donnée par le théorème de Marsaglia.
Dans cet exempllle, la structure crystalline du générateur est même visible à l'oeil nu; la figure ci-dessous montre 5000 points du réseau $\Lambda_3$, et on peut compter à la main les 15 hyperplans parallèles.
<p align="center">
  <img src="/assets/blog/2026/randu.png" alt="Structure crystalline de RANDU" width="500"/>
</p>

En général, on peut trouver un vecteur normal pour les hyperplans avec une suite de divisions euclidiennes modifiées
$$ 
\begin{aligned}
    b_{d-1} &= q_{d-2}b_{d-2} + r_{d-2}, &-\tfrac{b_{d-2}}2\leq r_{d-2} <\tfrac{b_{d-2}}2\\\\
    r_{d-2} &= q_{d-3}b_{d-3} + r_{d-3}, &-\tfrac{b_{d-3}}2\leq r_{d-3} <\tfrac{b_{d-3}}2\\\\
    &\vdots \\\\
    r_{2} &= q_{1}b_{1} + r_{1}, &-\tfrac{b_{1}}2\leq r_{1} <\tfrac{b_{1}}2
\end{aligned}
$$
où $b_i$ est le représentant de la classe de $a^i$ mod $m$ dans $[0,m-1]$. 
En substituant chaque équation dans la précédente de bas en haut, on obtient
$$
    a^{d-1} \equiv q_{d-2}a^{d-2} + \dots + q_1a + r_1 \mod m,
$$
et donc le réseau $\Lambda_d$ est couvert par $\sum |q_i| + |r_1|$ hyperplans.