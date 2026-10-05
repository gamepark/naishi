# Naishi — questions et écarts de règles (pour l'éditeur)

Décisions à trancher. Une fois tranchée, la décision est notée en commentaire dans le code.

## Extension Légendes & Voyageurs — écarts FR / EN

1. **Cavalier légendaire.** FR : « 4 points par bâtiment ou bannière adjacent ». EN : « 4 points par bâtiment adjacent et 4 points supplémentaires par bannière adjacente (une bannière vaut donc 8) ». Une bannière compte-t-elle 4 ou 8 ?
   → une bannière adjacente compte pour 8.
2. **Naishi légendaire.** FR : « au centre de votre territoire ou aux extrémités de votre Ligne ». EN : « centre ou extrémités de la Ligne ; centre de la Main ». Confirmer : centre de la Ligne et de la Main, extrémités de la Ligne seulement.
   → Je confirme.
3. **Mise en place.** FR : « rangez dans la boîte un exemplaire » de chacun des 3 personnages. EN : « replace one copy ». On retire bien 1 exemplaire (39 cartes − 4 distribuées = 35 = 5 × 7) ?
   → Si on pioche 1 Naishi légendaire, conseiller légendaire et ninja légendaire, on retirera 1 Naishi de base, 1 conseiller de base et 1 ninja de base. Ainsi c'est du remplacement 1 pour 1, 1 version de base remplacé par version légendaire.
4. **Ninja de base et ninja légendaire.** Le ninja de base copie un personnage de son propre territoire, le légendaire un personnage adverse. Confirmer.
   → Je confirme.

## Extension — points non couverts

5. **Ryokan.** Compte comme 11e carte à côté du territoire. Est-il adjacent à une carte ? À quelle position pour le Ronin, le décompte des couleurs (égalité) et les bonus d'adjacence ?
   → Le ryokan n'est adjacent à rien.
6. **Voyageur dans le territoire.** Il occupe un emplacement de la Main ou de la Ligne, mais n'a ni points ni icône. Compte-t-il comme adjacent pour le fortin, la rizière, etc. ? (Probablement non.)
   → Peu importe, ça n'a pas d'effet dans la partie.
7. **Effet « quitte le territoire vers la défausse ».** Se déclenche-t-il aussi quand le voyageur est échangé chez l'adversaire (décret impérial) ou seulement quand on le défausse pour développer ?
   → Seulement quand on le défausse pour développer.
8. **Voyageur qui entre par un échange** (décret impérial ou intervertir) : effet « entre depuis la rivière » ou non ? (Les règles disent « depuis la rivière ».)
   → Suelement quand on le prend depuis la rivière, pas avec les autres effets.
9. **Effet « développer immédiatement ».** Le développement supplémentaire peut-il faire entrer un autre voyageur ? Ordre de résolution des effets en chaîne ?
   → Oui ,un autre voyageur peut rentrer. Si plusieurs voyageurs se déclenchent en même temps, le joueur a le choix de l'ordre dans lequel il les résout.
10. **Fin de partie.** La rivière passe à 7 cartes par pile : la condition « 2 piles épuisées » reste-t-elle inchangée ?
    → Oui, ça reste inchangé.

## Jeu de base — choix d'implémentation à confirmer

11. **Ninja qui copie un Ninja.** Un ninja ne peut pas copier un autre ninja (sinon la copie ne se termine jamais). Confirmer.
    → je confirme
12. **Ninja et décompte du Ronin.** Un ninja copiant un personnage prend sa couleur et ses conditions, mais n'ajoute pas de « type » pour le Ronin (un Ronin ne compte que les cartes réelles). Confirmer.
    → je confirme. Un ninja ne peut copier qu'un personnage qu'on a, il n'ajoutera donc jamais d'icones. Par contre, le ninja légendaire peut copier un personnage adverse et donc ajouter une icone que l'on a pas et donc améliorer le scoring du ronnin
13. **Ninja copiant une carte : adjacences.** Le ninja compte comme la carte copiée pour les cartes adjacentes (ex. conseiller adjacent à un ninja copiant une Naishi : +4). Confirmer.
    → je confirme.
