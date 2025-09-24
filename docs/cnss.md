Direction des affiliés
e-BDS : Le système de Télédéclaration et de Télépaiement de la Caisse
Nationale de la Sécurité Sociale
« Cahier des Charges relatif à la réalisation des
déclarations des salaires en Mode Echange de Fichiers
entre la CNSS et ses Affiliés »
Version 2 / Février 2006
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V
SUIVI DES VERSIONS
Version Date Rédacteur Commentaires
Octobre La CNSS Version initiale
1.1 Novembre La CNSS Version initiale corrigée
1.2 Décembre La CNSS Version initiale corrigée
1.3 Janvier La CNSS Version initiale corrigée
1.4 Avril La CNSS Version initiale corrigée
1.5 Septembre 2005 La CNSS Version initiale mise à jour
2 Février 2005 La CNSS Nouvelle version intégrant les nouvelles fonctionnalité du portail ( TD complémentaire)
ETAT DES MISES A JOUR
Chapitre Motif et nature des mises à jour Version

IV -
Correction des règles de contrôle du format et de structure du fichier BDS :
Spécification des numéros d’assurés pour la main d’ouvre occasionnelle.
Correction de la règle ‘L’ concernant le calcul de B05_N_Nbr_Salaries.
Correction de la règle ‘X’ concernant le calcul de B02_S_Ctr.
Correction de la règle ‘ y’ concernant le calcul de B03_N_T_Ctr.
Correction de la règle ‘ z’ concernant le calcul de B04_S_Ctr.
Suppression de la règle ‘aa’ car elle redéfinit la règle ‘q’ concernant le calcul de B05_N_T_Ctr
Suppression de la règle ‘bb’ car elle redéfinit la règle ‘w’ concernant le calcul de B05_N_T_Ctr
Note : Ces formules ont été précisées correctement dans la description de la structure du fichier BDS
présenté dans la paragraphe IV –.
1.
IV -
Règles de contrôle de cohérence du fichier BDS :
Correction de la Correspondance entre les identifiants des informations à transférer
(A00_N_Identif_Transfert = B0_N_Identif_Transfert)
1.
IV -
Code des erreurs de télédéclarations dans le système e-BDS :
La description de l’erreur présentée par le système e-BDS inclut des suggestions des valeurs
correctes prévues par le système.
La description de l’erreur présentée par le système e-BDS inclut , quand cela est appliqué le
numéro d’assuré en question.
1.
IV –2.
Ajout d’un nouveau code de situation au niveau de l’enregistrement « détails de la déclaration des
salaires sur préétablis » :
La situation maladie professionnelle est une situation qui doit être codifié 'MP' et doit avoir le rang 8. Les
assurés déclarés avec cette situation doivent avoir le nombre de jours et les salaires nuls et bénéficier des
Allocations Familiales. Cette situation est identique à la situation Accident de Travail par exemple.
1.
IV –2.
Spécification du Format des champs ‘L_Nom_Prenom’ et L_Num_CIN au niveau de
l’enregistrement « Détail déclaration des salaires pour les Entrants» :
Le nom, le prénom et le N° de la CIN des salariés entrants doivent être des chaînes alphanumériques. La
liste des caractères acceptés est présentée dans le paragraphe IV - 6
1.
IV –
Correction des règles de contrôle du format et de structure du fichier BDS :
Le « salaire plafonné » doit être plafonné en fonction du plafond en vigueur à la période à l’exception de
la main d’œuvre occasionnelle.
Pour la main d’œuvre occasionnelle (type d’enregistrement 5, Num_assuré) le salaire plafonné doit être
inférieure ou égale au salaire réel.
Dans le cas des situations Sorti et Décédé, l'AF à reverser doit être égale à l'AF net à payer.
1.
IV –
Règles de contrôle de cohérence du fichier BDS :
Le nom et prénom sont obligatoires dans le cas d'un entrant non occasionnel.
Dans le cas des situations Sorti et Décédé, l'AF à reverser doit être égale à l'AF net à payer.
1.
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V
IV –

Code des erreurs de télédéclarations dans le système e-BDS :
Modification du contrôle concernant la fin du fichier de déclaration des salaires : L’erreur du à l’existence
de caractères après l'enregistrement "Récap Globale de la DS" dont le code est 'B06' est une erreur non
bloquante et est signalée à l’affilié à titre de Warning.
Révision des descriptifs des erreurs.
1.
IV –

Correction des règles de contrôle de cohérence du fichier BDS : B04 au lieu de B05 dans la
paragraphe suivant : « Dans le cas ou l'affilié n'a aucun entrant à déclarer. Un seul enregistrement de type
B
doit être créé en spécifiant la période, le numéro d'affilié et en mentionnant la valeur ' ' (ie.9 espaces) dans
le champ (B05_N_Num_Assure). Les autres informations doivent être égales à Zéro ».
1.
IV –

Correction des règles de contrôle de cohérence du fichier BDS : 9 espaces vides au lieu des
‘000000000’ dans le paragraphe : « Dans le cas ou l’affilié n’a aucun entrant à déclarer. Un seul
enregistrement de type B04 doit être créé en spécifiant la période, le numéro d’affilié et en mentionnant
‘000000000‘ dans le champ B04_ N_Num_Assure. Les autres informations doivent être égales à Zéro si le
type est N et égales à des espaces si le type est AN. »
1.
IV Description des fichiers BDS :fichier : DS_numAFF_Periode Nom du fichier : DS_numAFF_Periode_EDI a été remplacé par Nom du 1.
IV –

Structure détaillée du fichier BDS : S_Ctr est la somme horizontale des rubriques suivantes :
N_Num_Assure, N_Nbr_Jours, N_Sal_Reel, N_Sal_Plaf au lieu de N_Num_Assure, N_Jours_Declares,
N_Salaire_Reel, N_Salaire_Plaf.
1.
IV -

Correction des règles de contrôle du format et de structure du fichier BDS :
Le contrôle sur l'absence d'un salaire et d'un nbr de jours n'est effectif que pour les situations "SO", "MS" et
"CS"." Pour les situations maladie « IL », maternité « IT », at, Maladie professionnelle « MP » le salaire
peut ne pas être nul.
1.
IV -3 Correction des règles de contrôle du format et de structure du fichier BDS :
Le contrôle sur le salaire par rapport au SMIG en vigueur.

1.
IV –

Correction des règles de contrôle de cohérence du fichier BDS :
Tout numéro d’immatriculation valide dont le premier chiffre diffère de 1 doit être rejeté par le portail (exclure le cas
des occasionnels où le numéro commence par 9 et le cas particuliers d’une déclaration sans numéro N° imma
000000000 »). Est également rejeté le numéro d’immatriculation « 100000000 »
1. 5
IV –

Correction des règles de contrôle de cohérence du fichier BDS :
Au niveau des entrants, le numéro de CIN doit être unique dans une TD
1. 5
IV -

Code des erreurs de télédéclarations dans le système e-BDS :
Ajout de nouveaux codes d’erreurs relatifs aux nouvelles règles de contrôles incluse dans cette version 1.
= 1622 / 1642
1.
I-2 Processus de télédéclaration
Ajout du processus de la TD complémentaire
2
II-2 Règles de gestion concernant les TD principales et complémentaires 2
IV
Description des fichiers BDS
Présentation des règles de nominations des fichiers BDS complémentaires
2
IV-4 Structure détaillée du fichiers BDS complémentaire 2
IV-4 Règles de contrôle du fichier BDS complémentaire 2
IV-
Code des erreurs de télédéclarations dans le système e-BDS :
Ajout de nouveaux codes d’erreurs relatifs aux nouvelles règles de contrôles incluse dans cette version 2 =
1822 /
2
Table des Matières
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V
I. Présentation générale___________________________________________________________________________
Présentation du système de Télédéclaration et du Télépaiement de la CNSS_______________________________________
Processus de télédéclaration__________________________________________________________________________
Présentation du présent cahier de charges________________________________________________________________
II. Les règles générales_____________________________________________________________________________
Règles de gestion des périodes de télédéclarations:_____________________________________________________
Règles de gestion concernant les TD principales et complémentaires________________________________________
Règles de gestion concernant les préétablis émis par le SI de la CNSS_______________________________________
III. Description des fichiers préétablis_________________________________________________________________
Synoptique d’un fichier préétabli__________________________________________________________________
Structure détaillée du fichier préétabli______________________________________________________________
1.1. Enregistrement type 1 « nature du fichier communiqué »________________________________________
1.2. Enregistrement type 2 « Entête Globale de l’émission» :_________________________________________
1.3. Enregistrement type 3 « Détail Emission»_____________________________________________________
1.4. Enregistrement type 4 « Récapitulatif de l’Emission»___________________________________________
IV. Description des fichiers BDS_____________________________________________________________________
Synoptique du fichier BDS_______________________________________________________________________
Structure détaillée du fichier BDS principal_________________________________________________________
2.1. Enregistrement type 1 « Nature du fichier communiqué »________________________________________
2.2. Enregistrement type 2 « Entête Globale de la déclaration»_______________________________________
2.3. Enregistrement type 3 « Détail de la déclaration des salaires sur préétabli»__________________________
2.4. Enregistrement type 4 « Récapitulatif de la déclaration des salaires sur préétabli»____________________
2.5. Enregistrement type 5 « Détail déclaration des salaires pour les Entrants»__________________________
2.6. Enregistrement type 6 « Récap de la déclaration des salaires entrants»_____________________________
2.7. Enregistrement type 7 « Récapitulatif Globale de la déclaration des salaires»_______________________
Règles de Contrôle du Format et de structure du fichier BDS principal_____________________________________
Règles de contrôle de cohérence du fichier BDS principal______________________________________________
Structure détaillée du fichier BDS complémentaire____________________________________________________
5.1. Enregistrement type 1 « Nature du fichier communiqué »________________________________________
5.2. Enregistrement type 2 « Entête Globale de la déclaration»_______________________________________
5.3. Enregistrement type 3 « Détail de la déclaration des salaires sur préétabli»__________________________
5.4. Enregistrement type 4 « Récapitulatif de la déclaration des salaires sur préétabli»____________________
5.5. Enregistrement type 5 « Détail déclaration des salaires pour les Entrants»__________________________
5.6. Enregistrement type 6 « Récap de la déclaration des salaires entrants»_____________________________
5.7. Enregistrement type 7 « Récapitulatif Globale de la déclaration des salaires»_______________________
Règles de Contrôle du fichier BDS complémentaire___________________________________________________
6.1. Contrôle du format :______________________________________________________________________
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V
6.2. Contrôle syntaxique :_____________________________________________________________________
Code des erreurs de télédéclarations dans le système e-BDS :____________________________________________
Liste des codes ASCII accéptés dans le système e-BDS :________________________________________________
V. Glossaire____________________________________________________________________________________
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V
I. PRESENTATION GENERALE

