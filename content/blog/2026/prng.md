---
title: Les générateurs congruentiels
date: 2026-10-04
published: true
description: "Où je parle des générateurs aléatoires, du théorème de Marsaglia, de RANDU et d'un article de Steele et Vigna." 
slug: "lcg"
---

Les générateurs pseudo-aléatoires (*pseudorandom number generators* en anglais) sont des algorithmes qui génèrent de manière déterministe des suites de nombres qui imitent des suites aléatoires.
Un bon générateur exige un équilibre entre la performance (temps et espace) et la qualité statistique, mesurée par différents tests (on en retrouve plusieurs, par exemple, dans *The Art of Computer Programming* de Knuth, excellente référence sur le sujet). 

## Générateurs congruentiels linéaires

Concentrons-nous sur les générateurs congruentiels linéaires (*linear congruential generators* en anglais). 
Ces générateurs sont définis par la formule récursive
$$
    x_{n+1} = (ax_n+c) \bmod m,
$$
où $a$ (le *multiplicateur*), $c$ (l'*incrément*) et $m$ (le *module*) sont des constantes.
Le choix de ces constantes, que les informaticiens (et maintenant moi) appellent *chiffres magiques*, détermine à la fois la performance et la qualité du générateur.

Les générateurs congruentiels linéaires ont une complexité spatiale et temporelle O(1), mais en pratique la performance temporelle varie significativement avec le choix des chiffres magiques (la performance spatiale n'est jamais un enjeu pour les générateurs congruentiels).
La meilleure performance temporelle est obtenue en choisissant $c=0$ et $m = 2^k$, typiquement $k = 32$, $64$ ou $128$, mais le gain d'efficacité est au prix de la qualité statistique.

Les générateurs congruentiels linéaires, comme tout générateur dont les valeurs ne dépendent que d'un nombre borné de valeurs précédentes, sont toujours ultimement périodiques: il existe $i\geq 0,p>0$ tels que $x_{n} = x_{n+p}$ pour tous $n\geq i$. 
(Ce phénomène de périodicité est lié au fait que tout élément d'un semigroupe fini admet nécessairement puissance idempotente; on peut voir le générateur comme la transformation $n\mapsto (am+c)\bmod m$ de l'ensemble $\{0,\dots,m-1\}$.)

Une période trop courte dévoile rapidement la nature déterministe du générateur, ce qui a pour corollaire une mauvaise performance dans plusieurs tests statistiques. 
Une longue période est donc préférable; cela n'est pas cependant pas suffisant pour garantir la qualité du générateur, comme en témoignent les chiffres magiques $a=1, c=0$, produisant une période maximal avec une qualité statistique minimale. 
Pour les générateurs congruentiels d'incrément $c\neq 0$, le théorème suivant identifie exactement les conditions qui garantissent une période maximale (de longueur $m$ dans ce cas). 

---
**Théorème** (Hull-Dobbell). Le générateur congruentiel linéaire déterminé par les chiffres magiques $a,c,m$ a une période de longueur $m$ si et seulement si les conditions suivantes sont satisfaites:
1. $m$ et $c$ sont relativement premiers
2. $a-1$ est divisible par tous les facteurs premiers de $m$.
3. $a-1$ est divisible par 4 si $m$ l'est aussi.  
---

La situation est différente pour les générateurs d'incrément $c=0$, appelés *générateurs congruentiels multiplicatifs*.
Dans ce cas, la période est l'entier minimal $\lambda\geq 1$ tel que $a^\lambda \equiv 1 \bmod m$, appelé l'*ordre* de $a$ modulo $m$.
L'ordre des éléments est bornée par l'[indicatrice d'Euler](https://fr.wikipedia.org/wiki/Indicatrice_d%27Euler) $\varphi$; en fait, 
la formule $a^{\varphi(m)} \equiv 1 \bmod m$ (le [théorème d'Euler](https://fr.wikipedia.org/wiki/Th%C3%A9or%C3%A8me_d%27Euler_(arithm%C3%A9tique))) entraîne que l'ordre de tout élément est un diviseur de $\varphi(m)$.  
Les multiplicateurs d'ordre maximal sont appelés les *éléments primitifs* modulo $m$. 
Un générateur congruentiel multiplicatif de période maximal est donc obtenu en choisissant un multiplicateur primitif.

Si le module est une puissance de nombre premier, $m=p^k$, alors l'ordre $\lambda(p^k)$ des éléments primitifs est donné par la formule
$$
    \lambda(p^k) =
    \begin{cases}
        2^{k-1} & p=2, k\leq 2, \\
        2^{k-2} & p=2, k\geq 3, \\
        p^{k-1}(p-1) & p>2,
    \end{cases}
$$
(qui remonte aux *Disquisitiones arithmeticae* de Gauss).
Dans les cas où $m=2^k$, $k\geq 3$, un générateur congruentiel multiplicatif de période maximale aura donc deux orbites distinctes, qu'il est aisé de déterminer.

Par exemple, un générateur congruentiel linéaire de module $m=2^{64}$ a une période maximale de $m/4 = 2^{62}$, et les éléments primitifs sont les entiers qui satisfont $a\equiv 3$ ou $5\bmod 8$ (cf. *The Art of Computer Programming*).
Si $a\equiv 3\bmod 8$, les deux orbites maximales du générateurs sont
$$
\{ x \mid x \equiv 1 \text{ ou } 3 \bmod 8 \},\quad
\{ x \mid x \equiv 5 \text{ ou } 7 \bmod 8 \},
$$
alors que pour $a\equiv 5\bmod 8$ les orbites maximales sont 
$$
\{ x \mid x \equiv 1 \text{ ou } 5 \bmod 8 \},\quad
\{ x \mid x \equiv 3 \text{ ou } 7 \bmod 8 \}.
$$
Les orbites forment dans tous les cas une partition des entiers impairs $0\leq x < 2^{64}$ (les valeurs initiales paires ont des orbites plus petites).

Regardons plus en détail le générateur défini par les chiffres magiques $a=14627392582107131917$ et $m = 2^{64}$ (tiré d'[un article de Steele et Vigna](https://doi.org/10.1002/spe.3030)).
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

On peut voir que le dernier chiffre de la représentation a une période de longueur 8, beaucoup plus petite que la période du générateur. 
Il s'agit d'une faiblesse bien connu des générateurs congruentiels dont le module est une puissance de 2. 
Si on exprime plutôt les valeurs en format binaire, on peut voir ce défaut encore plus clairement. 
Par exemples, voici les 4 bits de droite des valeurs ci-dessus:
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
On note ici que les deux bits moins significatifs (ceux à droite) forment une suite constante. C'est dû au fait que l'élément primitif $a$ est congru à 5 modulo 8, donc à 1 modulo 4; dans le cas d'un élément primitif congru à 3 modulo 8, les quatre bits de droite auront une période de longueur 2 (donc tous les éléments primitifs ne sont pas nés égaux).

Les courtes périodes observées dans les bits les moins significatifs provient du fait que les $n$ bits de droite représente les valeurs du générateur multiplicatif de module $2^{n}$ (ce qui fondamentalement s'explique par le fait que la projection canonique $\mathbb{Z}\to\mathbb{Z}/2^{n}\mathbb{Z}$ se factorise le long de $\mathbb{Z}\to\mathbb{Z}/2^{m}\mathbb{Z}$). 
Il est donc préférable de n'utiliser que les $k/2$ bits les plus significatifs des valeurs d'un générateurs multiplicatifs de module $2^k$. 

## RANDU et le théorème de Marsaglia

Si la mauvaise qualité des bits les moins significatifs est un problème  aux générateurs de modules $2^n$, il existe un autre défaut fondamental qui touche tous les générateurs congruentiels multiplicatifs, peu importe le choix du module. 
Ce défaut a été exposé par Marsaglia dans un article intitulé [*Random Numbers Fall Mainly in the Planes*](https://doi.org/10.1073/pnas.61.1.25).
Je cite ici un passage de son article (traduction libre):
> [...] tous les générateurs congruentiels multiplicatifs ont un défaut — un défaut qui les rendent mal adaptés pour plusieurs problèmes de Monte Carlo, et qui ne peut être évité en ajustant la valeur initiale, le multiplicateur ou le module.  

Le défaut en question est que la suite produite tend à concentrer les vecteurs $(x_n, x_{n+1},\dots,x_{n+d})$ dans un nombre restreint d'hyperplans. 
Avec une suite véritablement aléatoire (uniformément distribué) on s'attendrait à ce que ces vecteurs soit distribués uniformément dans l'hypercube $[0,m-1]^d$.  
Marsaglia qu'une borne supérieure sur le nombre d'hyperplans contenant ces vecteurs en fonction de la dimension $d$ et du module $m$ est
$$
    (d!m)^{1/d}.
$$
La preuve de Marsaglia fait intervenir notamment 
Voici un tableau avec les valeurs $\lfloor(d!m)^{1/d}\rfloor$ à différentes valeurs $m=2^k$ pour les dimensions $3\leq d\leq 10$, inspiré d'un tableau similaire apparaissant dans l'article de Marsaglia:

|         | $d=3$ | $d=4$ | $d=5$ | $d=6$ | $d=7$ | $d=8$ | $d=9$ | $d=10$ | 
|---------|-----|-----|-----|-----|-----|-----|-----|------|
$m=2^{16}$  | 73 | 35 | 24 | 19 | 16 | 15 | 14 | 14
$m=2^{32}$  |2954 | 567 | 220 | 121 | 80 | 60 | 49 | 42
$m=2^{36}$  |7443 | 1133 | 383 | 192 | 119 | 85 | 66 | 55
$m=2^{48}$  |119087 | 9066 | 2022 | 766 | 392 | 241 | 167 | 126
$m=2^{64}$  |4801280 | 145055 | 18579 | 4866 | 1911 | 964 | 573 | 382

Ainsi pour un générateur de module $2^{32}$, il est possible de recouvrir tous les vecteurs $(x_n, x_{n+1}, x_{n+2})$ par $2954$ hyperplans ou moins.
À titre de comparaison, un générateur qui produirait le plus de vecteurs possibles ($2^{90}$ pour un générateur avec une orbite maximale de $2^{30}$ éléments) nécessiterait $2^{30} = 1073741824$ hyperplans. 

Le générateur RANDU, utilisé par IBM dans les années 60, est un exemple emblématique de LCG de qualité douteuse.
Il s'agit du LCG utilisant les chiffres magiques $a=65539$, $c=0$ et $m = 2^{32}$.