14. **Action additionnelle « Inverser » avec 2 cartes identiques.** Elle est autorisée (échanger 2 montagnes ne change rien, mais l'émissaire reste posé et bloque l'emplacement). Confirmer.
    → Oui, je peux inverser 2 cartes identiques, mais ça n'a pas d'intérêt.
15. **Fin de partie déclarée par le 2e joueur.** Le premier joueur joue alors un dernier tour avant le décompte, comme l'inverse. Confirmer.
    → Si le 2nd joueur passe et déclare la fin de la partie, le 1er joueur joue un dernier tour.

## Extension effet des cartes

- p8 Dame au parapluie : lorsque je défausse cette carte → j'inverse 2 cartes **n'importe où** dans mon territoire.
- p9 Vieil homme : lorsque je défausse cette carte → je récupère mes émissaires (sauf celui sur le décret impérial)
- p10 Dame au ceriser : lorsque je prend cette carte depuis la rivière → j'inverse 2 cartes **n'importe où** dans mon territoire.
- p11 Fillette : lorsque je défausse cette carte → je peux développer une carte. (Attention, la carte de la pile de la carte qui a remplacé la fillette n'est révélée qu'après la fin de l'action → j'ai donc le choix uniquement des 4 autres piles pour cette action additionnelle)
- p12 Porteur : lorsque je prend cette carte depuis la rivière → je récupère mes émissaires (sauf celui sur le décret impérial)
- P13 Samurai : lorsque je prend cette carte depuis la rivière → après avoir récupéré le ryokan, je la place sur face 7 si possible.

## Extension — choix d'implémentation à confirmer (livret final lu)

16. **Voyageurs « Porteur » et « Samouraï ».** Dans ta liste, ils se déclenchent « lorsque je défausse ». Sur les cartes et dans le livret, leur pictogramme est celui de l'**entrée depuis la Rivière**. J'ai implémenté l'entrée (comme le Dame au cerisier). À confirmer.
    → tu as raison, j'ai corrigé ma liste ci dessus
17. **Effets des voyageurs facultatifs.** Le livret dit qu'ils ne sont pas obligatoires : chaque effet peut être utilisé ou ignoré. Fait ainsi.
    → OK
18. **Ryokan.** Il va au joueur dont un voyageur **entre depuis la Rivière** (pas par échange, décret ou « inverser »). Il compte comme une province pour le Ronin (type en plus), couleur noire. À confirmer, surtout la couleur.
    → oui, c'est un type en plus, il compte pouir le décompte (couleur = noir)
19. **Samouraï.** « Prenez la carte Ryokan (où qu'elle soit) et placez-la face 7 » : il peut donc la prendre à l'adversaire. Fait ainsi.
    → OK
20. **Conseiller légendaire.** « Si vous ne possédez pas de Naishi, 5 points par conseiller. » J'ai compté **tous les conseillers du territoire** (lui compris, et les conseillers de base), et un Naishi légendaire ou copié par un ninja compte comme un Naishi. Sinon 0. À confirmer.
    → je confirme
21. **Ronin légendaire.** « Plus grande série de cartes identiques » (3 = 8, 4 = 15, 5+ = 25). J'ai compté la plus grande quantité d'un même personnage ou d'une même province dans tout le territoire (pas forcément adjacentes), sans les montagnes. À confirmer.
    → Oui
22. **Moine légendaire.** Il compte comme Moine et comme Torii (total des torii, bonus des moines adjacents). Il marque 2 points par personnage adjacent (les ninjas copiant un personnage comptent, un ninja sans copie non). À confirmer.
    → Oui
23. **Cartes légendes et cartes de base.** Une légende compte comme la carte qu'elle remplace pour les bonus des autres cartes (par ex. un conseiller de base à côté d'une Naishi légendaire : +4) et pour les types du Ronin de base. À confirmer.
    → Oui
24. **Ninja légendaire.** Il copie un personnage adverse (jamais une légende ni un ninja). S'il copie un personnage que je n'ai pas, il ajoute un type pour mon Ronin de base.
    → Oui ; Il est à noter que si l'adversaire n'a pas de personnage, je ne peux rien compier, et donc le ninja légendaire vaudra 0.