Présentation du système de Télédéclaration et du Télépaiement de la CNSS

e-BDS est un portail Internet conçu pour le traitement des télétransmissions des bordereaux de
déclarations de salaires des affiliés de la CNSS.
Il est aussi conçu pour supporter les processus de télépaiement entre la CNSS, les affiliés et
les banques.
L'objectif du système repose sur la mise à disposition des entreprises et à leurs prestataires
éventuels (cabinets d'expertise comptable, fudiciaires, ...) d'une plate-forme d'intermédiation
complète et sécurisée garantissant la prise en charge, le traitement et l'acheminement des
bordereaux de déclarations de salaires (télé-déclarations) soumises par les utilisateurs du
portail à destination de la CNSS, ainsi que la prise en charge de la validation des avis de
télépaiements par les utilisateurs du portail, leur acheminement aux organismes bancaires et le
traitement de leurs retours.
Processus de télédéclaration

Le système de Télédéclaration concerne les déclarations de salaires en suivant le principe de
fonctionnement décrit ci-dessous.
Les utilisateurs du portail (affiliés ou mandataires), une fois qu'ils ont adhéré à la télé-
déclaration, adressent par liaison Internet sécurisée au portail e-BDS, leurs télé-déclarations
soit par échange de fichiers, soit par échange de formulaires informatisés (EFI). Ces fichiers /
formulaires sont alors collectés, horodatés dès leur dépôt ou validation et traités. Chaque
déclaration fait l’objet d’un traçage précis et constant qui permet à l’utilisateur en se connectant
sur le portail WEB de suivre l’évolution du traitement de ses télédéclarations.
Le principe de fonctionnement de la Télédéclaration en mode Echange de Fichier est le suivant :
Le 15 de chaque mois au maximum, la CNSS met à la disposition des affiliés utilisant le
système de télédéclarations, les fichiers préétablis correspondant à la période de télé
déclaration prochaine,à fin des les aider à préparer leurs télédéclarations de salaires. Ces
derniers sont des fichiers au format normalisé (Voir Description de la norme plus loin)..
Les affiliés peuvent se connecter au système e-BDS, en mode sécurisé et télécharger le fichier préétabli.

Dés réception du préétabli, l’affilié peut récupérer automatiquement les allocations familiales
émises pour alimenter son système de paie. Il doit ensuite préparer son fichier de déclaration
de salaire (Fichier BDS). Ce dernier contient les éléments de la déclaration sous un format
normalisé (Voir Description de la norme plus loin). Ce fichier doit être cohérent avec le
préétabli émis par la CNSS : l’ensemble des salariés figurant sur le préétabli doit figurer sur la
déclaration (les salariés ne faisant plus partie de l’entreprise doivent alors être déclarés
comme sortants) et les salariés ne figurant pas dans le préétabli ne doivent pas figurer dans
la déclaration sur préétabli (les salariés entrants doivent être déclarés sur le complémentaire
en tant qu’entrants).
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V
3- Le fichier BDS résultat de ce traitement est ensuite déposé, par l’affilié, sur le portail e-BDS en
mode sécurisé.
4- L’affilié reçoit par courrier électronique un avis de réception de sa télédéclaration par la
CNSS. Cet avis présente un simple constat de dépôt du fichier BDS.
5- Dés réception du fichier BDS, le système e-BDS procède au contrôle de la structure et du
contenu de ce dernier.
6- L’affilié reçoit par courrier électronique un avis de contrôle de sa télédéclaration. Cet avis
présente le résultat du contrôle. Dans le cas d’un résultat négatif, l’affilié est appelé à corriger les
anomalies détectées par le système et refaire sa télédéclaration.
7- A la date limite de déclaration fixée par la CNSS, les fichiers BDS déposés et validés seront
pris en compte par la CNSS et feront l’objet d’un ensemble de traitement de prise en charge.
8- En cas d’oubli d’un assuré entrant, l’affilié peut produire un fichier BDS complémentaire et le
déposer sur le portail e-BDS en mode sécurisé.
9- Le processus de réception , de contrôle et de prise en compte d’un fichier BDS
complémentaire sont similaires aux processus N°4, 6 et 7 décrits ci-dessus. Le fichier de BDS
complémentaire est pris en compte par la CNSS a la date d’exigibilité de la période de déclaration
en cours.
Le synoptique ci-dessous résume les circuits de télédéclaration par échange de fichiers :
CNSS : e-BDS et Services Internes

7- Traitements de prise en charge
5 - Contrôle du fichier BDS :
Contrôle de la déclaration par rapport au préétabli
Contrôle des entrants.
1- Mise en ligne du fichier
émission de la période de
déclaration (préétabli)
Système informatique de l’affilié
Contrôles de formats et de cohérences
Internet
2- Intégration du préétabli dans le système de paie de l’entreprise et
génération du BDS ( préétabli enrichi par les éléments de la paie) et
récupération des allocations familiales émises.
3-Fichier
BDS
4- Accusé de
réception
Fichier
préétabli
6 -Accusé de
contrôle
8-Fichier BDS
complémentaiMisre en forme : Couleur de
police : Rouge
Mis en forme : Police :9 pt
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V

Présentation du présent cahier de charges

Le présent document est destiné aux entreprises et à leurs prestataires éventuels (sociétés
éditrices de logiciels de paie, cabinets d'expertise comptable, fudiciaires...) qui souhaitent
utiliser le système e-BDS.
Ce guide présente les normes et les règles nécessaires pour la préparation des fichiers de
déclarations de salaire.
La section 2 présente les règles générales de la télédéclaration (périodicité d’émission
des préétablis et du dépôt des télédéclarations)
La section 3 présente la structure et le format des fichiers préétablis émis par la CNSS à
destination des affiliés.
La section 4 présente la structure et le format des fichiers BDS qui doivent être générés
par les affiliés et déposés via le système e-BDS.
La section 5 contient un glossaire.
PS : Ce document est un guide d’utilisation des fichiers préétablis et de préparation des
fichiers BDS et ne présente pas les circuits et les pré-requis d’échanges de ces fichiers. En
effet, l’utilisation du système de Télédéclaration fait l’objet d’un autre document.
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V

II. LES REGLES GENERALES

Règles de gestion des périodes de télédéclarations:
Les périodes de télédéclarations respectent les mêmes règles fixées par la CNSS pour le régime
de déclarations sociales.
Nous rappelons ci-dessous quelques règles en précisant celles liées au système de
télédéclaration e-BDS.
 Une période de télédéclaration correspond à un mois calendaire (Ex : télédéclaration de la
période 200301 est la Télédéclaration du mois de janvier 2003).
 Une télédéclaration concerne un et un seul affilié et une période.
 Les déclarations se font par période (mensuellement).
 Le portail ne gère pas l’ordre chronologique des déclarations par période :
L’affilié ne peut déclarer pour une période que si le préétabli de cette période est
disponible sur le portail. En règle générale, le préétabli d’une période relative à un
mois X est disponible à partir du 15 du mois X. Toutefois, la pratique a montré que les
déclarations d’un mois X ne seront transmis es par les affiliés qu’à partir du 1 du
mois suivant (X+1).
L’affilié peut déclarer pour une période antérieure à la période relative à la date en
cours (déclaration de Janvier 2003 en Mars 2003).
L affilié peut déclarer pendant une période, alors que les périodes antérieures n’ont
pas été transmises à la CNSS. Exemple : la déclaration du mois de février peut être
transmise sans que la déclaration du mois de janvier ne soit encore transmise (non
déposée, en préparation, en validation).
Règles de gestion concernant les TD principales et complémentaires
 La Télédéclaration Principale :
Une télédéclaration principale est la première télédéclaration transmise, via le
portail, par l’affilié pour une période donnée.
Le fichier BDS concernant une télédéclaration principale peut contenir des lignes
d’assurés existants, entrants ou occasionnels.
 La Télédéclaration complémentaire :
Une télédéclaration complémentaire est une télédéclaration contenant un complément
d’informations par rapport à la télédéclaration principale transmise via le portail. Elle
peut être transmise vers le portail dans le cas où l’affilié veut compléter sa
télédéclaration et que la télédéclaration principale a été déjà transférée vers le SI de
la CNSS.
Le fichier BDS concernant une télédéclaration complémentaire ne peut contenir que
des lignes d’assurés entrants.
Règles de gestion concernant les préétablis émis par le SI de la CNSS
 Le 15 de chaque mois au maximum, le SI de la CNSS se charge du transfert des
fichiers, correspondants aux préétablis du mois en cours et concernant seulement les
affiliés adhérents au service de télédéclaration via e-BDS, vers le portail e-BDS.
 Un fichier préétabli correspond à une période et à un affilié.
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V

 Chaque mois, la CNSS procède à la prise en charge des déclarations des salaires
saisis dans le mois (ces déclarations peuvent concerner une ou plusieurs périodes) et
la génération d’un fichier préétabli contenant l’ensemble des assurés reconnus comme
étant des employés de l’affilié. Ce fichier représente la situation figée de la période
d’émission. Pour un affilié adhérant au service télédéclaration, le SI de la CNSS
génère chaque mois un et un seul fichier préétabli vers le portail e-BDS.
 Le fichier préétabli concernant une période BDS sera supprimé du portail e-BDS
dans les cas suivants :
o Le BDS concernant cette période a été transmis et validé par l’affilié sur le
portail et transféré vers les services Internes de la CNSS pour sa prise en
charge.
o Le BDS concernant cette période n’a pas été transmis ou validé par
l’affilié depuis plus de 6 mois. En effet une politique de purge des
préétablis sera définie à fin de supprimer, du portail, les préétablis qui
n’ont pas été utilisés par les affiliés pour télédéclarer pendant une durée
dépassant 6 mois.
 Trois mois après la date de disponibilité d’un préétabli, si l’affilié ne procède pas à
la télé-déclaration, le service de télédéclaration lui sera résilié et par conséquent,
le portail ne chargera plus les fichiers préétablis le concernant.
III. DESCRIPTION DES FICHIERS PREETABLIS

Les fichiers préétablis sont des fichiers plats (fichier structuré avec longueur fixe et extension .txt)
créés par les services internes de la CNSS et ayant les caractéristiques suivantes :
 extension : TXT
 nom : AFFEBDS_numAFF_Periode ( « numAFF » est le numéro
d’affiliation de l’entreprise et « Période » st la période de
télédéclaration).
Le fichier préétabli est constitué de 4 types d’enregistrements dont les Formats diffèrent.
Les enregistrements sont tous de longueur fixe (260 caractères limités par un retour à la
ligne dont le code ASCII EST ‘10’) et leur structure est présentée ci-dessous.
Synoptique d’un fichier préétabli
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V

Enregistrement décrivant la « Nature du fichier » :
‘A00’. (Référence structurée) , ‘A0’, Zone réservée..................
Enregistrement décrivant l’ «Entête Globale de l’émission»:
A0^1 ’,Num Affilie, Période, Raison Sociale, Activite,Adresse , Ville,Code Postal, Code Agence, Date Emission,Date Exig,
Structure détaillée du fichier préétabli
Vocabulaire :
N : Valeur numérique.
AN : Valeur alphanumérique
1.1. Enregistrement type 1 « nature du fichier communiqué »
Nom Désignation Type(Longueur)
..
..
Enregistrements décrivant « les assurés» :
A02, Num Affilie, Période, Num Assure, Nom Prenom, Enfants, AF A Payer, AF A Deduire, AF Net A Payer, filler
A02, Num Affilie, Période, Num Assure, Nom Prenom, Enfants, AF A Payer, AF A Deduire, AF Net A Payer, filler
A03, Num_Affilie, Période, Nbr_Salaries, T_Enfants, T_AF_A_Payer, T_AF_A_Deduire, T_AF_Net_A_Payer,
T_Num_Imma,filler
Enregistrements décrivant le « Récapitulatif de l’Emission» :
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V

L_Type_ Enreg Type Enregistrement « Réservé».
Valeur = ‘A00’.
AN(3)
N_Identif_Transfert Identifiant des informations à transférer
(référence structurée)
N(14)
L_Cat Catégorie des informations à transférer.
Valeur = ‘A0’
AN(2)
L_filler Zone réservée initialisée à des « espaces » 241
1.2. Enregistrement type 2 « Entête Globale de l’émission» :
Nom Désignation Type (Longueur)
L_Type_ Enreg Type Enregistrement « Entête Globale de
l’émission».
Valeur = ‘A01’.
AN(3)
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)
L_Période Année et Mois de la déclaration.. (AAAAMM) N(6)
L_Raison_Sociale Raison Sociale de l’affilié AN(40)
L_Activité Activité de l’affilié AN(40)
L_Adresse Adresse de l’affilié AN(120)
L_Ville Ville de l’affilié AN(20)
C_Code_Postal Code Postal AN(6)
C_Code_Agence Code de l’agence CNSS N(2)
D_Date_Emission Date de l’émission.. (AAAAMMJJ) N(8)
D_Date_Exig Date limite de retour des BDS et de
paiement des cotisations. (AAAAMMJJ)
N(8)
1.3. Enregistrement type 3 « Détail Emission»
Nom Désignation Type(Longueur)
L_Type_ Enreg Type Enregistrement « Détail Emission».
Valeur = ‘A02’.
AN(3)
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V

N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)
L_Période Année et Mois de la déclaration.. (AAAAMM) N(6)
N_Num_Assure Numéro d’immatriculation de l’assuré N(9)
L_Nom_Prenom Nom et prénom de l’assuré AN(60)
N_Enfants Nombre des enfants donnant droit aux
allocations familiales.
N(2)
N_AF_A_Payer Montant des allocations familiales dues au
titre du mois, à payer. (en centimes)
N(6)
N_AF_A_Deduire Montant des allocations familiales perçues
antérieurement en trop, à déduire du montant
à payer. (en centimes)
N(6)
N_AF_Net_A_Payer Montant des allocations familiales net à payer
. (en centimes)

