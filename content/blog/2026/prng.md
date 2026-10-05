---
title: Les générateurs congruentiels
date: 2026-10-04
published: true
description: "Où je parle des LCG, du théorème de Marsaglia, de RANDU et d'un article de Steele et Vigna." 
---

Les générateurs pseudo-aléatoires, ou PRNG d'après le nom anglais (*pseudorandom number generators*), sont des algorithmes permettant de générer, de manière déterministe, des suites de nombres qui imitent des suites aléatoires.
La conception d'un bon PRNG est un exercice délicat qui exige de trouver un équilibre entre la performance (temps et espace) et la qualité statistique de la suite produite. 
Il existe de nombreux tests différents permettant de mesurer la qualité d'un PRNG - on en retrouve plusieurs, par exemple, dans *The Art of Computer Programming* de Knuth, qui demeure une excellente référence sur le sujet. Nous discuterons un peu plus loin d'un de ces tests, appelé *test spectral*.

## Générateurs congruentiels

Dans ce billet, nous allons nous concentrer sur les générateurs congruentiels linéaires, ou LCG d'après le nom anglais (*linear congruential generators*). 
Les LCG sont définis par la formule récursive
$$
    x_{n+1} = (ax_n+c) \bmod m,
$$
où $a$, $c$ et $m$ sont des constantes.
 
La constante $m$ est appelée le *module*, la constante $a$ le *multiplicateur*, la constante $c$ l'*incrément*. 
Le choix de ces constantes (les informaticiens utilisent souvent le terme *chiffres magiques*) est extrêmement important, car elle détermine à la fois la performance et la qualité du générateur.  
Les LCG ont une complexité spatiale et temporelle O(1), mais en pratique la performance temporelle varie significativement avec le choix des chiffres magiques. (La performance spatiale n'est jamais un enjeu avec les LCG.)
La meilleure performance est obtenue en choisissant $c=0$ et $m = 2^k$, typiquement avec $k\leq 64$. 

Les LCG sont toujours périodiques, c'est-à-dire qu'il existe deux indices $i$ et $p$ tels que $x_{n} = x_{n+p}$ pour tout $n\geq i$. 
En fait, la périodicité est loin d'être une limitation des seuls LCG: tout PRNG dont les valeurs ne dépendent que de la seule valeur précédente, ou même d'un nombre borné de valeurs précédentes, sera nécessairement périodique (pour la même raison que tout élément d'un semigroupe fini admet nécessairement puissance idempotente).
Une période trop courte révèle rapidement la nature déterministe du générateur. Cependant une longue période n'est pas garante de qualité, comme en témoignent les très mauvais chiffres magiques $a=c=1$. 
Pour les LCG d'incréments $c\neq 0$, le théorème de Hull-Dobell identifie exactement les conditions qui garantissent une période maximale, de longueur $m$. 

> **Théorème** (Hull-Dobbell). Le LCG déterminé par les chiffres magiques $a,c,m$ a une période de longueur $m$ si et seulement si les conditions suivantes sont satisfaites:
> 1. $m$ et $c$ sont relativement premiers
> 2. $a-1$ est divisible par tous les facteurs premiers de $m$.
> 3. $a-1$ est divisible par 4 si $m$ l'est aussi.  

La situation est différentes pour les générateurs d'incrément $c=0$ (les générateurs congruentiels multiplicatifs, ou MCG).
Dans ce cas, la période maximale est bornée par l'indicatrice d'Euler. 
Il s'agit, pour rappel, de la fonction dont la valeur $\varphi(n)$ est le nombre d'entiers naturels $k\leq n$ relativement premiers avec $n$. 

>**Théorème** (Euler). Soit $m\geq 1$ et $a$ un entier relativement premier avec $m$. Alors 
> $$
>     a^{\varphi(m)} \equiv 1 \mod m
> $$

Dans un LCG d'incrément nul, la valeur du générateur après $n$ étapes est
$$
x_n \equiv a^nx_0 \mod m.
$$
En supposant un multiplicateur $a$ relativement premier avec le module $m$ (ce qui est nécessaire afin de maximiser la période), on conclut que
$$
x_{n+\varphi(m)} \equiv a^{n+\varphi(m)}x_0 \equiv a^{n}x_0 \equiv x_n \mod m,'
$$
et donc la période $p$ divise $\varphi(m)$. 
En fait la période $p$ est tout simplement l'entier minimal $\lambda\geq 1$ tel que $a^\lambda \equiv 1 \bmod m$, appelé *l'ordre* de $a$. 
Les multiplicateurs d'ordre maximal sont appelés les *éléments primitifs* modulo $m$. 
La période maximale d'un générateur multiplicatif est donc obtenue en choisissant comme multiplicateur un élément primitif.

Cependant la borne donnée par le théorème d'Euler n'est pas toujours optimale: il existe des modules $m$ pour lesquels l'ordre $\lambda$ des éléments primitifs est un diviseur propre de $\varphi(m)$. 
C'est notamment le cas quand $m$ est une puissance de 2 plus grande ou égale à 8. Dans ce cas, les éléments primitifs sont d'ordre $m/4$, alors que $\varphi(m)=m/2$.  
Il existe donc deux orbites distinctes des éléments relativement premiers. 

## RANDU et le théorème de Marsaglia

Le générateur RANDU, utilisé par IBM dans les années 60, est un exemple emblématique de LCG de qualité douteuse.
Il s'agit du LCG utilisant les chiffres magiques $a=65539$, $c=0$ et $m = 2^{32}$.