N(6)
L_filler Zone réservée initialisée à des « espaces » AN(155)
1.4. Enregistrement type 4 « Récapitulatif de l’Emission»
Nom Désignation Type(Longueur)
L_Type_ Enreg Type Enregistrement « Récap de l’Emission».
Valeur = ‘A03’.
AN(3)
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)
L_Période Année et Mois de la déclaration. (AAAAMM) N(6)
N_Nbr_Salaries Nombre des salariés. N(6)
N_T_Enfants Total des enfants donnant droit aux
allocations familiales.
N(6)
N_T_AF_A_Payer Total des montants des allocations familiales
dues au titre du mois, à payer. (en centimes)
N(12)
N_T_AF_A_Deduire Total des montants des allocations familiales
perçu antérieurement en trop, à déduire du
montant à payer. (en centimes)
N(12)
N_T_AF_Net_A_Payer Total des montants des allocations familiales
net à payer. (en centimes)
N(12)
N_T_Num_Imma Total des numéros d’immatriculations N(15)
L_filler Zone réservée initialisée à des « espaces » AN(181)
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V

 Le fichier « préétabli est trié par :
o Le champ L_Type_Enreg croissant.
o Pour les enregistrements de type « Détail émission » , les lignes sont triées par
N_Num_Assure croissant.
 Si un affilié n’a pas d’assurés déclarés dans les périodes précédentes (EX : Nouvelle
affiliation) , le fichier préétabli sera généré aussi en respectant la même structure.
Cahi
er des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V

IV. DESCRIPTION DES FICHIERS BDS

Le fichier BDS transmis en mode échange de fichier sur le portail e-BDS est un fichier plat
(de type texte ou autre) généré par l’affilié via son système interne et déposé, par
l’utilisateur de l’affilié via le système e-BDS.
Type du fichier : Fichier Texte lisible à partir d’un éditeur de texte standard.
Extension du fichier : .txt
Nom du fichier de la déclaration principale : DS_[numAFF]_[Periode] ( [numAFF ]
est le numéro d’affiliation de l’entreprise et [ Période ] est la période de télédéclaration.
Format : DS_NNNNNNN_MMAAAA).
Nom du fichier de la déclaration principale : DSC[N][numAFF][Période] / Format :
DSCN_NNNNNNN_MMAAAA. Ou N le Numéro de séquence de la complémentaire( de 1 à 9).
ex : si un affilié dépose deux complémentaires dans la même période :
o DSC1_ numAFF_Periode : fichier de la 1ère déclaration complémentaire
o DSC2_ numAFF_Periode fichier de la 2ème ère déclaration complémentaire
Le fichier BDS est constitué de 7 types d’enregistrements dont les Formats diffèrent. Les
enregistrements sont tous de longueur fixe (260 caractères limités par un retour à la ligne
dont le code ASCII EST ‘10’) et leur structure est présentée ci-dessous.
Ce fichier sera renommé, par le portail et transféré sans modification de son contenu aux
services internes de la CNSS.
Synoptique du fichier BDS
: Le système de Télédéclaration et de Télépaiement de la CNSS

Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affi
liés
Page 16 sur 36
B01’
,Num Affilie
,Période
,Raison Sociale
,Activite
,Adresse 1
,Adresse 2
,Adresse 3
,Ville
,Code Postal
,Code A
gence
,Date Emission
,Date Exi
g
Enregistrement décrivant la
« Nature du fichier
communiqué
»:
‘B00’.
(référence structurée) , ‘B0’, Zone réservée..................................................................................................................................
Enregistrement décrivant la « Entête Globale de la déclaration» :
B
,Num_Affilie,Période,Num_Assure,Nom_Prenom,Enfants,AF_A_Payer,AF_
A_Deduire,AF_Net_A_Payer, AF_A_Reverser, Jours_Declares,
Salaire_Reel, Salaire_Plaf,Situation,Ctr,filler
Enregistrement décrivant le « Détail de la déclaration d s salaires sur préétabli»:
e
B03,
Num_Affilie, Période,Nbr_Salaries,T_Enfants,T_AF_A_Payer,T_AF_A_Deduire,T_AF_Net_A_Payer,T_Num_Imma, T_AF_A_Reverser,
T_Jours_Declares, T_Salaire_Reel, T_Salaire_Plaf,T_Salaire_Plaf,T_Ctr,filler
Enregistrement décrivant le
« Récapitulatif
de la déclaration des sala es sur préétabli» :
B
,Num_Affilie,Période,Num_Assure,Nom_Prenom,Enfants,AF_A_Payer,AF_
A_Deduire,AF_Net_A_Payer, AF_A_Reverser, Jours_Declares,
Salaire_Reel, Salaire_Plaf,Situation,Ctr,filler
ir
B06,
N_Num_Affilie,Période,Nbr_Salaries,T_Num_Imma,T_Jours_Declares,T_Salaire_Reel,T_Salaire_Plaf,T_Ctr,filler
B
, Num_Affilie ,Période,Num_Assure,Nom_Prenom,Num_CIN,Nbr_Jours,Sal_Reel,Sal_Plaf,Ctr,filler
Enregistrement décrivant le
« Détail de la déclaration des salaires pour les Entrants» :
B
, Num_Affilie ,Période,Num_Assure,Nom_Prenom,Num_CIN,Nbr_Jours,Sal_Reel,Sal_Plaf,Ctr,filler
B
, Num_Affilie,Période,Nbr_Salaries,T_Num_Imma,T_Jours_Declares,T_Salaire_Reel,T_Salaire_Plaf,T_Ctr,filler
Enregistrement décrivant le
« Récapitulatif de
la déclaration des salaires entrants». Enregistrement décrivant le
« Récapitulatif
Globale de la déclaration des salaires» :
........
e-BDS

Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés

Structure détaillée du fichier BDS principal
2.1. Enregistrement type 1 « Nature du fichier communiqué »
Nom Désignation Type(Longueur)
L_Type_ Enreg Type Enregistrement « Réservé».
Valeur = ‘B00’.
AN(3)
N_Identif_Transfert Identifiant des informations à transférer (Cette
valeur doit être identique à celle émise par la
CNSS)
N(14)
L_Cat Catégorie des informations à transférer.
Valeur = ‘B0’
AN(2)
L_filler Zone réservée initialisée à des « espaces » AN(241)
Cet enregistrement doit être le même que l’enregistrement ‘’A00’’ du préétabli sauf pour la
valeur du type d’enregistrement qui sera égale à ‘’B00’’ au lieu de ‘’A00’’ et pour la
catégorie des informations à transférer qui sera égale à ‘’B0’’ au lieu de ‘’A0’’.
2.2. Enregistrement type 2 « Entête Globale de la déclaration»
Nom Désignation Type(Longueur)
L_Type_ Enreg Type Enregistrement « Entête Globale de la
déclaration».
Valeur = ‘B01’.
AN(3)
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)
L_Période Mois et Année de la déclaration.. (AAAAMM) N(6)
L_Raison_Sociale Raison Sociale de l’affilié N(40)
L_Activité Activité de l’affilié AN(40)
L_Adresse Adresse de l’affilié N(120)
L_Ville Ville de l’affilié N(20)
C_Code_Postal Code Postal N(6)
C_Code_Agence Code de l’agence N(2)
D_Date_Emission Date de l’émission.. (AAAAMMJJ) N(8)
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V

D_Date_Exig Date limite de retour des BDS et de paiement
des cotisations.. (AAAAMMJJ)
N(8)
Cet enregistrement doit être le même que l’enregistrement A01 du préétabli sauf pour la
valeur du type d’enregistrement qui sera égale à B01 au lieu de A01.
2.3. Enregistrement type 3 « Détail de la déclaration des salaires sur préétabli»
Nom Désignation Type(Longueur)
L_Type_ Enreg Type Enregistrement « Détail de la déclaration
des salaires sur préétabli».
Valeur = ‘B02’.
AN(3)
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)
L_Période Mois et Année de la déclaration.. (AAAAMM) N(6)
N_Num_Assure Numéro d’immatriculation de l’assuré N(9)
L_Nom_Prenom Nom et prénom de l’assuré AN(60)
N_Enfants Nombre des enfants donnant droit aux
allocations familiales.
N(2)
N_AF_A_Payer Montant des allocations familiales dues au titre
du mois, à payer. (en centimes)
N(6)
N_AF_A_Deduire Montant des allocations familiales perçues
antérieurement en trop, à déduire du montant à
payer. (en centimes)
N(6)
N_AF_Net_A_Payer Montant des allocations familiales net à payer.
(en centimes)
N(6)
N_AF_A_Reverser Montant des allocations familiales à reverser.
(en centimes)
N(6)
N_Jours_Declares Nombre de jours déclarés. N(2)
N_Salaire_Reel Salaire réel déclaré. (en centimes) N(13)
N_Salaire_Plaf Salaire déclaré dans la limite du plafond. (en
centimes)
N(9)
L_Situation Situation de l’assuré.
SO= SOrtant, DE = DEcédé, IT = maTernité, IL
= maLadie, AT = Accident de Travail, CS =
Congé Sans salaire, MS = Maintenu Sans
Salaire, MP= Maladie Professionnelle
N(2)
S_Ctr Somme horizontale des rubriques suivantes : N(19)
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V

N_Num_Assure,
N_AF_A_Reverser, N_Jours_Declares,
N_Salaire_Reel,
N_Salaire_Plaf,
Le Rang de la situation (0 : non renseigné, 1 :
SO, 2 : DE, 3 : IT, 4 : IL, 5 : AT, 6 : CS, 7 : MS,
8 : MP).
L_filler Zone réservée initialisée à des « espaces » AN(104)
2.4. Enregistrement type 4 « Récapitulatif de la déclaration des salaires sur
préétabli»
Nom Désignation Type(Longueur
L_Type_ Enreg Type Enregistrement « Récap de la
déclaration des salaires sur préétabli».
Valeur = ‘B03’.
AN(3)
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)
L_Période Mois et Année de la déclaration.. (AAAAMM) N(6)
N_Nbr_Salaries Nombre des salariés. N(6)
N_T_Enfants Total des enfants donnant droit aux
allocations familiales.
N(6)
N_T_AF_A_Payer Total des montants des allocations familiales
dues au titre du mois, à payer. (en centimes)
N(12)
N_T_AF_A_Deduire Total des montants des allocations familiales
perçu antérieurement en trop, à déduire du
montant à payer. (en centimes)
N(12)
N_T_AF_Net_A_Payer Total des montants des allocations familiales
net à payer. (en centimes)
N(12)
N_T_Num_Imma Total des numéros d’immatriculations N(15)
N_T_AF_A_Reverser Total des montants des allocations familiales
à reverser. (en centimes)
N(12)
N_T_Jours_Declares Total des jours déclarés. N(6)
N_T_Salaire_Reel Total des salaires réels déclarés. (en
centimes)
N(15)
N_T_Salaire_Plaf Total des salaires déclarés dans la limite du
plafond. (en centimes)
N(13)
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V

N_T_Ctr Somme des Contrôles Horizontaux Déclarés. N(19)
L_filler Zone initialisée à des « espaces » AN(116)
2.5. Enregistrement type 5 « Détail déclaration des salaires pour les Entrants»
Nom Désignation Type (Longueur)
L_Type_ Enreg Type Enregistrement « Détail déclaration
des salaires pour les Entrants».
Valeur = ‘B04’.
AN(3)
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)
L_Période Mois et Année de la déclaration..
(AAAAMM)
N(6)
N_Num_Assure Numéro d’immatriculation de l’assuré N(9)
L_Nom_Prenom Nom et prénom de l’assuré. AN(60) (voir IV.6)
L_Num_CIN N° de la Carte d’Identité Nationale de
l’assuré. Obligatoire dans le cas ou le
numéro d’assuré n’est pas fourni.
AN(8)
N_Nbr_Jours Le nombre de jours travaillé par l’assuré. N(2)
N_Sal_Reel Le salaire brut réel non plafonné. N(13)
N_Sal_Plaf Le salaire plafonné. N(9)
S_Ctr Somme horizontale des rubriques
suivantes :
N_Num_Assure, N_Jours_Declares,
N_Salaire_Reel, N_Salaire_Plaf.
N(19)
L_filler Zone initialisée à des « espaces » AN(124)
2.6. Enregistrement type 6 « Récap de la déclaration des salaires entrants»
Nom Désignation Type (Longueur)
L_Type_ Enreg Type Enregistrement « Récap de la
déclaration des salaires entrants».
Valeur = ‘B05’.
AN(3)
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)
L_Période Mois et Année de la déclaration.. (AAAAMM) N(6)
N_Nbr_Salaries Nombre des salariés entrants. N(6)
N_T_Num_Imma Total des numéros d’immatriculations. N(15)
N_T_Jours_Declares Total des jours déclarés. N(6)
N_T_Salaire_Reel Total des salaires réels déclarés. N(15)
N_T_Salaire_Plaf Total des salaires déclarés dans la limite du
plafond.
N(13)
N_T_Ctr Somme des Contrôles Horizontaux Déclarés. N(19)
L_filler Zone initialisée à des « espaces » AN(170)
2.7. Enregistrement type 7 « Récapitulatif Globale de la déclaration des
salaires»
Nom Désignation Type(Longuer)
L_Type_ Enreg Type Enregistrement « Récap Globale de la
déclaration des salaires».
AN(3)
Valeur = ‘B06’.
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)
L_Période Mois et Année de la déclaration.. (AAAAMM) N(6)
N_Nbr_Salaries Nombre des salariés (entrants + existants). N(6)
N_T_Num_Imma Total des numéros d’immatriculations N(15)
N_T_Jours_Declares Total des jours déclarés (entrants +
existants).
N(6)
N_T_Salaire_Reel Total des salaires réels déclarés (entrants +
existants)..
N(15)
N_T_Salaire_Plaf Total des salaires déclarés dans la limite du
plafond (entrants + existants)..
N(13)
N_T_Ctr Somme des Contrôles Horizontaux Déclarés. N(19)
L_filler Zone initialisée à des « espaces » AN(170)
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

Règles de Contrôle du Format et de structure du fichier BDS principal
 Le fichier « déclaration des salaires » doit être trié par :
o Le champ L_Type_Enreg croissant.
o Pour les enregistrements de type « Détail déclaration des salaires sur
préétabli » et de type « Détail déclaration des salaires pour les entrants » trier
par N_Num_Assure croissant.
 Le contenu d’un fichier BDS ne peut pas être vide. Tous les types d’enregistrements
doivent exister, même quand il n’y a pas d’informations à déclarer (ex : Nouvelle
affiliation).
 Un fichier BDS transmis sur le portail en mode EDI doit être un fichier conforme au
format exigé par le portail (extension doc, txt ou sans, structure conforme, ect..)
 Le nombre de jours (B02_N_Jours_Declares) doit être inférieur ou égal à 26.
 Le code situation (B02_L_Situation) doit appartenir à la liste des valeurs « situation » : « » ,
« SO », « DE », « IT », « IL », « AT », « CS », « MS » , « MP ».
 Le « salaire plafonné » doit être plafonné en fonction du plafond en vigueur à la période à
l’exception de la main d’œuvre occasionnelle.
 Le salaire plafonné doit être inférieur ou égal au salaire réel.
 Pour les situations « CS » et « MS » le nombre de jours et les salaires réels et plafonnés
doivent être nuls.
 Pour la situation « » le nombre de jours et les salaires réels et plafonnés doivent être
renseignés.
 Si le salarié a travaillé normalement, la présence du nombre de jours et du salaire est
obligatoire pour les enregistrements de type 3 et 4 et dans ce cas particulier le nombre
de jours doit être inférieur ou égal à 26 et supérieur à zéro.
 Le contrôle sur le salaire prend en compte la valeur du SMIG en vigueur et le
nombre de jours travaillés. En effet, si le salaire est inférieur au SMIG au prorata
du nombre de jours déclaré -1, le portail doit signaler une erreur non bloquante
.Exemples :
si le nombre de jours déclarés est 26, alors le salaire doit être supérieur
strictement au (SMIG/26) * 25 en vigueur.
si le nombre de jour déclaré est 13, alors le salaire déclaré doit être supérieur
strictement au SMIG/ 26 * 12. De manière général si n est le nombre de jours
déclarés le salaire doit être supérieur strictement au SMIG en vigueur/26*(n-
1).
La valeur du SMIG peut changer d’un mois à l’autre. Le portail gère les valeurs du
SMIG applicables pour chaque date d’effet. Le contrôle d’une TD se fait par
rapport au SMIG applicable de la période de TD. La valeur applicable à la
publication de ce document (septembre 2005) est de l’ordre de 184184 centimes
pour 26 jours travaillés.
 Pour la main d’œuvre occasionnelle (type d’enregistrement 5, Num_assuré) seul le
salaire global est déclaré sans nombre de jours ni numéro d’immatriculation et le
salaire plafonné doit être inférieur ou égale au salaire réel.
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

 Contrôler les totaux horizontaux en reproduisant les calculs sur le portail et comparer les
résultats avec le champ Contrôle.
 Contrôler les totaux verticaux. Les contrôles de cohérence entre les détails et les
enregistrements récapitulatifs doivent se faire et être valides pour ne pas procéder au rejet :
a. B03_N_Nbr_Salaries = le nombre des enregistrements de type « Détail de la
déclaration des salaires sur préétabli » (L_Type_Enreg = ‘B02’).
b. B03_N_T_Enfants = Somme(B02_N_Enfants)
c. B03_N_T_AF_A_Payer = Somme(B02_N_AF_A_Payer)
d. B03_N_T_AF_A_Deduire = Somme(B02_N_AF_A_Deduire)
e. B03_N_T_AF_Net_A_Payer = Somme(B02_N_AF_Net_A_Payer)
f. B03_N_T_Num_Imma = Somme(B02_N_Num_Imma)
g. B03_N_T_AF_A_Reverser = Somme(B02_N_AF_A_Reverser)
h. B03_N_T_Jours_Declares = Somme(B02_N_Jours_Declares)
i. B03_N_T_Salaire_Reel = Somme(B02_N_Salaire_Reel)
j. B03_N_T_Salaire_Plaf = Somme(B02_N_Salaire_Plaf)
k. B03_N_T_Ctr = Somme(B02_S_Ctr)
l. B05_N_Nbr_Salaries = le nombre des enregistrements de type « Détail de la
déclaration des salaires pour les Entrants » (L_Type_Enreg = ‘B04’) ou égal à 0 si
aucun entrant n’est déclaré (un enregistrement de type B04 existe et contient des
valeurs nulles)
m. B05_N_T_Num_Imma = Somme(B04_ N_Num_Imma)
n. B05_N_T_Jours_Declares = Somme(B04_N_Jours_Declares)
o. B05_N_T_Salaire_Reel = Somme(B04_N_Salaire_Reel)
p. B05_N_T_Salaire_Plaf = Somme(B04_N_Salaire_Plaf)
q. B05_N_T_Ctr = Somme(B04_S_Ctr)
r. B06_N_Nbr_Salaries = B03_N_Nbr_Salaries + B05_N_Nbr_Salaries
s. B06_N_T_Num_Imma = B03_N_T_Num_Imma + B05_ N_ T_Num_Imma
t. B06_N_T_Jours_Declares = B03_N_T_Jours_Declares +
B05_N_T_Jours_Declares
u. B06_N_T_Salaire_Reel = B03_N_T_Salaire_Reel + B05_N_T_Salaire_Reel
v. B06_N_T_Salaire_Plaf = B03_N_T_Salaire_Plaf + B05_N_T_Salaire_Plaf
w. B06_N_T_Ctr = B03_N_T_Ctr + B05_N_T_Ctr
x. B02_S_Ctr = B02_N_Num_Assure + B02_N_AF_A_Reverser +
B02_N_Jours_Declares + B02_N_Salaire_Reel + B02_N_Salaire_Plaf +
Rang de (B02_L_Situation)
y. B03_N_T_Ctr = Somme(B02_S_Ctr)
z. B04_S_Ctr = B04_N_Num_Assure + B04_N_Jours_Declares +
B04_N_Salaire_Reel + B04_N_Salaire_Plaf
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

Règles de contrôle de cohérence du fichier BDS principal
 Le BDS ne doit pas contenir des doublons pour un numéro d’immatriculé. Ce contrôle
ne s’applique pas aux n° d’immatriculés vides ou égales à 0 contenus dans les
enregistrements de type 5 (Salariés entrants).
 Au niveau des entrants, le numéro de CIN doit être unique dans une TD. Le contrôle
d’unicité se fait en supprimant les espaces et ne tient pas compte des minuscules et
majuscules. Exemple des déclarations de salaires effectué pour des entrants sans
numéros d’immatriculation à la CNSS et avec les deux Numéro de CIN suivants
doivent être considérer comme des déclarations doubles ( L 345 678 et l345678)
 La période du BDS doit être unique dans le fichier BDS et doit être égale à la période
du BDS qui a été choisie par l’utilisateur pour cette déclaration (l’utilisateur choisi
d’abord la période avant de déposer son fichier BDS).
 Le contrôle du numéro d’affilié (N_Num_Affilie) se fait uniquement pour les
déclarations en mode EDI :
 C1 : Par les algorithmes suivants : (contrôle à faire au niveau de
l’inscription)
Le numéro d’affilié est composé de 7 chiffres
(C1,C2,C3,C4,C5,C6,C7)
Il faut calculer (C2+C4+C6) X 2+C1+C3+C5 = un nombre composé
de deux chiffres.
On ne garde que le chiffre des unités. Si ce chiffre est égal à zéro
alors la clé C9 prend la valeur. Sinon on retranche ce chiffre des
unités de 10 pour avoir le chiffre de contrôle : C7
Exemple :
1 7 7 3 3 4 1
14+6+8 = 28
1+7+3 = 11
28+11 = 39 donc 9
Le dernier chiffre devrait être égal à 10 – 9 = 1
Le numéro d’affilié proposé est donc exact puisque 1 est égal au
dernier chiffre du numéro d’affilié.
 C2 : Le numéro d’affilié doit être unique dans le fichier BDS et doit
être égal au numéro d ‘affilié du compte affilié pour lequel cette
déclaration est déposée sur le portail.
 Le contrôle du numéro d’immatriculation se fait uniquement pour les entrants (B05_
N_Num_Assure). En effet, le contrôle des numéros d’immatriculation dans le cas des
assurés est géré par le contrôle global de conformité du BDS par rapport au préétabli (
Ce contrôle est présenté dans la suite de ce document).
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

Pour les assurés entrants, il faut respecter les règles suivantes :
 Le numéro d’immatriculation doit être accepté sans aucun contrôle s’il
est égal à 000000000 (salarié sans numéro). Dans ce cas le nom, le
prénom et le Numéro de la carte d’identité personnelle (CIN) du
salarié doit être fourni. Le système e-BDS averti l’utilisateur à fin de
donner des numéros d’immatriculation corrects. L’utilisateur peut
annuler les données transmises à fin de corriger les erreurs ou les
confirmer (Cas des salariés n’ayant pas encore obtenu leurs
numéros d’immatriculation). Dans ce dernier cas, le fichier BDS est
transféré à la CNSS qui se chargera du redressement des erreurs en
relation directe avec l’affilié.
 Le numéro d’immatriculation « 999999999 » doit être accepté (main
d’œuvre occasionnelle)
 Dans le cas ou l’affilié n’a aucun entrant à déclarer. Un seul enregistrement de
type B04 doit être créé en spécifiant la période, le numéro d’affilié et en
mentionnant 9 espaces vides ‘ ‘ dans le champ B04_ N_Num_Assure. Les
autres informations doivent être égales à Zéro si le type est N et égales à des
espaces si le type est AN.
 Si le numéro d’immatriculation est différent des cas cités ci-dessus, alors le
contrôle du numéro d’immatriculation se base sur régles suivantes :
Le premier chiffre doit être égale à 1
Le numéro doit respecter les algorithmes suivants :
Le numéro d’immatriculation est composé de 9 chiffres
(C1,C2,C3,C4,C5,C6,C7,C8,C9)
Il faut calculer (C2+C4+C6+C8)*2+C3+C5+C7 = un nombre composé de
deux chiffres
On ne garde que le chiffre des unités. Si ce chiffre est égal à zéro alors la clé
C9 prend la valeur. Sinon on retranche ce chiffre des unités de 10 pour avoir
le chiffre de contrôle : C9
Exemple :
1 6 8 7 6 4 7 2 1
12+14+8+4 = 38
8+6+7 = 21
38+21 = 59 donc 9
Le dernier chiffre devrait être égal à 10 – 9 = 1
Le numéro d’immatriculation proposé est donc juste puisque 1 est égal au
dernier chiffre du numéro d’immatriculation.
Une exception est faite par rapport à cette règle, elle concerne le numéro
d’immatriculation « 100000000 » qui n’est pas accepté par le portail.
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

 Le contrôle de non-conformité des lignes par rapport au préétabli concerne
uniquement les déclarations de salaires dans les enregistrements de type 1, 2, 3 et 4. Pour
une période et un affilié donnés, ce contrôle permet de vérifier la conformité exacte des
immatriculés dans le préétabli émis par la CNSS et le BDS transmis par l’affilié via le
portail e-BDS ainsi que la conformité des montants des AF reversés par l’affilié par rapport
à ceux alloués par la CNSS.
Le fichier de déclaration doit contenir l'ensemble des informations du fichier émission
enrichi par les informations suivantes : AF à reverser, Nombre de jours déclarés, Salaire
réel déclaré, Salaire plafonné déclaré, Situation.
Les contrôles qui doivent être fait dans ce cadre sont :
 Correspondance entre les identifiants des informations à transférer
(A00_N_Identif_Transfert = B0_N_Identif_Transfert)
 Correspondance de la concaténation de tous les champs en commun des
enregistrements A02, B02 et A03, B03
N.B.
B02_* = A02_* et B03_* = A03_*
B02_* = N_Num_Affilie + L_Période + N_Num_Assure + L_Nom_Prenom +
N_Enfants + N_AF_A_Payer + N_AF_A_Deduire + N_AF_Net_A_Payer
B03_* = N_Num_Affilie + L_Période + N_Nbr_Salaries + N_T_Enfants +
N_T_AF_A_Payer + N_T_AF_A_Deduire + N_T_AF_Net_A_Payer +
N_T_Num_Imma
 Correspondance des assurés et conformité des Allocations Familiales par rapport
au préétabli: Ce contrôle consiste à vérifier en se basant sur les lignes du
préétabli, la conformité des numéros d’immatriculation du BDS et des Allocations
Familiales :
 C1 : Si un numéro d’immatriculation du préétabli n’existe pas au niveau
du BDS transmis, alors le fichier BDS sera rejeté.( Ligne manquante).
 C2 : Si pour un immatriculé du BDS, le montant de l’AF reversé est
supérieur à celui alloué figurant dans le préétabli, alors le BDS sera
rejeté. Dans le cas des situations Sorti et Décédé, l'AF à reverser doit être
égale à l'AF net à payer.
 C 3 : Si le nombre d’immatriculés du BDS est supérieur à celui du
préétabli alors le BDS sera rejeté. (Ajout de lignes de déclarations de
salaires par rapport au préétabli).
Structure détaillée du fichier BDS complémentaire
5.1. Enregistrement type 1 « Nature du fichier communiqué »
Nom Désignation Type
(Longueur)
Début
L_Type_Enreg Type Enregistrement « Réservé». AN(3) 1

Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

Valeur = ‘E00’.
N_Identif_Transfert Identifiant des informations à transférer (Cette valeur doit être identique
à celle émise par la CNSS) pour la déclaration principale

AN(14) 4
L_Cat Catégorie des informations à transférer.

Valeur = ‘E[N]’ ou N est le numéro de séquence de la TD principale
AN(2) 18
L_filler Zone réservée AN(241) 20

5.2. Enregistrement type 2 « Entête Globale de la déclaration»
Nom Désignation Type(Longueur) Début
L_Type_ Enreg Type Enregistrement « Entête Globale de la déclaration
complémentaire».

Valeur = ‘E01’.
AN(3) 1
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7) 4

L_Période Mois et Année de la déclaration. N(6) 11

L_Raison_Sociale Raison Sociale de l’affilié N(40) 17

L_Activite Activité l’affilié AN(40) 57

L_Adresse Adresse de l’affilié N(120) 97

L_Ville Ville de l’affilié N(20) 217

C_Code_Postal Code Postal N(6) 237

C_Code_Agence Code de l’agence N(2) 243

D_Date_Emission Date de l’émission N(8) 245

C_Date_Exig Date limite de retour des BDS et de paiement des cotisations N(8) 253

Cet enregistrement doit être le même que celui de l’émission de la déclaration principale sauf pour la valeur du type
d’enregistrement qui sera égale à E01 au lieu de A01.

5.3. Enregistrement type 3 « Détail de la déclaration des salaires sur préétabli»
Nom Désignation Type
(Longueur)
Début Fin
L_Type_ Enreg Type Enregistrement « Détail de la déclaration des salaires sur
préétabli».

Valeur = ‘E02’
AN(3)^1            3
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

N_Num_Affilie Numéro d’affiliation de l’entreprise N(7)^4 10

L_Période Mois et Année de la déclaration N(6)^11 16

N_Num_Assure Numéro d’immatriculation de l’assuré. Ce champ contient des
espaces.

N(9)^17          25
L_Nom_Prenom Nom et prénom de l’assuré. Dans ce cas, ce champ sera renseigné
par des espaces (vides)

AN(60)^26          85
N_Enfants Nombre des enfants donnant droit aux allocations familiales. Dans ce
cas, ce champ sera renseigné avec des 0

N(2)^86          87
N_AF_A_Payer Montant des allocations familiales dues au titre du mois, à payer.
Dans ce cas, ce champ sera renseigné avec des 0

N(6)^88          93
N_AF_A_Deduire Montant des allocations familiales perçu antérieurement en trop, à
déduire du montant à payer. Dans ce cas, ce champ sera renseigné
avec des 0

N(6)^94          99
N_AF_Net_A_Payer Montant des allocations familiales net à payer. Dans ce cas, ce
champ sera renseigné avec des 0

N(6)^100        105
N_AF_A_Reverser Montant des allocations familiales à reverser. Dans ce cas, ce
champ sera renseigné avec des 0

N(6)^106        111
N_Jours_Declares Nombre de jours déclarés. Dans ce cas, ce champ sera renseigné
avec des 0

N(2)^112        113
N_Salaire_Reel Salaire réel déclaré. Dans ce cas, ce champ sera renseigné avec
des 0

N(13)^114        126
N_Salaire_Plaf Salaire déclaré dans la limite du plafond. Dans ce cas, ce champ
sera renseigné avec des 0

N(9)^127        135
L_Situation Situation de l’assuré.

Dans ce cas, ce champ sera renseigné avec des espaces (vides)
AN(2)^136        137
S_Ctr Dans ce cas, ce champ sera renseigné avec des 0 N(19)^138 156

L_filler Zone initialisée à des « espaces » AN(104)^157 260

Dans ce cas, le fichier BDS complémentaire contient une seule ligne de type E02.

5.4. Enregistrement type 4 « Récapitulatif de la déclaration des salaires sur
préétabli»
Nom Désignation Type
(Longueur)
Début Fin
L_Type_ Enreg Type Enregistrement « Récap de la déclaration des salaires sur
préétabli».

AN(3)^1            3
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

Valeur = ‘E03’.
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)^4 10

L_Période Mois et Année de la déclaration. N(6)^11 16

N_Nbr_Salaries Nombre des salariés. Dans ce cas, ce champ sera renseigné avec
des 0.

N(6)^17          22
N_T_Enfants Total des enfants donnant droit aux allocations familiales. Dans ce
cas, ce champ sera renseigné avec des 0.

N(6)^23          28
N_T_AF_A_Payer Total des montants des allocations familiales dues au titre du mois, à
payer. Dans ce cas, ce champ sera renseigné avec des 0.

N(12)^29          40
N_T_AF_A_Deduire Total des montants des allocations familiales perçu antérieurement en
trop, à déduire du montant à payer. Dans ce cas, ce champ sera
renseigné avec des 0.

N(12)^41          52
N_T_AF_Net_A_Payer Total des montants des allocations familiales net à payer. Dans ce
cas, ce champ sera renseigné avec des 0.

N(12)^53          64
N_T_Num_Imma Total des numéros d’immatriculations. Dans ce cas, ce champ sera
renseigné avec des 0.

N(15)^65          79
N_T_AF_A_Reverser Total des montants des allocations familiales à reverser. Dans ce cas,
ce champ sera renseigné avec des 0.

N(12)^80          91
N_T_Jours_Declares Total des jours déclarés. Dans ce cas, ce champ sera renseigné avec
des 0.

N(6)^92          97
N_T_Salaire_Reel Total des salaires réels déclarés. Dans ce cas, ce champ sera
renseigné avec des 0.

N(15)^98         112
N_T_Salaire_Plaf Total des salaires déclarés dans la limite du plafond. Dans ce cas, ce
champ sera renseigné avec des 0.

N(13)^113        125
N_T_Ctr Somme des Contrôles Horizontaux Déclarés. Dans ce cas, ce champ
sera renseigné avec des 0.

N(19)^126        144
L_filler Zone initialisée à des « espaces » AN(116)^145 260

5.5. Enregistrement type 5 « Détail déclaration des salaires pour les Entrants»
Nom Désignation Type (Longueur) Début Fin
L_Type_ Enreg Type Enregistrement « Détail déclaration complémentaire des
salaires pour les Entrants».

Valeur = ‘E04’.
AN(3)^1            3
N_Num_Affilie Numéro d’affiliation de l’entreprise. Dans ce cas, ce champ ne
doit être renseigné par des espaces (vides). Ceci dit, il faut

N(7)^4           10
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

obligatoirement avoir un entrant déclaré.
L_Période Mois et Année de la déclaration. N(6)^11 16

N_Num_Assure Numéro d’immatriculation de l’assuré N(9)^17 25

L_Nom_Prenom Nom de l’assuré AN(60)^26 85

L_Num_CIN N° de la Carte d’Identité Nationale de l’assuré AN(8)^86 93

N_Nbr_Jours Le nombre de jours travaillé par l’assuré. N(2)^94 95

N_Sal_Reel Le salaire brut réel non plafonné. N(13)^96 108

N_Sal_Plaf Le salaire plafonné. N(9)^109 117

S_Ctr Somme horizontale des rubriques suivantes :
N_Num_Assure, N_Jours_Declares, N_Salaire_Reel,
N_Salaire_Plaf.

N(19)^118        136
L_filler Zone initialisée à des « espaces » AN(124)^137 260

5.6. Enregistrement type 6 « Récap de la déclaration des salaires entrants»
Nom Désignation Type(Longueur) Début Fin
L_Type_ Enreg Type Enregistrement « Récap de la déclaration complémentaire
des salaires entrants».

Valeur = ‘E05’.
AN(3)^1            3
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)^4 10

L_Période Mois et Année de la déclaration. N(6)^11 16

N_Nbr_Salaries Nombre des salariés entrants. N(6)^17 22

N_T_Num_Imma Total des numéros d’immatriculations N(15)^23 37

N_T_Jours_Declares Total des jours déclarés. N(6)^38 43

N_T_Salaire_Reel Total des salaires réels déclarés. N(15)^44 58

N_T_Salaire_Plaf Total des salaires déclarés dans la limite du plafond. N(13)^59 71

N_T_Ctr Somme des Contrôles Horizontaux Déclarés. N(19)^72 90

L_filler Zone initialisée à des « espaces » AN(170)^91 260

5.7. Enregistrement type 7 « Récapitulatif Globale de la déclaration des
salaires»
Nom Désignation Type(Longuer) Début Fin
L_Type_ Enreg Type Enregistrement « Récap Globale de la déclaration^1 3
complémentaire des salaires».

AN(3)
Valeur = ‘E06’.
N_Num_Affilie Numéro d’affiliation de l’entreprise. N(7)^4 10

L_Période Mois et Année de la déclaration. N(6)^11 16

N_Nbr_Salaries Nombre des salariés (entrants + existants). N(6)^17 22

N_T_Num_Imma Total des numéros d’immatriculations N(15)^23 37

N_T_Jours_Declares Total des jours déclarés (entrants + existants). N(6)^38 43

N_T_Salaire_Reel Total des salaires réels déclarés (entrants + existants).. N(15)^44 58

N_T_Salaire_Plaf Total des salaires déclarés dans la limite du plafond (entrants +^59 71
existants)..

N(13)
N_T_Ctr Somme des Contrôles Horizontaux Déclarés. N(19)^72 90

L_filler Zone initialisée à des « espaces » AN(170)^91 260

Règles de Contrôle du fichier BDS complémentaire
6.1. Contrôle du format :
Même contrôle appliqué pour les télédéclarations principales (sans assurés).

6.2. Contrôle syntaxique :
Même contrôle appliqué pour les télédéclarations principales (sans assurés). Toutefois, les contrôles par rapport au
préétablis sont applicables dans ce contexte uniquement pour l’ enregistrement de type 1et 2 et ce par rapport au
préétabli de la période concernée.

D’autres controles supplémentaires sont appliquables dans le cas d’une TD complémentaire :

Contrôle de l’unicité du numéro imma pour une période : Le N° d’immatriculation déclaré
dans une TD complementaire ne doit pas figurer dans la TD principale ou dans une autre
TD complémentaire concernant la même période.
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

Contrôle de l’unicité du numéro CIN pour une période : en cas d’absence d’un N°imma, Le
N° CIN déclaré dans une TD complémentaire ne doit pas ficgurer dans la TD principale ou
dans une autre TD complémentaire concernant la même période.
Code des erreurs de télédéclarations dans le système e-BDS :
A la réception d’un fichier BDS, le système e-BDS procède au contrôle de son contenu et
de sa structure. Dans le cas le système e-BDS détecte des erreurs dues à la non
conformité du fichier BDS para rapport au règles citées ci-dessus, la liste des erreurs
détectées sera affichée à l’utilisateur via l’interface web du portail. Cette liste indique la
ligne au niveau du BDS contenant l’erreur ainsi que le code et la description de cette
dernière et éventuellement le numéro d’immatriculation de l’assuré en question.
Les erreurs de contrôle des fichiers e-BDS sont codifiés comme suit :
Note :
Les paramètres présentés entre deux crochets sont remplacés par les valeurs
correspondantes au niveau du fichier BDS ou du préétabli associé.
Une erreur bloquante engendre le rejet total d’une télédéclaration.
Une erreur de type Warning est signalée par le système e-BDS et engendre une validation
avec réserve de la déclaration de salaires.
Code d'erreur Type d’enregistrement : Description de l’erreur
Type
d'erreur
2 B00 /E00: Longueur de l'enregistrement doit être égale à 260 caractères. Bloquante
102 B00 / E00: Type d'enregistrement doit être égal à "B00 /E00". Bloquante
202
B00/ E00: Identifiant des informations à transférer doit correspondre à celui du BDS/AF préétabli :[
A00_N_Identif_Transfert] Bloquante
302 B00/ E00: Catégorie des informations à transférer doit être égale à "B0/E[N]". Bloquante
12 B01/ E01: Longueur de l’enregistrement doit être égale à 260 caractères Bloquante
112 B01/ E01: Type d'enregistrement doit être égal à "B01/ E01" Bloquante
212 B01/ E01: Numéro d'affiliation de l'entreprise doit être égal à:[A01_ N_Num_Affilie]. Bloquante
312 B01/ E01: Période de la déclaration doit être égale à :[ A01_ L_Période] Bloquante
412 B01/ E01: Raison sociale doit être égale à :[ A01_L_Raison_Sociale] Bloquante
512 B01/ E01: Activité doit être égale à :[ A01_ L_Activité] Bloquante
612 B01/ E01: Adresse doit être égale à :[ A01_ L_Adresse] Bloquante
712 B01/ E01: Ville doit être égale à :[ A01_ L_Ville] Bloquante
812 B01/ E01: Code postale doit être égal à :[ A01_ C_Code_Postal] Bloquante
912 B01/ E01: Code de l’agence doit être égal à :[ A01_ C_Code_Agence] Bloquante
1012 B01/ E01: Date d'émission de la déclaration doit être égale à :[ A01_ D_Date_Emission] Bloquante
1112 B01/ E01: Date d'exigibilité de la déclaration doit être égale à :[ A01_ D_Date_Exig] Bloquante
22 B02/ E02: Longueur de l’enregistrement doit être égale à 260 caractères Bloquante
122 B02/ E02: Type d'enregistrement doit être égal à "B02 / E02" Bloquante
222 B02/ E02: Numéro d'affiliation de l'entreprise doit être égal à:[ A02_ N_Num_Affilie] Bloquante
322 B02/ E02: Période de la déclaration doit être égale à :[ A02_ L_Période] Bloquante
422 B02: Assuré ne figurant pas dans le BDS/AF préétabli:[ A02_ N_Num_Assure] Bloquante
-422 B02: Assure doit être dans le même ordre que le BDS/AF préétabli : Bloquante
428 B02: Déclaration de salaire en double : [B04_nom_prenom] Bloquante
-428 B02 : Assuré figure dans le BDS/AF et ne figure pas dans la DS reçue :[ A02_ N_Num_Assure] Bloquante
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

1822 E02: Numéro d’immatriculation de l’assuré doit être égale à 9 espaces Bloquante
522 B02: Nom et prénom doit correspondre à celui du BDS/AF préétabli : [A02_ L_Nom_Prenom] Bloquante
622 B02: Nombre d'enfants doit correspondre à celui du BDS/AF préétabli :[ A02_ N_Enfants] Bloquante
722 B02: Montant des allocations familiales doit correspondre à celui du BDS/AF préétabli :[ A02_ N_AF_A_Payer] Bloquante
822
B02: Montant des allocations familiales perçu antérieurement en trop, à déduire du montant à payer doit correspondre
à celui du BDS/AF préétabli :[ A02_ N_AF_A_Deduire] Bloquante
922
B02: Montant des allocations familiales net à payer doit correspondre à celui du BDS/AF préétabli [A02_
N_AF_Net_A_Payer] Bloquante
1022
B02 : Montant des allocations familiales à reverser doit être numérique et inférieur ou égal au montant AF net à payer :[
A02_ N_AF_Net_A_Payer] Bloquante
1122 B02 : Nombre de jours déclarés doit être de valeur [SI!= « »? nulle :non nulle et inférieur ou égale à 26] Bloquante
-1122 B02 : Nombre de jours déclarés doit être de valeur nulle Bloquante
1222 B02 : Salaire réel doit être de valeur supérieur à 0 Bloquante
-1222 B02 : Salaire réel doit être de valeur nulle Bloquante
1322
B02: Salaire déclaré dans la limite du plafond doit être égale à : [valeur du salaire plafonné en vigueur pour cette
période] Bloquante
1622
B02: Le salaire réel et le nombre de jours déclarés ne respectent pas le SMIG en vigueur. Veuillez
vérifier que les valeurs saisies sont en centimes!'
warning
1422
B02 : Code situation doit être égal soit à
(" ","SO","DE","IT","IL","AT","CS","MS","MP") Bloquante
1522 B02/ E03: Somme horizontale est erronée Bloquante
32 B03/ E03: Longueur de l’enregistrement doit être égale à 260 caractères Bloquante
132 B03/ E03: Type d'enregistrement doit être égal à "B03/ E03" Bloquante
232 B03/ E03: Numéro d'affiliation de l'entreprise doit être égal à:[ A0 3_ N_Num_Affilie]. Bloquante
332 B03/ E03: Période de la déclaration doit être égale à :[ A03_ L_Période Bloquante
432
B03: Nombre des salariés déclarés doit correspondre à celui des salariés émis dans le BDS/AF préétabli : [A03_
N_Nbr_Salaries] Bloquante
532 B03: Total des enfants donnant droit aux allocations familiales devrait être égal à :[ A03_ N_T_Enfants] Bloquante
632
B03: Total des montants des allocations familiales dues au titre du mois, à payer doit être égal à :[ A03_
N_T_AF_A_Payer] Bloquante
732
B03: Total des montants des allocations familiales perçu antérieurement en trop, à déduire du montant à payer est
erroné Bloquante
832 B03/ E03: Total des montants des allocations familiales net à payer est erroné Bloquante
932 B03/ E03: Total des numéros d'immatriculations est erroné Bloquante
1032 B03/ E03: Total des montants des allocations familiales à reverser est erroné Bloquante
1132 B03/ E03: Total des jours déclarés est erroné Bloquante
1232 B03/ E03: Total des salaires réels déclarés est erroné Bloquante
1332 B03/ E03: Total des salaires déclarés dans la limite du plafond est erroné Bloquante
1432 B03/ E03: Somme des Contrôles Horizontaux Déclarés est erronée Bloquante
42 B04/ E04: Longueur de l’enregistrement doit être égale à 260 caractères Bloquante
142 B04/ E04: Type d'enregistrement doit être égal à "B04" Bloquante
242 B04/ E04: Numéro d'affiliation de l'entreprise doit être égal à:[ A01_ N_Num_Affilie] Bloquante
342 B04/ E04: Période de la déclaration doit être égale à :[ A01_ L_Période] Bloquante
442 B04/ E04: Numéro d’immatriculation erroné : [B04_N_Num_Assure] Bloquante
448
B04/ E04: Déclaration de salaire en double pour l'assuré entrant :[ B04_N_Num_Assure] [ B04_N_Nom_prenom ] /[
E04_N_Num_Assure] [ E04_N_Nom_prenom ]
Bloquante
-442
B04/E04: WARNING: Afin de sauvegarder les droits de vos employés vous etes tenus de les immatriculer et de les
déclarer sous leurs numéros d’immatriculations. Nom/Prénom : [B04_nom_prenom] /[E04_nom_prenom] warnning
542
B04/E04 : Nom /Prénom doit être fournit pour l’assuré entrant et composé de caractères alphanumériques.. la liste des
caractères acceptés. Bloquante
-542 B04/E04 : Nom /Prénom ne doit pas être renseigné. Bloquante
642
B04/E04: N° de la Carte d'Identité Nationale doit être fournit pour l'assuré entrant et composé de caractères
alphanumériques. Nom/Prénom : [B04_L_Nom_Prenom] /[E04_L_Nom_Prenom] la liste des caractères acceptés. Bloquante
-642 B04/E04: N° de la Carte d'Identité Nationale ne doit pas être renseigné Bloquante
742
B04/E04 : Nombre de jours déclarés doit être de valeur supérieur à 0 et inférieur ou égale à 26. Nom/Prénom :
[B04_nom_prenom]/ [E04_nom_prenom] Bloquante
-742 B04: Nombre de jours déclarés doit être de valeur nulle. Bloquante
842 B04/E04 : Salaire réel doit être de valeur supérieur à 0. Nom/Prénom : [B04_nom_prenom]/ [E04_nom_prenom] Bloquante
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

-842 B04: Salaire réel doit être de valeur nulle. Bloquante
942
B04/E04 : Salaire déclaré dans la limite du plafond doit être inférieur ou égal à : (salaire réel ou salaire plafonné en
vigueur) Bloquante
1642
B04/E04 : Le salaire réel et le nombre de jours déclarés ne respectent pas le SMIG en vigueur. Veuillez
vérifier que les valeurs saisies sont en centimes!
warning
1042 B04/E04 : Somme horizontale est erronée Bloquante
52 B05/E05 : Longueur de l’enregistrement doit être égale à 260 caractères Bloquante
152 B05/E05 : Type d'enregistrement doit être égal à "B05" Bloquante
252 B05/E05 : Numéro d'affiliation de l'entreprise doit être égal à:[ A01_ N_Num_Affilie]. Bloquante
352 B05/E05 : Période de la déclaration doit être égale à :[ A01_ L_Période] Bloquante
452 B05/E05 : Nombre des salariés entrants est erroné Bloquante
552 B05/E05 : Total des numéros d'immatriculations des entrants est erroné Bloquante
652 B05/E05 : Total des jours déclarés est erroné Bloquante
752 B05/E05 : Total des salaires réels déclarés est erroné Bloquante
852 B05/E05 : Total des salaires déclarés dans la limite du plafond est erroné Bloquante
952 B05/E05 : Somme des Contrôles Horizontaux Déclarés est erroné Bloquante
1152 E05: Une DS complémentaire ne peut pas être sans entrants Bloquante
62 B06/E06 : Longueur de l’enregistrement doit être égale à 260 caractères Bloquante
162 B06/ E06: Type d'enregistrement doit être égal à "B06" Bloquante
262 B06/E06: Numéro d'affiliation de l'entreprise est erroné Bloquante
362 B06/E06: Période de la déclaration est erronée Bloquante
462 B06/E06: Nombre des salariés (salariés entrants + salariés émis) est erroné Bloquante
562 B06/E06: Total des numéros d'immatriculations (salariés entrants + salariés émis) est erroné Bloquante
662 B06/E06: Total des jours déclarés (salariés entrants + salariés émis) est erroné Bloquante
762 B06/E06: Total des salaires(entrants + émis) réels déclarés est erroné Bloquante
862 B06/E06: Total des salaires(entrants + émis) déclarés dans la limite du plafond est erroné Bloquante
962 B06/E06: Somme globale des Contrôles Horizontaux Déclarés est erroné Bloquante
-222 Taille du fichier est trop grande Bloquante
-333 Fin de fichier incorrect Warning
Liste des codes ASCII accéptés dans le système e-BDS :
Les chaînes alphanumériques constituant le nom, le prénom et le N° de la CIN des salariés
sont basées sur les codes ASCII suivants :
Caractère Code ASCII Code Hexadécimal
Espace 32 20
Tabulation 9 09
A 65 41
B 66 42
C 67 43
D 68 44
E 69 45
F 70 46
G 71 47
H 72 48
I 73 49
J 74 4A
K 75 4B
L 76 4C
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

M 77 4D
N 78 4E
O 79 4F
P 80 50
Q 81 51
R 82 52
S 83 53
T 84 54
U 85 55
V 86 56
W 87 57
X 88 58
Y 89 59
Z 90 5A
0 48 30
1 49 31
2 50 32
3 51 33
4 52 34
5 53 35
6 54 36
7 55 37
8 56 38
9 57 39
Cahier des Charges relatif à la réalisation des déclarations des salaires en Mode Echange de Fichier entre la CNSS et ses Affiliés V2

V. GLOSSAIRE

Portail e-BDS : Le système de télédéclaration et de télépaiement de la CNSS.
Espace Privé : Zone du portail e-BDS dont l’accès nécessite la possession d’un certificat
numérique ainsi que des droits de connexion.
SI de la CNSS : Services Internes de la CNSS
SI des affiliés : système de gestion de paie de l’entreprise affilié à la CNSS.
BDS : Bordereau de déclarations des salaires
Fichier BDS : Fichier informatique contenant les éléments du BDS en respectant le format
d’échange de la CNSS.
Préétabli : Bordereau envoyé mensuelment par la CNSS à l’affilié. Il présente la situation de
l’affilié.
Le fichier préétabli : Fichier Informatique contenant les éléments du préétabli. C’est un fichier
téléchargeable par l’affilié via le système e-BDS.
Mode EDI : Télétransmission de la déclaration par dépôt d’un fichier BDS sur le portail e-BDS.
Mode EFI : Télétransmission de la déclaration via un formulaire électronique sur le portail e-
BDS.